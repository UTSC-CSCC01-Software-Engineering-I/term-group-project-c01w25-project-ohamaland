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
)
from .signals import update_insights


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


class GroupMembersSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupMembers
        fields = ["id", "user", "joined_at"]


class GroupReceiptSplitSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    def get_user(self, obj):
        return obj.group_member.user.id

    class Meta:
        model = GroupReceiptSplit
        fields = [
            "id",
            "user",
            "amount_owed",
            "amount_paid",
            "is_custom_split",
            "created_at",
            "paid_at",
            "status",
            "notes",
        ]


class ReceiptSerializer(serializers.ModelSerializer):
    items = ItemSerializer(many=True)
    splits = GroupReceiptSplitSerializer(many=True, read_only=True)

    class Meta:
        model = Receipt
        fields = ["id", "user", "group", "total_amount", "date", "items", "splits"]

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

        if instance.user and 'splits' in data:
            del data['splits']

        return data

    def create(self, validated_data):
        items_data = validated_data.pop("items", [])
        custom_splits = validated_data.pop("custom_splits", {})

        try:
            with transaction.atomic():
                receipt = Receipt.objects.create(**validated_data)

                # Create items
                Item.objects.bulk_create(
                    [Item(receipt=receipt, **item_data) for item_data in items_data]
                )

                # Create splits
                self._create_or_update_splits(receipt, custom_splits)

                if receipt.user:
                    update_insights(receipt.user.id)

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

                if instance.user:
                    update_insights(instance.user.id)

                return instance
        except Exception as e:
            raise serializers.ValidationError(f"Failed to update receipt: {str(e)}")


class GroupSerializer(serializers.ModelSerializer):
    members = GroupMembersSerializer(many=True)
    receipts = ReceiptSerializer(many=True)

    class Meta:
        model = Group
        fields = "__all__"

    def get_members(self, obj):
        """Return members as a list of user IDs and usernames."""
        return [
            {"id": member.user.id, "username": member.user.username}
            for member in obj.groupmembers_set.all()
        ]

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


class InsightsSerializer(serializers.ModelSerializer):
    category_spending = serializers.SerializerMethodField()

    class Meta:
        model = Insights
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
