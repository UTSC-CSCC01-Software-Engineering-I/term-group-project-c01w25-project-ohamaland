import boto3
from django.conf import settings
from rest_framework import serializers
from .models import Receipt, Item, Group, GroupMembers


class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ['name', 'category', 'price', 'quantity']


class ReceiptSerializer(serializers.ModelSerializer):
    items = ItemSerializer(many=True, read_only=True)
    receipt_image = serializers.ImageField(required=False)

    class Meta:
        model = Receipt
        fields = ['user_id', 'group', 'merchant', 'total_amount', 'currency',
                  'date', 'payment_method', 'receipt_image_url', 'items', 'receipt_image']

    def create(self, validated_data):
        image = validated_data.pop("receipt_image", None)

        if image:
            s3_client = boto3.client(
                "s3",
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_S3_REGION_NAME,
            )

            bucket_name = settings.AWS_STORAGE_BUCKET_NAME
            file_key = f"receipts/{image.name}"

            s3_client.upload_fileobj(image, bucket_name, file_key, ExtraArgs={
                "ContentType": image.content_type})  # Ensures that it opens the image in the browser

            validated_data["receipt_image_url"] = f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/{file_key}"

        return super().create(validated_data)


class GroupMembersSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupMembers
        fields = ['group', 'user_id', 'joined_at']


class GroupSerializer(serializers.ModelSerializer):
    members = GroupMembersSerializer(many=True, read_only=True, source='groupmembers_set')
    receipts = ReceiptSerializer(many=True, read_only=True, source='receipt_set')

    class Meta:
        model = Group
        fields = ['creator', 'name', 'members', 'receipts']
