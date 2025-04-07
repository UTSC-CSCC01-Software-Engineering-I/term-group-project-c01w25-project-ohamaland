from rest_framework.test import APITestCase
from django.urls import reverse
from django.contrib.auth import get_user_model

User = get_user_model()

class AuthFlowTests(APITestCase):
    def setUp(self):
        self.register_url = reverse("user-register")
        self.login_url = reverse("user-login")

    def test_user_registration_and_login(self):
        register_data = {
            "username": "testauthuser",
            "email": "auth@example.com",
            "password": "StrongPass123!",
            "first_name": "Test",
            "last_name": "Auth"
        }
        reg_response = self.client.post(self.register_url, register_data, format="json")
        self.assertEqual(reg_response.status_code, 201)
        self.assertTrue(User.objects.filter(username="testauthuser").exists())

        login_data = {
            "identifier": "auth@example.com",
            "password": "StrongPass123!"
        }
        login_response = self.client.post(self.login_url, login_data, format="json")
        self.assertEqual(login_response.status_code, 200)
        self.assertIn("access", login_response.data)
        self.assertIn("refresh", login_response.data)