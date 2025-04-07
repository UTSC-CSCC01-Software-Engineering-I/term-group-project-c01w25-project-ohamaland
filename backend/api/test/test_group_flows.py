from rest_framework.test import APITestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from api.models import Group, Receipt
from datetime import date

User = get_user_model()

class GroupFlowTest(APITestCase):
    def setUp(self):
        self.creator = User.objects.create_user("creator", "c@test.com", "pass")
        self.member = User.objects.create_user("member", "m@test.com", "pass")
        self.client.force_authenticate(user=self.creator)

    def test_full_group_receipt_flow(self):
        group_data = {
            "name": "Groceries",
            "creator": self.creator.id,
            "members": [{"identifier": self.member.email}],
            "receipts": [],
        }
        group_resp = self.client.post(reverse("group-list-create"), group_data, format="json")
        self.assertEqual(group_resp.status_code, 201)
        group_id = group_resp.data["id"]

        receipt_data = {
            "merchant": "Walmart",
            "total_amount": "40.00",
            "currency": "USD",
            "date": str(date.today()),
            "payment_method": "Credit",
            "group": group_id,
            "items": [{"name": "Eggs", "price": "5.00", "quantity": 1}],
        }
        receipt_resp = self.client.post(reverse("receipt-list-create"), receipt_data, format="json")
        self.assertEqual(receipt_resp.status_code, 201)
        self.assertEqual(receipt_resp.data["merchant"], "Walmart")
        self.assertTrue("splits" in receipt_resp.data)