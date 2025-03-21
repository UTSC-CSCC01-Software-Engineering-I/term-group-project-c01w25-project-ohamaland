from decimal import Decimal

import boto3
from django.db import transaction
from django.conf import settings
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password

from .models import Receipt, Item, Group, GroupMembers, User, SpendingAnalytics
from .signals import update_spending_analytics


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "password",
        ]
        extra_kwargs = {"password": {"write_only": True}}

    def validate_password(self, value):
        # This will raise a ValidationError if the password is invalid
        validate_password(value)
        return value

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ["id", "name", "category", "price", "quantity"]


class ReceiptSerializer(serializers.ModelSerializer):
    items = ItemSerializer(many=True) # Nested serializer
    receipt_image = serializers.ImageField(required=False)

    class Meta:
        model = Receipt
        fields = "__all__"

    def _handle_image_upload(self, image):
        """Handle S3 image upload and return the URL."""
        if not image:
            return None

        try:
            s3_client = boto3.client(
                "s3",
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_S3_REGION_NAME,
            )

            bucket_name = settings.AWS_STORAGE_BUCKET_NAME
            file_key = f"receipts/{image.name}"

            s3_client.upload_fileobj(
                image,
                bucket_name,
                file_key,
                ExtraArgs={"ContentType": image.content_type},
            )

            return f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/{file_key}"
        except Exception as e:
            raise serializers.ValidationError(f"Image upload failed: {str(e)}")

    def to_representation(self, instance):
        data = super().to_representation(instance)
        return {
            key: float(value) if isinstance(value, Decimal) else value
            for key, value in data.items()
        }

    def create(self, validated_data):
        items_data = validated_data.pop("items", [])
        image = validated_data.pop("receipt_image", None)

        # Handle image upload
        receipt_image_url = self._handle_image_upload(image)
        if receipt_image_url:
            validated_data["receipt_image_url"] = receipt_image_url

        try:
            # Create receipt and items in a transaction
            with transaction.atomic():
                receipt = Receipt.objects.create(**validated_data)
                Item.objects.bulk_create([
                    Item(receipt=receipt, **item_data)
                    for item_data in items_data
                ])

                update_spending_analytics(receipt.user.id)
                return receipt
        except Exception as e:
            raise serializers.ValidationError(f"Failed to create receipt: {str(e)}")

    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", [])
        image = validated_data.pop("receipt_image", None)

        # TO DO: Handle image deletion
        # Handle image upload
        receipt_image_url = self._handle_image_upload(image)
        if receipt_image_url:
            validated_data["receipt_image_url"] = receipt_image_url

        try:
            with transaction.atomic():
                # Update receipt fields
                for key, value in validated_data.items():
                    setattr(instance, key, value)
                instance.save()

                # Update items
                Item.objects.filter(receipt=instance).delete()
                Item.objects.bulk_create([
                    Item(receipt=instance, **item_data)
                    for item_data in items_data
                ])

                update_spending_analytics(instance.user.id)
                return instance
        except Exception as e:
            raise serializers.ValidationError(f"Failed to update receipt: {str(e)}")

class GroupMembersSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupMembers
        fields = "__all__"


class GroupSerializer(serializers.ModelSerializer):
    members = GroupMembersSerializer(
        many=True, read_only=True, source="groupmembers_set"
    )
    receipts = ReceiptSerializer(many=True, read_only=True, source="receipt_set")

    class Meta:
        model = Group
        fields = "__all__"


class SpendingAnalyticsSerializer(serializers.ModelSerializer):
    category_spending = serializers.SerializerMethodField()

    class Meta:
        model = SpendingAnalytics
        fields = ["user", "total_spent", "category_spending", "period", "date"]

    def get_category_spending(self, obj):
        """Convert category_spending JSON field to list for frontend processing."""
        return [
            {"category": key, "amount": float(value)}
            for key, value in obj.category_spending.items()
        ]

    def to_representation(self, instance):
        """Convert Decimal fields to float for JSON serialization."""
        data = super().to_representation(instance)

        # Ensure price fields (or any DecimalField) are converted
        for key, value in data.items():
            if isinstance(value, Decimal):
                data[key] = float(value)

        return data
