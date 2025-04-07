from rest_framework.test import APITestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from api.models import Receipt, Item
from decimal import Decimal
from datetime import date

User = get_user_model()

class FullReceiptFlowTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="integrationuser", email="i@example.com", password="Pass123!"
        )
        self.client.force_authenticate(user=self.user)
        self.url = reverse("receipt-list-create")

    def test_create_receipt_with_items(self):
        payload = {
            "merchant": "Test Store",
            "total_amount": "25.00",
            "currency": "USD",
            "date": str(date.today()),
            "payment_method": "Cash",
            "items": [
                {"name": "Milk", "price": "3.50", "quantity": 2},
                {"name": "Bread", "price": "2.00", "quantity": 1},
            ],
        }

        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Receipt.objects.count(), 1)
        self.assertEqual(Item.objects.count(), 2)
        self.assertEqual(response.data["merchant"], "Test Store")