# api/tests/test_views.py
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from api.models import Receipt, Item, Group
from api.views import ReceiptOverview, ReceiptDetail  # not strictly required, but can be imported
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

    def test_create_receipt_success(self):
        """POST /api/receipts/ to create a new receipt."""
        data = {
            "merchant": "Test Merchant",
            "total_amount": 12.34,
            "currency": "USD",
            "date": "2025-04-01",
            "payment_method": "Debit",
            "items": [
                {"name": "TestItem1", "price": 2.5, "quantity": 2},
            ],
        }
        response = self.client.post(self.receipt_list_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Check the created receipt
        self.assertTrue(Receipt.objects.exists())
        receipt = Receipt.objects.first()
        self.assertEqual(receipt.merchant, "Test Merchant")
        self.assertEqual(receipt.items.count(), 1)

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
        # Create a sample receipt
        receipt = Receipt.objects.create(
            user=self.user,
            merchant="ToDelete",
            total_amount=45,
            currency="USD",
            date="2025-05-01",
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

        self.receipt = Receipt.objects.create(
            user=self.user,
            merchant="ItemMerchant",
            total_amount=20,
            currency="USD",
            date="2025-03-01",
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
        self.login_url = reverse("user-login")        # e.g. /api/user/login/

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
        User.objects.create_user(username="loginuser", email="login@example.com", password="loginpass")
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
        data = {"name": "My Test Group"}
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
