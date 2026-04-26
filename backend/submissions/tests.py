from django.contrib.auth import get_user_model
from django.test import TestCase

from submissions.models import Broker, Company, Submission, TeamMember


User = get_user_model()


class SubmissionAccessTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="viewer", password="StrongPass123!")
        broker = Broker.objects.create(name="Broker One", primary_contact_email="broker@example.com")
        company = Company.objects.create(
            legal_name="Acme Corp",
            industry="Tech",
            headquarters_city="Bengaluru",
        )
        owner = TeamMember.objects.create(full_name="Owner Name", email="owner@example.com")
        self.submission = Submission.objects.create(
            company=company,
            broker=broker,
            owner=owner,
            summary="First submission",
        )

    def test_submissions_list_requires_authentication(self):
        response = self.client.get("/api/submissions/")

        self.assertIn(response.status_code, (401, 403))

    def test_submissions_list_authenticated(self):
        self.client.force_login(self.user)

        response = self.client.get("/api/submissions/")

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["count"], 1)
        self.assertEqual(body["results"][0]["id"], self.submission.id)

    def test_submission_detail_authenticated(self):
        self.client.force_login(self.user)

        response = self.client.get(f"/api/submissions/{self.submission.id}/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["id"], self.submission.id)
