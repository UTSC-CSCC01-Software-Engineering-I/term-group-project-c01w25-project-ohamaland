from django.test import TestCase
from django.contrib.auth import get_user_model
from api.models import (
    Group,
    GroupMembers,
    Folder,
    Receipt,
    Item,
    Subscription,
    Insights,
)
from decimal import Decimal
from datetime import date

User = get_user_model()


class UserModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="testuser@example.com",
            password="SecurePass123!",
            first_name="Test",
            last_name="User",
        )

    def test_user_creation(self):
        """Test that the user is created properly."""
        self.assertEqual(self.user.username, "testuser")
        self.assertEqual(self.user.email, "testuser@example.com")
        self.assertEqual(self.user.first_name, "Test")
        self.assertEqual(self.user.last_name, "User")
        self.assertTrue(self.user.check_password("SecurePass123!"))


class GroupModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="creator", password="Pass123!")
        self.group = Group.objects.create(name="Test Group", creator=self.user)

    def test_group_creation(self):
        """Test that the group is created properly."""
        self.assertEqual(self.group.name, "Test Group")
        self.assertEqual(self.group.creator, self.user)


class ReceiptModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="receiptuser", password="Pass123!")
        self.receipt = Receipt.objects.create(
            user=self.user,
            merchant="Test Merchant",
            total_amount=Decimal("100.00"),
            currency="USD",
            date=date.today(),
        )

    def test_receipt_creation(self):
        """Test that the receipt is created properly."""
        self.assertEqual(self.receipt.user, self.user)
        self.assertEqual(self.receipt.merchant, "Test Merchant")
        self.assertEqual(self.receipt.total_amount, Decimal("100.00"))
        self.assertEqual(self.receipt.currency, "USD")



class ItemModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="itemuser", password="Pass123!")
        self.receipt = Receipt.objects.create(
            user=self.user,
            merchant="Test Merchant",
            total_amount=Decimal("50.00"),
            currency="USD",
            date=date.today(),
        )
        self.item = Item.objects.create(
            receipt=self.receipt, name="Milk", price=Decimal("2.99"), quantity=3
        )

    def test_item_creation(self):
        """Test that the item is created properly."""
        self.assertEqual(self.item.receipt, self.receipt)
        self.assertEqual(self.item.name, "Milk")
        self.assertEqual(self.item.price, Decimal("2.99"))
        self.assertEqual(self.item.quantity, 3)


class FolderModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="folderuser", password="Pass123!")
        self.folder = Folder.objects.create(name="Groceries", user=self.user)

    def test_folder_creation(self):
        """Test that the folder is created properly."""
        self.assertEqual(self.folder.name, "Groceries")
        self.assertEqual(self.folder.user, self.user)
        self.assertEqual(self.folder.color, "#FFFFFF")


class SubscriptionModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="subuser", password="Pass123!")
        self.subscription = Subscription.objects.create(
            user=self.user,
            merchant="Netflix",
            total_amount=Decimal("9.99"),
            currency="USD",
            renewal_date=date.today(),
            billing_period="Monthly",
        )

    def test_subscription_creation(self):
        """Test that the subscription is created properly."""
        self.assertEqual(self.subscription.user, self.user)
        self.assertEqual(self.subscription.merchant, "Netflix")
        self.assertEqual(self.subscription.total_amount, Decimal("9.99"))
        self.assertEqual(self.subscription.currency, "USD")
        self.assertEqual(self.subscription.billing_period, "Monthly")


class InsightsModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="insightsuser", password="Pass123!")
        self.insights = Insights.objects.create(
            user=self.user,
            category_spending={"Food": "50.00", "Transport": "20.00"},
            total_spent=Decimal("70.00"),
            period="Monthly",
            date=date.today(),
        )

    def test_insights_creation(self):
        """Test that the insights record is created properly."""
        self.assertEqual(self.insights.user, self.user)
        self.assertEqual(self.insights.category_spending, {"Food": "50.00", "Transport": "20.00"})
        self.assertEqual(self.insights.total_spent, Decimal("70.00"))
        self.assertEqual(self.insights.period, "Monthly")
