# api/tests/test_serializers.py
from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from api.models import Folder, Receipt, Item, Group, GroupMembers, Subscription, Insights
from api.serializers import (
    UserSerializer,
    ReceiptSerializer,
    ItemSerializer,
    GroupSerializer,
    GroupMembersSerializer,
    SubscriptionSerializer,
    InsightsSerializer,
    FolderSerializer,
)
from datetime import date

User = get_user_model()

class UserSerializerTests(TestCase):
    def test_valid_user_creation(self):
        data = {
            "username": "testuser",
            "email": "test@example.com",
            "first_name": "Test",
            "last_name": "User",
            "phone_number": "+1 234-567-8900",
            "password": "SecurePass123!"
        }
        serializer = UserSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()
        self.assertEqual(user.username, "testuser")
        self.assertEqual(user.email, "test@example.com")
        self.assertEqual(user.first_name, "Test")
        self.assertEqual(user.last_name, "User")
        self.assertEqual(user.phone_number, "+1 234-567-8900")
        self.assertTrue(user.check_password("SecurePass123!"))

    def test_invalid_password(self):
        data = {
            "username": "john_doe",
            "email": "johndoe@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "phone_number": "+1 234-567-8900",
            "password": "123"
        }
        serializer = UserSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("password", serializer.errors)


class ReceiptSerializerTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="SecurePass123!")

    def test_invalid_receipt_no_date(self):
        data = {
            "user": self.user.id,
            "merchant": "Invalid Store",
            "total_amount": Decimal("30.00"),
            "currency": "USD",
            "payment_method": "Cash",
            "items": [],
        }
        serializer = ReceiptSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("date", serializer.errors)


class FolderSerializerTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="SecurePass123!")

    def test_create_folder(self):
        data = {"name": "myfolder", "color": "#123456"}
        serializer = FolderSerializer(data=data, context={"request": self.mock_request(self.user)})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        folder = serializer.save()

        self.assertEqual(folder.name, "myfolder")
        self.assertEqual(folder.color, "#123456")
        self.assertEqual(folder.user, self.user)

    def mock_request(self, user):
        class MockRequest:
            def __init__(self, user):
                self.user = user
        return MockRequest(user)


class GroupSerializerTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="SecurePass123!")

    def test_create_group(self):
        data = {"name": "testgroup", "creator": self.user.id}
        serializer = GroupSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        group = serializer.save()

        self.assertEqual(group.name, "testgroup")
        self.assertEqual(group.creator, self.user)


class SubscriptionSerializerTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="SecurePass123!")
        self.group = Group.objects.create(name="Test Group", creator=self.user)

    def test_valid_subscription(self):
        data = {
            "user": self.user.id,
            "merchant": "testmerchant",
            "total_amount": Decimal("9.99"),
            "currency": "USD",
            "renewal_date": date(2025, 4, 1),
            "billing_period": "Monthly",
        }
        serializer = SubscriptionSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        subscription = serializer.save()
        self.assertEqual(subscription.user, self.user)
        self.assertIsNone(subscription.group)
        self.assertEqual(subscription.merchant, "testmerchant")
        self.assertEqual(subscription.total_amount, Decimal("9.99"))
        self.assertEqual(subscription.currency, "USD")
        self.assertEqual(subscription.renewal_date, date(2025, 4, 1))
        self.assertEqual(subscription.billing_period, "Monthly")

    def test_valid_subscription_with_group(self):
        data = {
            "group": self.group.id,
            "merchant": "testmerchant",
            "total_amount": Decimal("9.99"),
            "currency": "USD",
            "renewal_date": date(2025, 4, 1),
            "billing_period": "Monthly",
        }
        serializer = SubscriptionSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        subscription = serializer.save()
        self.assertIsNone(subscription.user)
        self.assertEqual(subscription.group, self.group)
        self.assertEqual(subscription.merchant, "testmerchant")
        self.assertEqual(subscription.total_amount, Decimal("9.99"))
        self.assertEqual(subscription.currency, "USD")
        self.assertEqual(subscription.renewal_date, date(2025, 4, 1))
        self.assertEqual(subscription.billing_period, "Monthly")


class ItemSerializerTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="SecurePass123!")
        self.group = Group.objects.create(name="Test Group", creator=self.user)
        self.receipt = Receipt.objects.create(
            date=date(2025, 3, 25),
            total_amount=Decimal("10.00"),
            currency="USD",
            merchant="Test Merchant",
            user=self.user,
        )

    def test_valid_item(self):
        data = {
            "name": "Milk",
            "price": Decimal("2.99"),
            "quantity": 3
        }
        serializer = ItemSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        item = serializer.save(receipt=self.receipt)
        self.assertEqual(item.receipt, self.receipt)
        self.assertEqual(item.name, "Milk")
        self.assertEqual(item.price, Decimal("2.99"))
        self.assertEqual(item.quantity, 3)