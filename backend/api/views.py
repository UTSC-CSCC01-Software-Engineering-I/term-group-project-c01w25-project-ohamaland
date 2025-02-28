from django.contrib.auth import authenticate
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Receipt, Item, Group, GroupMembers, User
from .serializers import ReceiptSerializer, ItemSerializer, GroupSerializer, GroupMembersSerializer, UserSerializer


# TODO: When Account and Authentication are implemented, GET request for items should only return items from the Account

class ReceiptList(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ReceiptSerializer

    def get_queryset(self):
        return Receipt.objects.filter(user=self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({"receipts": serializer.data})


class ReceiptDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ReceiptSerializer
    queryset = Receipt.objects.all()


class ItemList(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ItemSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({"items": serializer.data})

    def get_queryset(self):
        # Filter items by the receipt_id provided in the URL
        return Item.objects.filter(receipt_id=self.kwargs['receipt_id'])

    # Handle POST request to create a new item under a specific receipt
    def perform_create(self, serializer):
        receipt = Receipt.objects.get(id=self.kwargs['receipt_id'])  # Checks if the receipt with ID exists
        serializer.save(receipt=receipt)


class ItemDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ItemSerializer

    # Not 100% sure whether this works
    def get_object(self):
        return Item.objects.get(receipt=self.kwargs['receipt_id'], id=self.kwargs['pk'])


class GroupList(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = GroupSerializer
    queryset = Group.objects.all()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({"groups": serializer.data})


class GroupDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = GroupSerializer
    queryset = Group.objects.all()


class GroupMembersList(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = GroupMembersSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({"members": serializer.data})

    def get_queryset(self):
        return GroupMembers.objects.filter(group_id=self.kwargs['group_id'])

    def perform_create(self, serializer):
        group = Group.objects.get(id=self.kwargs['group_id'])
        serializer.save(group=group)


class GroupMembersDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = GroupMembersSerializer

    def get_object(self):
        return GroupMembers.objects.get(group=self.kwargs['group_id'], id=self.kwargs['pk'])


class UserRegisterView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLoginView(APIView):
    def post(self, request):
        identifier = request.data.get('identifier')
        password = request.data.get('password')

        if not identifier or not password:
            return Response({"error": "Username/email and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email=identifier).first()
        username = user.username if user else identifier
        user = authenticate(request, username=username, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
