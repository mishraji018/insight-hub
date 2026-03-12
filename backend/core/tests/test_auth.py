import pytest
from django.urls import reverse
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()

@pytest.mark.django_db
class TestAuthentication:
    def setup_method(self):
        self.email = "admin@dashboard.com"
        self.password = "Admin@123"
        self.user = User.objects.create_user(
            email=self.email,
            password=self.password,
            role="executive",
            is_approved=True,  # ✅ ADD
        )
        self.token_url = "/api/token/"
        self.refresh_url = "/api/token/refresh/"
    self.health_url = "/api/health/"

    def test_login_success(self, client):
        """FIXED: Valid credentials return 200 + tokens and user metadata."""
        response = client.post(self.token_url, {
            "email": self.email,
            "password": self.password
        })
        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data
        assert "refresh" in response.data
        assert response.data["email"] == self.email
        assert response.data["role"] == "executive"

    def test_login_wrong_password(self, client):
        """FIXED: Invalid password returns 401."""
        response = client.post(self.token_url, {
            "email": self.email,
            "password": "WrongPassword@123"
        })
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_wrong_email(self, client):
        """FIXED: Invalid email returns 401."""
        response = client.post(self.token_url, {
            "email": "wrong@dashboard.com",
            "password": self.password
        })
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_missing_fields(self, client):
        """FIXED: Missing fields return 400."""
        response = client.post(self.token_url, {
            "email": self.email
        })
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_token_refresh(self, client):
        """FIXED: Valid refresh token returns new access token."""
        login_response = client.post(self.token_url, {
            "email": self.email,
            "password": self.password
        })
        refresh_token = login_response.data["refresh"]
        
        response = client.post(self.refresh_url, {
            "refresh": refresh_token
        })
        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data

    def test_health_check(self, client):
        """FIXED: Health check returns 200 with service status."""
        response = client.get(self.health_url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["status"] == "ok"

    def test_registration_success(self, client):
        """FIXED: Public registration returns 201 + tokens."""
        url = "/api/auth/register/"
        data = {
            "first_name": "New",
            "last_name": "User",
            "email": "newuser@dashboard.com",
            "password": "StrongPassword123!",
            "confirm_password": "StrongPassword123!",
            "role": "analyst"
        }
        response = client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert "access" in response.data
        assert response.data["user"]["role"] == "analyst"

    def test_registration_duplicate_email(self, client):
        """FIXED: Duplicate email registration returns 400."""
        url = "/api/auth/register/"
        data = {
            "first_name": "Admin",
            "last_name": "User",
            "email": self.email, # Already exists from setup_method
            "password": "StrongPassword123!",
            "confirm_password": "StrongPassword123!",
            "role": "executive"
        }
        response = client.post(url, data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "email" in response.data

    def test_change_password_success(self, client):
        """FIXED: Authenticated password change returns 200."""
        # Login first
        login_res = client.post(self.token_url, {"email": self.email, "password": self.password})
        token = login_res.data["access"]
        
        url = "/api/auth/change-password/"
        data = {
            "old_password": self.password,
            "new_password": "NewStrongPassword123!",
            "confirm_new_password": "NewStrongPassword123!"
        }
        response = client.post(url, data, HTTP_AUTHORIZATION=f'Bearer {token}')
        assert response.status_code == status.HTTP_200_OK
        assert response.data["message"] == "Password changed successfully"
