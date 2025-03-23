from datetime import timedelta

from django.contrib.auth import authenticate
from django.forms import ValidationError
from django.http import JsonResponse
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated

from .signals import (
    calculate_category_spending,
    calculate_total_spending,
    get_spending_periods,
)

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
        receipts = Receipt.objects.filter(user=request.user)
        serializer = ReceiptSerializer(receipts, many=True)
        return Response({"receipts": serializer.data}, status=status.HTTP_200_OK)


class ReceiptDetail(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        receipt = Receipt.objects.filter(user=request.user, id=pk).first()
        if receipt is None:
            return Response(
                {"error": "Receipt not found"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = ReceiptSerializer(receipt, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        receipt = Receipt.objects.filter(user=request.user, id=pk).first()
        if receipt is None:
            return Response(
                {"error": "Receipt not found"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = ReceiptSerializer(receipt, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        receipt = Receipt.objects.filter(user=request.user, id=pk).first()
        if receipt is None:
            return Response(
                {"error": "Receipt not found"}, status=status.HTTP_404_NOT_FOUND
            )

        receipt.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def get(self, request, pk):
        receipt = Receipt.objects.filter(user=request.user, id=pk).first()
        if receipt is None:
            return Response(
                {"error": "Receipt not found"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = ReceiptSerializer(receipt)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ItemOverview(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, receipt_pk):
        receipt = Receipt.objects.filter(user=request.user, id=receipt_pk).first()
        if receipt is None:
            return Response(
                {"error": "Receipt not found"}, status=status.HTTP_404_NOT_FOUND
            )
        serializer = ItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(receipt=receipt)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, receipt_pk):
        items = Item.objects.filter(receipt__user=request.user, receipt_id=receipt_pk)
        serializer = ItemSerializer(items, many=True)
        return Response({"items": serializer.data}, status=status.HTTP_200_OK)


class ItemDetail(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, receipt_pk, pk):
        item = Item.objects.filter(
            receipt__user=request.user, receipt_id=receipt_pk, id=pk
        ).first()
        if item is None:
            return Response(
                {"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = ItemSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, receipt_pk, pk):
        item = Item.objects.filter(
            receipt__user=request.user, receipt_id=receipt_pk, id=pk
        ).first()
        if item is None:
            return Response(
                {"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = ItemSerializer(item, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, receipt_pk, pk):
        item = Item.objects.filter(
            receipt__user=request.user, receipt_id=receipt_pk, id=pk
        ).first()
        if item is None:
            return Response(
                {"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND
            )
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def get(self, request, receipt_pk, pk):
        item = Item.objects.filter(
            receipt__user=request.user, receipt_id=receipt_pk, id=pk
        ).first()
        if item is None:
            return Response(
                {"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = ItemSerializer(item)
        return Response(serializer.data, status=status.HTTP_200_OK)


class GroupOverview(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        groups = Group.objects.filter(members__user=request.user)
        serializer = GroupSerializer(groups, many=True)
        return Response({"groups": serializer.data}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = GroupSerializer(data=request.data)
        if serializer.is_valid():
            group = serializer.save()
            # Add creator as a member
            GroupMembers.objects.create(group=group, user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GroupDetail(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        group = Group.objects.filter(members__user=request.user, id=pk).first()
        if group is None:
            return Response(
                {"error": "Group not found"}, status=status.HTTP_404_NOT_FOUND
            )
        serializer = GroupSerializer(group, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        group = Group.objects.filter(members__user=request.user, id=pk).first()
        if group is None:
            return Response(
                {"error": "Group not found"}, status=status.HTTP_404_NOT_FOUND
            )
        serializer = GroupSerializer(group, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        group = Group.objects.filter(members__user=request.user, id=pk).first()
        if group is None:
            return Response(
                {"error": "Group not found"}, status=status.HTTP_404_NOT_FOUND
            )
        group.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def get(self, request, pk):
        group = Group.objects.filter(members__user=request.user, id=pk).first()
        if group is None:
            return Response(
                {"error": "Group not found"}, status=status.HTTP_404_NOT_FOUND
            )
        serializer = GroupSerializer(group)
        return Response(serializer.data, status=status.HTTP_200_OK)


class GroupMembersOverview(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, group_pk):
        if not Group.objects.filter(members__user=request.user, id=group_pk).exists():
            return Response(
                {"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN
            )
        members = GroupMembers.objects.filter(group_id=group_pk)
        serializer = GroupMembersSerializer(members, many=True)
        return Response({"members": serializer.data})

    def post(self, request, group_pk):
        group = Group.objects.filter(members__user=request.user, id=group_pk).first()
        if not group:
            return Response(
                {"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN
            )
        serializer = GroupMembersSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(group=group)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GroupMembersDetail(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, group_pk, pk):
        if not Group.objects.filter(members__user=request.user, id=group_pk).exists():
            return Response(
                {"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN
            )
        member = GroupMembers.objects.filter(group_id=group_pk, id=pk).first()
        if member is None:
            return Response(
                {"error": "Member not found"}, status=status.HTTP_404_NOT_FOUND
            )
        serializer = GroupMembersSerializer(member)
        return Response(serializer.data)

    def put(self, request, group_pk, pk):
        if not Group.objects.filter(members__user=request.user, id=group_pk).exists():
            return Response(
                {"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN
            )
        member = GroupMembers.objects.filter(group_id=group_pk, id=pk).first()
        if member is None:
            return Response(
                {"error": "Member not found"}, status=status.HTTP_404_NOT_FOUND
            )
        serializer = GroupMembersSerializer(member, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, group_pk, pk):
        if not Group.objects.filter(members__user=request.user, id=group_pk).exists():
            return Response(
                {"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN
            )
        member = GroupMembers.objects.filter(group_id=group_pk, id=pk).first()
        if member is None:
            return Response(
                {"error": "Member not found"}, status=status.HTTP_404_NOT_FOUND
            )
        member.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
def register(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def login(request):
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


@api_view(["POST"])
def logout(request):
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
        return Response(
            {"error": "An error occurred during logout"},
            status=status.HTTP_400_BAD_REQUEST,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user
    return Response(
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "phone_number": user.phone_number,
        }
    )


class SpendingAnalyticsView(generics.ListAPIView):
    serializer_class = SpendingAnalyticsSerializer
    permission_classes = [IsAuthenticated]

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
            return JsonResponse(
                {"error": "Could not find start date for the period"}, status=400
            )

        try:
            # Pass the correct parameters to get_spending_analytics
            analytics = self.get_spending_analytics(user_id, period, start_date)
            return Response(analytics)

        except ValidationError as e:
            return Response({"error": str(e)}, status=400)
