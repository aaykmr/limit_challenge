from django.contrib.auth import get_user_model
from django.test import TestCase


User = get_user_model()


class AuthViewsTests(TestCase):
    def test_signup_creates_user_and_returns_session_payload(self):
        response = self.client.post(
            "/api/auth/signup/",
            data={"username": "newuser", "password": "StrongPass123!"},
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertTrue(User.objects.filter(username="newuser").exists())
        self.assertEqual(response.json()["username"], "newuser")
        self.assertTrue(response.json()["isAuthenticated"])

    def test_login_success(self):
        User.objects.create_user(username="demo", password="StrongPass123!")

        response = self.client.post(
            "/api/auth/login/",
            data={"username": "demo", "password": "StrongPass123!"},
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["username"], "demo")
        self.assertTrue(response.json()["isAuthenticated"])

    def test_login_invalid_credentials_returns_400(self):
        User.objects.create_user(username="demo", password="StrongPass123!")

        response = self.client.post(
            "/api/auth/login/",
            data={"username": "demo", "password": "wrong-password"},
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["detail"], "Invalid username or password.")

    def test_session_endpoint_anonymous(self):
        response = self.client.get("/api/auth/session/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {"id": None, "username": None, "isAuthenticated": False},
        )

    def test_session_endpoint_authenticated(self):
        user = User.objects.create_user(username="session-user", password="StrongPass123!")
        self.client.force_login(user)

        response = self.client.get("/api/auth/session/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["username"], "session-user")
        self.assertTrue(response.json()["isAuthenticated"])
