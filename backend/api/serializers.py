from decimal import Decimal

from django.db import transaction
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import (
    GroupReceiptSplit,
    Receipt,
    Item,
    Group,
    GroupMembers,
    User,
    Insights,
    Folder,
    Subscription,
    Insights,
    Notification,
)


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
        validate_password(value)
        return value

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'notification_type', 'title', 'message', 'data', 
                 'is_read', 'is_dismissed', 'created_at']


class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ["id", "name", "price", "quantity"]


class GroupMembersSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id")
    username = serializers.CharField(source="user.username", read_only=True)
    group = serializers.IntegerField(source="group.id")

    class Meta:
        model = GroupMembers
        fields = ["id", "group", "user_id", "username", "joined_at"]

    def create(self, validated_data):
        user_id = validated_data.pop("user")["id"]
        group_id = validated_data.pop("group")["id"]

        user = User.objects.get(id=user_id)
        group = Group.objects.get(id=group_id)

        return GroupMembers.objects.create(user=user, group=group, **validated_data)



class GroupReceiptSplitSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    def get_user(self, obj):
        return obj.group_member.user.id

    class Meta:
        model = GroupReceiptSplit
        fields = [
            "id",
            "user",
            "status",
            "amount_owed",
            "amount_paid",
            "is_custom_split",
            "created_at",
            "paid_at",
            "notes",
        ]


class ReceiptSerializer(serializers.ModelSerializer):
    items = ItemSerializer(many=True)
    splits = GroupReceiptSplitSerializer(many=True, read_only=True)
    folder = serializers.StringRelatedField()

    class Meta:
        model = Receipt
        fields = [
            "id",
            "user",
            "group",
            "merchant",
            "total_amount",
            "currency",
            "date",
            "payment_method",
            "tax",
            "tip",
            "tax_last",
            "send_mail",
            "created_at",
            "receipt_image_url",
            "items",
            "splits",
            "folder",
            "color"
        ]

    def _create_or_update_splits(self, receipt, custom_splits=None):
        """Create or update splits for a receipt."""

        if not receipt.group:
            return

        group_members = GroupMembers.objects.filter(group=receipt.group)
        total_members = group_members.count()

        if total_members == 0:
            return

        # Get total amount for custom splits
        custom_splits = custom_splits or {}
        total_custom_amount = sum(custom_splits.values())

        # Calculate remaining amount to split evenly
        remaining_amount = receipt.total_amount - total_custom_amount
        regular_members = total_members - len(custom_splits)
        even_split_amount = (
            remaining_amount / regular_members if regular_members > 0 else 0
        )

        # Delete existing splits
        GroupReceiptSplit.objects.filter(receipt=receipt).delete()

        # Create new splits
        splits_to_create = []
        for member in group_members:
            if member.user.id in custom_splits:
                amount = custom_splits[member.user.id]
                percentage = (amount / receipt.total_amount) * 100
                splits_to_create.append(
                    GroupReceiptSplit(
                        receipt=receipt,
                        group_member=member,
                        amount_owed=amount,
                        percentage_owed=percentage,
                        amount_paid=0,
                        is_custom_split=True,
                    )
                )
            else:
                percentage = (even_split_amount / receipt.total_amount) * 100
                splits_to_create.append(
                    GroupReceiptSplit(
                        receipt=receipt,
                        group_member=member,
                        amount_owed=even_split_amount,
                        percentage_owed=percentage,
                        amount_paid=0,
                        is_custom_split=False,
                    )
                )

        GroupReceiptSplit.objects.bulk_create(splits_to_create)

    def to_representation(self, instance):
        data = super().to_representation(instance)

        data = {
            key: float(value) if isinstance(value, Decimal) else value
            for key, value in data.items()
        }

        if instance.user and "splits" in data:
            del data["splits"]

        return data

    def create(self, validated_data):
        items_data = validated_data.pop("items", [])
        custom_splits = validated_data.pop("custom_splits", {})

        try:
            with transaction.atomic():
                if "folder" not in validated_data:
                    validated_data["folder"], _ = Folder.objects.get_or_create(
                        user=self.context["request"].user, name="All"
                    )

                receipt = Receipt.objects.create(**validated_data)

                # Create items
                Item.objects.bulk_create(
                    [Item(receipt=receipt, **item_data) for item_data in items_data]
                )

                # Create splits
                self._create_or_update_splits(receipt, custom_splits)

                return receipt
        except (ValueError, TypeError) as e:
            raise serializers.ValidationError(f"Invalid data format: {str(e)}")
        except Exception as e:
            raise serializers.ValidationError(f"Failed to create receipt: {str(e)}")

    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", [])
        custom_splits = validated_data.pop("custom_splits", {})

        try:
            with transaction.atomic():
                # Update receipt fields
                for key, value in validated_data.items():
                    setattr(instance, key, value)
                instance.save()

                # Update items
                Item.objects.filter(receipt=instance).delete()
                Item.objects.bulk_create(
                    [Item(receipt=instance, **item_data) for item_data in items_data]
                )

                # Update splits
                self._create_or_update_splits(instance, custom_splits)

                return instance
        except Exception as e:
            raise serializers.ValidationError(f"Failed to update receipt: {str(e)}")


class GroupSerializer(serializers.ModelSerializer):
    members = GroupMembersSerializer(many=True)
    receipts = ReceiptSerializer(many=True)

    class Meta:
        model = Group
        fields = ["id", "creator", "name", "created_at", "members", "receipts"]

    def create(self, validated_data):
        members_data = validated_data.pop("members", [])
        receipts_data = validated_data.pop("receipts", [])

        try:
            with transaction.atomic():
                group = Group.objects.create(**validated_data)
                GroupMembers.objects.bulk_create([
                    GroupMembers(
                        group=group,
                        user=User.objects.get(id=member_data["user"]["id"])
                    )
                    for member_data in members_data
                ])
                Receipt.objects.bulk_create(
                    [
                        Receipt(group=group, **receipt_data)
                        for receipt_data in receipts_data
                    ]
                )

                return group
        except Exception as e:
            raise serializers.ValidationError(f"Failed to create group: {str(e)}")

    def update(self, instance, validated_data):
        members_data = validated_data.pop("members", None)
        receipts_data = validated_data.pop("receipts", None)

        try:
            with transaction.atomic():
                # Update regular fields like name
                for key, value in validated_data.items():
                    setattr(instance, key, value)
                instance.save()

                # Only update members if provided
                if members_data is not None:
                    GroupMembers.objects.filter(group=instance).exclude(
                        user=instance.creator
                    ).delete()

                    GroupMembers.objects.bulk_create([
                        GroupMembers(
                            group=instance,
                            user=User.objects.get(id=member_data["user"]["id"])
                        )
                        for member_data in members_data
                    ])

                # Only update receipts if provided
                if receipts_data is not None:
                    Receipt.objects.filter(group=instance).delete()
                    Receipt.objects.bulk_create([
                        Receipt(group=instance, **receipt_data)
                        for receipt_data in receipts_data
                    ])

                return instance

        except Exception as e:
            raise serializers.ValidationError(f"Failed to update group: {str(e)}")


class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = "__all__"


class InsightsSerializer(serializers.ModelSerializer):
    folder_spending = serializers.SerializerMethodField()
    merchant_spending = serializers.SerializerMethodField()
    payment_method_spending = serializers.SerializerMethodField()
    currency_distribution = serializers.SerializerMethodField()

    class Meta:
        model = Insights
        fields = ["user", "total_spent", "folder_spending", "merchant_spending", "get_payment_method_spending", "get_currency_distribution", "period", "date"]

    def get_folder_spending(self, obj):
        """Convert folder_spending JSON field to list for frontend processing."""
        return [
            {"folder": key, "amount": float(value)}
                for key, value in obj.folder_spending.items()
        ]

    def get_merchant_spending(self, obj):
        """Convert merchant_spending JSON field to list for frontend processing."""
        return [
            {"merchant": key, "amount": float(value)}
                for key, value in obj.merchant_spending.items()
        ]
    
    def get_payment_method_spending(self, obj):
        """Convert payment_method_spending JSON field to list for frontend processing."""
        return [
            {"payment_method": key, "amount": float(value)}
                for key, value in obj.payment_method_spending.items()
        ]
    
    def get_currency_distribution(self, obj):
        """Convert currency_distribution JSON field to list for frontend processing."""
        return [
            {"currency": key, "percentage": float(value.get("percentage", 0)),}
            for key, value in obj.currency_distribution.items()
        ]

    def to_representation(self, instance):
        """Convert Decimal fields to float for JSON serialization."""
        data = super().to_representation(instance)

        # Ensure price fields (or any DecimalField) are converted
        for key, value in data.items():
            if isinstance(value, Decimal):
                data[key] = float(value)

        return data


class FolderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Folder
        fields = ["id", "name", "color", "created_at"]

    def create(self, validated_data):
        user = self.context["request"].user
        validated_data["user"] = user
        return super().create(validated_data)
    
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        token["user_id"] = user.id
        token["username"] = user.username

        return token