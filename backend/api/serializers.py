from decimal import Decimal

from django.db import transaction
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password

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
        fields = [
            "id",
            "notification_type",
            "title",
            "message",
            "data",
            "is_read",
            "is_dismissed",
            "created_at",
        ]


class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ["id", "name", "price", "quantity"]


class GroupMembersSerializer(serializers.ModelSerializer):
    identifier = serializers.CharField(write_only=True, required=False)
    user = UserSerializer(read_only=True)

    class Meta:
        model = GroupMembers
        fields = ["id", "user", "identifier", "joined_at"]

    def validate(self, data):
        identifier = data.get("identifier")

        if not identifier:
            raise serializers.ValidationError(
                "Either 'email' or 'username' must be provided."
            )

        user = (
            User.objects.filter(email=identifier).first()
            or User.objects.filter(username=identifier).first()
        )

        if not user:
            raise serializers.ValidationError("User not found.")

        data["user"] = user  # Add user to validated data
        del data["identifier"]

        return data


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
            "folder",
            "color",
            "items",
            "splits",
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

        # Preserve existing splits
        existing_splits = {
            split.group_member.user.id: split
            for split in GroupReceiptSplit.objects.filter(receipt=receipt)
        }

        # Delete existing splits
        GroupReceiptSplit.objects.filter(receipt=receipt).delete()

        # Create new splits
        splits_to_create = []
        for member in group_members:
            existing_split = existing_splits.get(member.user.id)
            if member.user.id in custom_splits:
                amount = custom_splits[member.user.id]
                percentage = (amount / receipt.total_amount) * 100
                splits_to_create.append(
                    GroupReceiptSplit(
                        receipt=receipt,
                        group_member=member,
                        amount_owed=amount,
                        percentage_owed=percentage,
                        amount_paid=existing_split.amount_paid if existing_split else 0,
                        is_custom_split=True,
                        status=existing_split.status if existing_split else "Pending",
                        notes=existing_split.notes if existing_split else "",
                        created_at=(
                            existing_split.created_at if existing_split else None
                        ),
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
                        amount_paid=existing_split.amount_paid if existing_split else 0,
                        is_custom_split=False,
                        status=existing_split.status if existing_split else "Pending",
                        notes=existing_split.notes if existing_split else "",
                        created_at=(
                            existing_split.created_at if existing_split else None
                        ),
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
                GroupMembers.objects.bulk_create(
                    [
                        GroupMembers(group=group, **member_data)
                        for member_data in members_data
                    ]
                )
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
        members_data = validated_data.pop("members", [])
        receipts_data = validated_data.pop("receipts", [])

        try:
            with transaction.atomic():
                # Update group fields
                for key, value in validated_data.items():
                    setattr(instance, key, value)
                instance.save()

                # Update members
                # Should prevent deletion of creator from group
                GroupMembers.objects.filter(group=instance).exclude(
                    user=instance.creator
                ).delete()
                GroupMembers.objects.bulk_create(
                    [
                        GroupMembers(group=instance, **member_data)
                        for member_data in members_data
                    ]
                )

                # Update receipts
                Receipt.objects.filter(group=instance).delete()
                Receipt.objects.bulk_create(
                    [
                        Receipt(group=instance, **receipt_data)
                        for receipt_data in receipts_data
                    ]
                )

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
        fields = [
            "user",
            "total_spent",
            "folder_spending",
            "merchant_spending",
            "get_payment_method_spending",
            "get_currency_distribution",
            "period",
            "date",
        ]

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
            {
                "currency": key,
                "percentage": float(value.get("percentage", 0)),
            }
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
