# api/tests/test_views.py
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from api.models import Receipt, Item, Group, Folder, GroupMembers
from api.views import (
    ReceiptOverview,
    ReceiptDetail,
)  # not strictly required, but can be imported
import datetime

User = get_user_model()


class ReceiptTests(APITestCase):
    def setUp(self):
        # Create a user
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass"
        )

        # Log them in via the API or force_authenticate
        self.client.force_authenticate(user=self.user)

        # Endpoints we might use
        self.receipt_list_url = reverse("receipt-list-create")  # /api/receipts/
        # For detail, we'll do something like: reverse("receipt-detail", args=[receipt_id])

    def test_list_receipts_empty(self):
        """GET /api/receipts/ with no receipts should return empty list."""
        response = self.client.get(self.receipt_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"receipts": []})

    def test_create_receipt_missing_date(self):
        """POST /api/receipts/ but missing date - expect validation error."""
        data = {
            "merchant": "No Date Merchant",
            "total_amount": 10,
            "currency": "USD",
            # date is missing
            "payment_method": "Cash",
            "items": [],
        }
        response = self.client.post(self.receipt_list_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("date", response.data)

    def test_delete_receipt(self):
        """DELETE /api/receipts/<id>/ to remove a receipt."""

            # Create a folder instance
        self.folder = Folder.objects.create(name="Test Folder", user=self.user, color="#FFFFFF")
        # Create a sample receipt
        receipt = Receipt.objects.create(
            user=self.user,
            merchant="ToDelete",
            total_amount=45,
            currency="USD",
            date="2025-05-01",
            folder=self.folder
        )
        detail_url = reverse("receipt-detail", args=[receipt.id])

        # Confirm the receipt is there
        self.assertEqual(Receipt.objects.count(), 1)

        # Delete
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Receipt.objects.count(), 0)


class ItemTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="test2", password="testpass2")
        self.client.force_authenticate(user=self.user)

        # Create a folder instance
        self.folder = Folder.objects.create(name="Test Folder", user=self.user, color="#FFFFFF")
        self.receipt = Receipt.objects.create(
            user=self.user,
            merchant="ItemMerchant",
            total_amount=20,
            currency="USD",
            date="2025-03-01",
            folder=self.folder
        )
        self.item_list_url = reverse("item-list-create", args=[self.receipt.id])
        # e.g. /api/receipts/<receipt_pk>/items/

    def test_add_item_to_receipt(self):
        """POST /api/receipts/<receipt_pk>/items/ adds an item."""
        data = {"name": "Test Item", "price": 3.5, "quantity": 2}
        response = self.client.post(self.item_list_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(self.receipt.items.count(), 1)

    def test_list_items_empty(self):
        """GET /api/receipts/<receipt_pk>/items/ when no items exist."""
        response = self.client.get(self.item_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"items": []})


class AuthTests(APITestCase):
    def setUp(self):
        self.register_url = reverse("user-register")  # e.g. /api/user/register/
        self.login_url = reverse("user-login")  # e.g. /api/user/login/

    def test_register_success(self):
        data = {
            "username": "newuser",
            "email": "new@example.com",
            "password": "strongpass123",
            "first_name": "New",
            "last_name": "User",
        }
        response = self.client.post(self.register_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="newuser").exists())

    def test_login_invalid_creds(self):
        data = {"identifier": "nonexist@example.com", "password": "wrong"}
        response = self.client.post(self.login_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("Invalid credentials", str(response.data))

    def test_login_success(self):
        User.objects.create_user(
            username="loginuser", email="login@example.com", password="loginpass"
        )
        data = {"identifier": "login@example.com", "password": "loginpass"}
        response = self.client.post(self.login_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)


class GroupTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="groupuser", password="grouppass")
        self.client.force_authenticate(user=self.user)
        self.group_list_url = reverse("group-list-create")  # e.g. /api/groups/

    def test_create_group_success(self):
        """POST /api/groups/ to create a group."""
        data = {"name": "My Test Group", "creator": self.user.id, "members": [], "receipts": []}
        response = self.client.post(self.group_list_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Group.objects.exists())
        new_group = Group.objects.first()
        self.assertEqual(new_group.name, "My Test Group")
        self.assertEqual(new_group.creator, self.user)

    def test_list_groups_empty(self):
        """GET /api/groups/ returns an empty list when no groups exist for the user."""
        response = self.client.get(self.group_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"groups": []})

# Integration Tests for Subscriptions
class SubscriptionTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="subuser", password="pass123")
        self.client.force_authenticate(user=self.user)
        self.subscription_url = reverse("subscription-list")

    def test_create_subscription(self):
        """POST /api/subscriptions/ creates a new personal subscription."""
        data = {
            "user": self.user.id,
            "merchant": "Spotify",
            "total_amount": "11.99",
            "currency": "USD",
            "renewal_date": "2025-05-01",
            "billing_period": "Monthly"
        }
        response = self.client.post(self.subscription_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["merchant"], "Spotify")

    def test_list_subscriptions_empty(self):
        """GET /api/subscriptions/ returns empty list if none exist."""
        response = self.client.get(self.subscription_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"subscriptions": []})

# Integration Tests for Folders
class FolderTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="folderuser", password="pass123")
        self.client.force_authenticate(user=self.user)
        self.folder_url = reverse("folder-list-create")

    def test_create_folder(self):
        """POST /api/folders/ creates a new folder."""
        data = {"name": "Work", "color": "#FF5733"}
        response = self.client.post(self.folder_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "Work")
        self.assertEqual(response.data["color"], "#FF5733")

    def test_create_folder_duplicate_name(self):
        # Create folder once
        Folder.objects.create(name="Groceries", user=self.user, color="#FFFFFF")

        # Try to create it again via POST
        data = {"name": "Groceries", "color": "#FFFFFF"}
        response = self.client.post(self.folder_url, data, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertIn("non_field_errors", response.data)

# End-to-End: Receipt with Items

class ReceiptItemIntegrationTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="e2euser", password="pass123")
        self.client.force_authenticate(user=self.user)

        # Create a folder to assign to the receipt
        self.folder = Folder.objects.create(name="Food", user=self.user, color="#00FF00")

    def test_create_receipt_with_items(self):
        """POST /api/receipts/ with nested items."""
        receipt_data = {
            "merchant": "Walmart",
            "total_amount": 25.75,
            "currency": "USD",
            "date": "2025-05-01",
            "payment_method": "Credit",
            "folder": self.folder.id,
            "items": [
                {"name": "Eggs", "price": 3.99, "quantity": 2},
                {"name": "Bread", "price": 2.50, "quantity": 1},
            ],
        }
        url = reverse("receipt-list-create")
        response = self.client.post(url, receipt_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(response.data["items"]), 2)
        self.assertEqual(response.data["merchant"], "Walmart")


# Integration Test: Receipt Split for Group Members

class GroupReceiptSplitTests(APITestCase):
    def setUp(self):
        # Create users
        self.creator = User.objects.create_user(
            username="creator", email="creator@example.com", password="pass123"
        )
        self.member = User.objects.create_user(
            username="member", email="member@example.com", password="pass123"
        )
        self.client.force_authenticate(user=self.creator)

        # Create group
        self.group = Group.objects.create(name="Dinner Group", creator=self.creator)

        # Add creator and member to the group
        GroupMembers.objects.create(group=self.group, user=self.creator)
        GroupMembers.objects.create(group=self.group, user=self.member)

        # Create a folder
        self.folder = Folder.objects.create(name="Group Folder", user=self.creator, color="#AABBCC")

        # Endpoint
        self.receipt_url = reverse("receipt-list-create")

    def test_create_group_receipt_and_check_splits(self):
        """Test that splits are created for all group members when a group receipt is added."""
        data = {
            "group": self.group.id,
            "merchant": "Group Dinner",
            "total_amount": 100.00,
            "currency": "USD",
            "date": "2025-05-01",
            "folder": self.folder.id,
            "items": [
                {"name": "Pizza", "price": 50.00, "quantity": 1},
                {"name": "Drinks", "price": 50.00, "quantity": 1}
            ],
        }

        response = self.client.post(self.receipt_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        receipt_id = response.data["id"]

        # Check that the receipt has splits for both users
        from api.models import Receipt, GroupReceiptSplit
        receipt = Receipt.objects.get(id=receipt_id)
        splits = receipt.splits.all()
        self.assertEqual(splits.count(), 2)

        owed_amounts = [split.amount_owed for split in splits]
        self.assertTrue(all(amount == 50.00 for amount in owed_amounts))