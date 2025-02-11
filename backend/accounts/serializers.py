from rest_framework import serializers
from .models import Account
from django.contrib.auth.hashers import make_password

class AccountSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Account
        fields = ['id', 'name', 'email', 'password']

    def create(self, validated_data):
        password = validated_data.pop('password')
        account = Account.objects.create(
            **validated_data,
            password_hash=make_password(password)
        )
        return account
