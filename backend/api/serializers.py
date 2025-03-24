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


class GroupReceiptSplitSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupReceiptSplit
        fields = [
            "group_member",
            "amount_owed",
            "percentage_owed",
            "amount_paid",
            "is_custom_amount",
        ]


class ReceiptSerializer(serializers.ModelSerializer):
    items = ItemSerializer(many=True)  # Nested serializer
    splits = serializers.SerializerMethodField()

    class Meta:
        model = Receipt
        fields = "__all__"

    def get_splits(self, obj):
        group_receipt_splits = GroupReceiptSplit.objects.filter(receipt=obj)
        return GroupReceiptSplitSerializer(group_receipt_splits, many=True).data
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        return {
            key: float(value) if isinstance(value, Decimal) else value
            for key, value in data.items()
        }

    def create(self, validated_data):
        items_data = validated_data.pop("items", [])

        try:
            # Create receipt and items in a transaction
            with transaction.atomic():
                receipt = Receipt.objects.create(**validated_data)
                Item.objects.bulk_create(
                    [Item(receipt=receipt, **item_data) for item_data in items_data]
                )

                update_insights(receipt.user.id)
                return receipt
        except (ValueError, TypeError) as e:
            raise serializers.ValidationError(f"Invalid data format: {str(e)}")
        except Exception as e:
            raise serializers.ValidationError(f"Failed to create receipt: {str(e)}")

    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", [])

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

                update_insights(instance.user.id)
                return instance
        except Exception as e:
            raise serializers.ValidationError(f"Failed to update receipt: {str(e)}")


class GroupMembersSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupMembers
        fields = ["id", "user", "joined_at"]


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
