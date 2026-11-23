import pytest
from datetime import timedelta
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_password,
    get_password_hash,
    verify_token,
)
from app.models.user import UserRole, UserPlan


class TestPasswordHashing:
    """Tests for password hashing and verification."""

    def test_get_password_hash_returns_string(self):
        """Test that get_password_hash returns a string."""
        password = "SecurePass123!"
        hashed = get_password_hash(password)
        assert isinstance(hashed, str)
        assert len(hashed) > 0
        assert hashed != password

    def test_verify_password_correct(self):
        """Test verifying a correct password."""
        password = "SecurePass123!"
        hashed = get_password_hash(password)
        assert verify_password(password, hashed) is True

    def test_verify_password_incorrect(self):
        """Test verifying an incorrect password."""
        password = "SecurePass123!"
        wrong_password = "WrongPass123!"
        hashed = get_password_hash(password)
        assert verify_password(wrong_password, hashed) is False

    def test_verify_password_empty(self):
        """Test verifying with empty password."""
        hashed = get_password_hash("SecurePass123!")
        assert verify_password("", hashed) is False


class TestTokenCreation:
    """Tests for JWT token creation."""

    def test_create_access_token(self):
        """Test creating an access token."""
        data = {"sub": "123", "role": "freelancer", "plan": "pro"}
        token = create_access_token(data)
        assert isinstance(token, str)
        assert len(token) > 0
        assert "." in token  # JWT has 3 parts separated by dots

    def test_create_access_token_with_expiry(self):
        """Test creating an access token with custom expiry."""
        data = {"sub": "123"}
        expires_delta = timedelta(minutes=30)
        token = create_access_token(data, expires_delta=expires_delta)
        assert isinstance(token, str)

    def test_create_refresh_token(self):
        """Test creating a refresh token."""
        data = {"sub": "123"}
        token = create_refresh_token(data)
        assert isinstance(token, str)
        assert len(token) > 0

    def test_decode_token_valid(self):
        """Test decoding a valid token."""
        data = {"sub": "123", "role": "freelancer", "plan": "pro"}
        token = create_access_token(data)
        decoded = decode_token(token)
        assert decoded["sub"] == "123"
        assert decoded["role"] == "freelancer"
        assert decoded["plan"] == "pro"

    def test_decode_token_invalid(self):
        """Test decoding an invalid token returns None."""
        result = decode_token("invalid.token.string")
        assert result is None

    def test_decode_token_expired(self):
        """Test decoding an expired token returns None."""
        data = {"sub": "123"}
        expires_delta = timedelta(seconds=-1)
        token = create_access_token(data, expires_delta=expires_delta)
        result = decode_token(token)
        assert result is None


class TestTokenVerification:
    """Tests for token verification."""

    def test_verify_token_valid(self):
        """Test verifying a valid access token."""
        data = {"sub": "123", "role": "freelancer", "plan": "pro"}
        token = create_access_token(data)
        payload = verify_token(token, "access")
        assert payload["sub"] == "123"
        assert payload["role"] == "freelancer"
        assert payload["plan"] == "pro"
        assert payload["type"] == "access"

    def test_verify_token_refresh(self):
        """Test verifying a valid refresh token."""
        data = {"sub": "123"}
        token = create_refresh_token(data)
        payload = verify_token(token, "refresh")
        assert payload["sub"] == "123"
        assert payload["type"] == "refresh"

    def test_verify_token_wrong_type(self):
        """Test verifying token with wrong type."""
        data = {"sub": "123"}
        access_token = create_access_token(data)
        with pytest.raises(Exception):
            verify_token(access_token, "refresh")

    def test_verify_token_invalid(self):
        """Test verifying an invalid token."""
        with pytest.raises(Exception):
            verify_token("invalid.token", "access")