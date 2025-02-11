from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import make_password

from .models import User

class RegisterUserView(APIView):
    def post(self, request):
        data = request.data
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return Response({"error": "Username and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username is already taken."}, status=status.HTTP_409_CONFLICT)

        User.objects.create(
            username=username,
            password=make_password(password)
        )

        return Response({
            "message": "User registered successfully",
            "user": {"username": username}
        }, status=status.HTTP_201_CREATED)

    def get(self, request):
        username = request.query_params.get("username")

        if not username:
            return Response({"error": "Username parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Retrieve user by username
            user = User.objects.get(username=username)
            return Response({
                "username": user.username,
                "message": "User found"
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({
                "error": "User not found"
            }, status=status.HTTP_404_NOT_FOUND)