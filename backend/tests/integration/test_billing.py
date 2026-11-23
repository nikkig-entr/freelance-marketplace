import pytest
from httpx import AsyncClient
from app.main import app
from unittest.mock import patch, MagicMock


class TestBillingEndpoints:
    """Integration tests for billing/subscription endpoints."""

    @pytest.mark.asyncio
    async def test_get_subscription_plans(self, async_client, db_session, test_user, auth_headers):
        """Test getting available subscription plans."""
        response = await async_client.get("/api/v1/plans", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        plan_ids = [p["id"] for p in data]
        assert "starter" in plan_ids
        assert "pro" in plan_ids
        assert "agency" in plan_ids
        starter_plan = next(p for p in data if p["id"] == "starter")
        assert starter_plan["price_monthly_cents"] == 0
        pro_plan = next(p for p in data if p["id"] == "pro")
        assert pro_plan["price_monthly_cents"] > 0
        agency_plan = next(p for p in data if p["id"] == "agency")
        assert agency_plan["price_monthly_cents"] > 0

    @pytest.mark.asyncio
    async def test_get_plan_detail(self, async_client, db_session, test_user, auth_headers):
        """Test getting a specific plan detail."""
        response = await async_client.get("/api/v1/plans/pro", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "pro"
        assert data["name"] == "Pro"
        assert data["price_monthly_cents"] == 2900

    @pytest.mark.asyncio
    async def test_create_checkout_session_starter(self, async_client, db_session, test_user, auth_headers):
        """Test creating checkout for Starter (free) - should not need Stripe."""
        response = await async_client.post("/api/v1/subscription/checkout", json={
            "plan_id": "starter",
            "billing_interval": "month",
            "success_url": "https://example.com/success",
            "cancel_url": "https://example.com/cancel",
        }, headers=auth_headers)

        # Starter plan is free, should return 400
        assert response.status_code == 400
        assert "free" in response.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_create_checkout_session_pro(self, async_client, db_session, test_user, auth_headers):
        """Test creating checkout session for Pro plan."""
        with patch('app.services.stripe.create_subscription_checkout') as mock_checkout:
            mock_session = MagicMock()
            mock_session.id = "cs_test123"
            mock_session.url = "https://checkout.stripe.com/test"
            mock_checkout.return_value = mock_session

            response = await async_client.post("/api/v1/subscription/checkout", json={
                "plan_id": "pro",
                "billing_interval": "month",
                "success_url": "https://example.com/success",
                "cancel_url": "https://example.com/cancel",
            }, headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert "checkout_url" in data
        assert "checkout.stripe.com" in data["checkout_url"]

    @pytest.mark.asyncio
    async def test_create_checkout_session_agency(self, async_client, db_session, test_user, auth_headers):
        """Test creating checkout session for Agency plan."""
        with patch('app.services.stripe.create_subscription_checkout') as mock_checkout:
            mock_session = MagicMock()
            mock_session.id = "cs_test123"
            mock_session.url = "https://checkout.stripe.com/test"
            mock_checkout.return_value = mock_session

            response = await async_client.post("/api/v1/subscription/checkout", json={
                "plan_id": "agency",
                "billing_interval": "year",
                "success_url": "https://example.com/success",
                "cancel_url": "https://example.com/cancel",
            }, headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert "checkout_url" in data

    @pytest.mark.asyncio
    async def test_create_checkout_invalid_plan(self, async_client, db_session, test_user, auth_headers):
        """Test creating checkout with invalid plan."""
        response = await async_client.post("/api/v1/subscription/checkout", json={
            "plan_id": "invalid_plan",
            "billing_interval": "month",
            "success_url": "https://example.com/success",
            "cancel_url": "https://example.com/cancel",
        }, headers=auth_headers)

        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_get_current_subscription(self, async_client, db_session, test_user, auth_headers):
        """Test getting current user subscription (no active subscription for starter)."""
        response = await async_client.get("/api/v1/subscription", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data is None  # No active subscription for starter user

    @pytest.mark.asyncio
    async def test_create_portal_session(self, async_client, db_session, test_user, auth_headers):
        """Test creating billing portal session - requires Stripe customer."""
        # Starter user has no Stripe customer
        response = await async_client.post("/api/v1/subscription/portal", headers=auth_headers)

        assert response.status_code == 400
        assert "billing account" in response.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_cancel_subscription(self, async_client, db_session, test_user, auth_headers):
        """Test canceling subscription - no active subscription for starter."""
        response = await async_client.post("/api/v1/subscription/cancel", headers=auth_headers)

        # No active subscription to cancel
        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_webhook_subscription_created(self, async_client, db_session):
        """Test Stripe webhook for subscription created."""
        with patch('app.services.stripe.handle_stripe_webhook') as mock_webhook:
            mock_webhook.return_value = {"status": "processed"}

            response = await async_client.post("/api/v1/webhooks/stripe", json={
                "type": "customer.subscription.created",
                "data": {"object": {"id": "sub_test123"}},
            }, headers={"Stripe-Signature": "sig_test"})

        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_webhook_invalid_signature(self, async_client, db_session):
        """Test webhook with invalid signature."""
        with patch('app.services.stripe.handle_stripe_webhook') as mock_webhook:
            from stripe._error import SignatureVerificationError
            mock_webhook.side_effect = SignatureVerificationError("Invalid signature", "sig")

            response = await async_client.post("/api/v1/webhooks/stripe", json={
                "type": "test",
            }, headers={"Stripe-Signature": "invalid_sig"})

        assert response.status_code == 400