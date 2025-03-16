import logging
from django.contrib.auth import authenticate
from django.forms import ValidationError
from django.http import JsonResponse
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model

from .signals import calculate_category_spending, calculate_total_spending, get_spending_periods

from .models import Receipt, Item, Group, GroupMembers, User, SpendingAnalytics
from .notifications import notify_group_receipt_added

from .serializers import (
    ReceiptSerializer,
    ItemSerializer,
    GroupSerializer,
    GroupMembersSerializer,
    SpendingAnalyticsSerializer,
    UserSerializer,
)


# TODO: When Account and Authentication are implemented, GET request for items should only return items from the Account


class ReceiptOverview(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ReceiptSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            # Notifications
            if serializer.data.get("group") is not None:
                notify_group_receipt_added(serializer.data.get("group"))


            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        # if id is None:
        #     receipt = Receipt.objects.filter(user=request.user, id=id).first()
        #     if receipt is None:
        #         return Response({"error": "Receipt not found"}, status=status.HTTP_404_NOT_FOUND)

        #     serializer = ReceiptSerializer(receipt)
        #     return Response(serializer.data, status=status.HTTP_200_OK)
        receipts = Receipt.objects.filter(user=request.user)
        serializer = ReceiptSerializer(receipts, many=True)
        return Response({"receipts": serializer.data}, status=status.HTTP_200_OK)


class ReceiptDetail(generics.RetrieveUpdateDestroyAPIView):
    # permission_classes = [IsAuthenticated]
    serializer_class = ReceiptSerializer
    queryset = Receipt.objects.all()


class ItemList(generics.ListCreateAPIView):
    # permission_classes = [IsAuthenticated]
    serializer_class = ItemSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({"items": serializer.data})

    def get_queryset(self):
        # Filter items by the receipt_id provided in the URL
        return Item.objects.filter(receipt_id=self.kwargs["receipt_id"])

    # Handle POST request to create a new item under a specific receipt
    def perform_create(self, serializer):
        receipt = Receipt.objects.get(
            id=self.kwargs["receipt_id"]
        )  # Checks if the receipt with ID exists
        serializer.save(receipt=receipt)


class ItemDetail(generics.RetrieveUpdateDestroyAPIView):
    # permission_classes = [IsAuthenticated]
    serializer_class = ItemSerializer

    # Not 100% sure whether this works
    def get_object(self):
        return Item.objects.get(receipt=self.kwargs["receipt_id"], id=self.kwargs["pk"])


class GroupList(generics.ListCreateAPIView):
    # permission_classes = [IsAuthenticated]
    serializer_class = GroupSerializer
    queryset = Group.objects.all()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({"groups": serializer.data})


class GroupDetail(generics.RetrieveUpdateDestroyAPIView):
    # permission_classes = [IsAuthenticated]
    serializer_class = GroupSerializer
    queryset = Group.objects.all()


class GroupMembersList(generics.ListCreateAPIView):
    # permission_classes = [IsAuthenticated]
    serializer_class = GroupMembersSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({"members": serializer.data})

    def get_queryset(self):
        return GroupMembers.objects.filter(group_id=self.kwargs["group_id"])

    def perform_create(self, serializer):
        group = Group.objects.get(id=self.kwargs["group_id"])
        serializer.save(group=group)


class GroupMembersDetail(generics.RetrieveUpdateDestroyAPIView):
    # permission_classes = [IsAuthenticated]
    serializer_class = GroupMembersSerializer

    def get_object(self):
        return GroupMembers.objects.get(
            group=self.kwargs["group_id"], id=self.kwargs["pk"]
        )


class UserRegisterView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLoginView(APIView):
    def post(self, request):
        identifier = request.data.get("identifier")
        password = request.data.get("password")

        if not identifier or not password:
            return Response(
                {"error": "Username/email and password are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.filter(email=identifier).first()
        username = user.username if user else identifier
        user = authenticate(request, username=username, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                }
            )
        return Response(
            {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
        )


class UserLogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")

            if not refresh_token:
                return Response(
                    {"error": "Refresh token is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response(
                {"message": "Successfully logged out"}, status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response({"error": "An error occurred during logout"}, status=status.HTTP_400_BAD_REQUEST)


class SpendingAnalyticsView(generics.ListAPIView):
    serializer_class = SpendingAnalyticsSerializer
    # permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user

        # return SpendingAnalytics.objects.filter(user=user).order_by("-date")
        return SpendingAnalytics.objects.all().order_by("-date")

    def get_spending_analytics(self, user_id, period, start_date):
        """
        View to return spending analytics for a specific user and period.
        :param user_id: The user for whom the analytics are being requested.
        :param period: The time period (e.g., "Weekly", "Monthly", etc.) for which data is needed.
        """
        # logger.info(f"Fetching category spending for user {user_id} and start date {start_date}")
        # Fetch category spending for the given user_id and start_date
        category_spending = calculate_category_spending(user_id, start_date)
        # logger.info(f"Category spending: {category_spending}")

        # logger.info(f"Fetching total spending for user {user_id} and start date {start_date}")
        total_spending = calculate_total_spending(user_id, start_date)
        # logger.info(f"Total spending: {total_spending}")

        # Return the data as a dictionary (which will later be converted to JSON by JsonResponse)
        return {
            "category_spending": category_spending,
            "total_spending": total_spending,
            "period": period,
            "date": start_date,
        }
    
    def get(self, request, user_id, period):
        """
        Handles GET requests to return spending analytics for a user and a specific period.
        """
        # Log the correct user_id and period
        # logger.info(f"Fetching category spending for user {user_id} and period {period}")

        valid_periods = ["Weekly", "Monthly", "Quarterly", "Yearly"]
        if period not in valid_periods:
            return JsonResponse({"error": "Invalid period"}, status=400)

        periods = get_spending_periods()
        start_date = periods.get(period)

        if not start_date:
            return JsonResponse({"error": "Could not find start date for the period"}, status=400)

        try:
            # Pass the correct parameters to get_spending_analytics
            analytics = self.get_spending_analytics(user_id, period, start_date)
            return Response(analytics)

        except ValidationError as e:
            return Response({"error": str(e)}, status=400)
