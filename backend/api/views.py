import boto3
from django.conf import settings
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
from ocr.receipt_processor_gpt import process_receipt
import os

from .signals import (
    calculate_category_spending,
    calculate_total_spending,
    get_spending_periods,
)
from .models import Folder, Receipt, Item, Group, GroupMembers, User, Subscription, Insights
from .notifications import notify_group_receipt_added
from .serializers import (
    FolderSerializer,
    ReceiptSerializer,
    ItemSerializer,
    GroupSerializer,
    GroupMembersSerializer,
    InsightsSerializer,
    UserSerializer,
    SubscriptionSerializer,
)


class ReceiptOverview(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Add the user to the request data
        request.data["user"] = request.user.id
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


class GetUserIdView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id = request.user.id
        return Response({"user_id": user_id}, status=status.HTTP_200_OK)


class GroupDelete(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Group.objects.all()

    def delete(self, request, *args, **kwargs):
        group = self.get_object()
        if group.creator != request.user:
            return Response(
                {"error": "You are not the creator of the group."},
                status=status.HTTP_403_FORBIDDEN,
            )

        group.delete()
        return Response(
            {"message": "Group deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )


class GroupMembersLeave(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = GroupMembersSerializer

    def get_object(self):
        return GroupMembers.objects.get(
            group=self.kwargs["group_id"], user=self.request.user
        )

    def delete(self, request, *args, **kwargs):
        group_member = self.get_object()
        group = group_member.group

        if group.creator == request.user:
            return Response(
                {"error": "Use the 'deleteGroup' route to delete the entire group."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        group_member.delete()
        return Response(
            {"message": "User has left the group."}, status=status.HTTP_204_NO_CONTENT
        )


class GroupList(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = GroupSerializer

    def get_queryset(self):
        """Return only the groups where the user is a member."""
        return Group.objects.filter(groupmembers__user=self.request.user)

    def perform_create(self, serializer):
        group = serializer.save(creator=self.request.user)
        GroupMembers.objects.create(group=group, user=self.request.user)


class GroupDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = GroupSerializer
    queryset = Group.objects.all()


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


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.conf import settings
import boto3
import uuid
import os

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def receipt_upload(request):
    """Upload receipt image to S3, run GPT OCR using the public S3 URL, and return receipt data."""
    receipt_image = request.FILES.get("receipt_image")

    if not receipt_image:
        return Response({"error": "No receipt image provided"}, status=400)

    try:
        # 1) Generate unique filename
        file_ext = os.path.splitext(receipt_image.name)[-1] or ".jpg"
        file_key = f"receipts/{uuid.uuid4().hex}{file_ext}"

        # 2) Upload to S3
        s3_client = boto3.client(
            "s3",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME,
        )

        s3_client.upload_fileobj(
            receipt_image.file,
            settings.AWS_STORAGE_BUCKET_NAME,
            file_key,
            ExtraArgs={"ContentType": receipt_image.content_type},
        )

        # 3) Build public S3 URL
        receipt_url = f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/{file_key}"

        # 4) Run GPT-based OCR using public image URL
        ocr_result = process_receipt(receipt_url, user_id=request.user.id)

        # 5) Add the S3 URL to the result
        ocr_result["receipt_image_url"] = receipt_url

        return Response(ocr_result, status=200)

    except Exception as e:
        return Response({"error": f"Upload or OCR failed: {str(e)}"}, status=400)

class SubscriptionList(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SubscriptionSerializer
    queryset = Subscription.objects.all()

    def get_queryset(self):
        return Subscription.objects.filter(user=self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({"subscriptions": serializer.data})


class SubscriptionDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SubscriptionSerializer
    queryset = Subscription.objects.all()

    def get_queryset(self):
        return Subscription.objects.filter(user=self.request.user)


class InsightsView(generics.ListAPIView):
    serializer_class = InsightsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Insights.objects.filter(user=user).order_by("-date")

    def get_insights(self, user, period, start_date):
        category_spending = calculate_category_spending(user, start_date)
        total_spending = calculate_total_spending(user, start_date)

        return {
            "category_spending": category_spending,
            "total_spending": total_spending,
            "period": period,
            "date": start_date,
        }

    def get(self, request, period):
        user = request.user

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
            insights = self.get_insights(user, period, start_date)
            return Response(insights)

        except ValidationError as e:
            return Response({"error": str(e)}, status=400)
        
class FolderListCreate(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        folders = Folder.objects.filter(user=request.user)
        serializer = FolderSerializer(folders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = FolderSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FolderDetail(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        folder = Folder.objects.filter(user=request.user, id=pk).first()
        if folder is None:
            return Response({"error": "Folder not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = FolderSerializer(folder, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()  
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        folder = Folder.objects.filter(user=request.user, id=pk).first()
        if folder is None:
            return Response(
                {"error": "Folder not found"}, status=status.HTTP_404_NOT_FOUND
            )
        folder.receipts.update(color="#FFFFFF")
        folder.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    def get(self, request, pk):
        folder = Folder.objects.filter(user=request.user, id=pk).first()
        if folder is None:
            return Response(
                {"error": "Folder not found"}, status=status.HTTP_404_NOT_FOUND
            )
        serializer = FolderSerializer(folder)
        return Response(serializer.data, status=status.HTTP_200_OK)

class FolderReceipt(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk, receipt_id):
        receipt = Receipt.objects.filter(id=receipt_id, user=request.user).first()
        if receipt is None:
            return Response({"error": "Receipt not found"}, status=status.HTTP_404_NOT_FOUND)

        new_folder = Folder.objects.filter(id=pk, user=request.user).first()
        if new_folder is None:
            return Response({"error": "New folder not found"}, status=status.HTTP_404_NOT_FOUND)

        receipt.folder = new_folder
        receipt.color = new_folder.color
        receipt.save()

        serializer = ReceiptSerializer(receipt)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, folder_id, receipt_id):
        folder = Folder.objects.filter(id=folder_id, user=request.user).first()
        if folder is None:
            return Response({"error": "Folder not found"}, status=status.HTTP_404_NOT_FOUND)
        
        receipt = folder.receipts.filter(id=receipt_id).first()
        if receipt is None:
            return Response({"error": "Receipt not found"}, status=status.HTTP_404_NOT_FOUND)

        receipt.folder = None
        receipt.color = "#FFFFFF"
        receipt.save()

        serializer = ReceiptSerializer(receipt)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def get(self, request, pk):
        folder = Folder.objects.filter(user=request.user, id=pk).first()
        if folder is None:
            return Response({"error": "Folder not found"}, status=status.HTTP_404_NOT_FOUND)
        receipts = folder.receipts.all()
        serializer = ReceiptSerializer(receipts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)