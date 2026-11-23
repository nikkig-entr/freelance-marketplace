import stripe
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.config import get_settings
from app.models.user import User
from app.models.subscription import Subscription, SubscriptionStatus
from app.models.user import UserPlan

settings = get_settings()
stripe.api_key = settings.STRIPE_SECRET_KEY


class StripeService:
    """Stripe service for billing operations."""

    @staticmethod
    async def create_customer(email: str, name: str, user_id: int) -> stripe.Customer:
        """Create a Stripe customer."""
        customer = stripe.Customer.create(
            email=email,
            name=name,
            metadata={"user_id": str(user_id)},
        )
        return customer

    @staticmethod
    async def get_or_create_customer(user: User, db: AsyncSession) -> str:
        """Get existing or create new Stripe customer."""
        if user.stripe_customer_id:
            try:
                customer = stripe.Customer.retrieve(user.stripe_customer_id)
                return customer.id
            except stripe.StripeError:
                pass  # Customer deleted, create new

        customer = await StripeService.create_customer(user.email, user.full_name or "", user.id)
        user.stripe_customer_id = customer.id
        await db.commit()
        return customer.id

    @staticmethod
    async def create_checkout_session(
        user: User,
        price_id: str,
        plan: UserPlan,
        db: AsyncSession,
        success_url: Optional[str] = None,
        cancel_url: Optional[str] = None,
    ) -> str:
        """Create Stripe Checkout session for subscription."""
        customer_id = await StripeService.get_or_create_customer(user, db)

        session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=["card"],
            mode="subscription",
            line_items=[{
                "price": price_id,
                "quantity": 1,
            }],
            success_url=success_url or settings.STRIPE_SUCCESS_URL + "&session_id={CHECKOUT_SESSION_ID}",
            cancel_url=cancel_url or settings.STRIPE_CANCEL_URL,
            metadata={
                "user_id": str(user.id),
                "plan": plan.value,
            },
            subscription_data={
                "metadata": {
                    "user_id": str(user.id),
                    "plan": plan.value,
                },
            },
            allow_promotion_codes=True,
        )
        return session.url

    @staticmethod
    async def create_portal_session(customer_id: str) -> str:
        """Create Stripe Customer Portal session."""
        session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=f"{settings.FRONTEND_URL}/settings/billing",
        )
        return session.url

    @staticmethod
    async def handle_webhook(payload: bytes, sig_header: str) -> Dict[str, Any]:
        """Handle Stripe webhook events."""
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError:
            raise ValueError("Invalid payload")
        except stripe.SignatureVerificationError:
            raise ValueError("Invalid signature")

        return await StripeService._process_event(event)

    @staticmethod
    async def _process_event(event: stripe.Event) -> Dict[str, Any]:
        """Process Stripe event."""
        event_type = event["type"]
        data = event["data"]["object"]

        if event_type == "checkout.session.completed":
            await StripeService._handle_checkout_completed(data)
        elif event_type in ["customer.subscription.created", "customer.subscription.updated"]:
            await StripeService._handle_subscription_updated(data)
        elif event_type == "customer.subscription.deleted":
            await StripeService._handle_subscription_deleted(data)
        elif event_type == "invoice.payment_failed":
            await StripeService._handle_payment_failed(data)
        elif event_type == "invoice.payment_succeeded":
            await StripeService._handle_payment_succeeded(data)

        return {"status": "ok"}

    @staticmethod
    async def _handle_checkout_completed(session: Dict[str, Any]) -> None:
        """Handle successful checkout."""
        # Subscription will be created via customer.subscription.created event
        pass

    @staticmethod
    async def _handle_subscription_updated(subscription: Dict[str, Any]) -> None:
        """Handle subscription created/updated."""
        from app.core.database import async_session_maker

        metadata = subscription.get("metadata", {})
        user_id = metadata.get("user_id")
        plan_str = metadata.get("plan")

        if not user_id or not plan_str:
            return

        try:
            plan = UserPlan(plan_str)
        except ValueError:
            return

        async with async_session_maker() as db:
            # Get user
            result = await db.execute(select(User).where(User.id == int(user_id)))
            user = result.scalar_one_or_none()
            if not user:
                return

            # Update or create subscription record
            result = await db.execute(
                select(Subscription).where(Subscription.user_id == user.id)
            )
            sub = result.scalar_one_or_none()

            if sub is None:
                sub = Subscription(user_id=user.id)
                db.add(sub)

            sub.plan = plan
            sub.stripe_customer_id = subscription["customer"]
            sub.stripe_subscription_id = subscription["id"]
            sub.stripe_price_id = subscription["items"]["data"][0]["price"]["id"] if subscription["items"]["data"] else None
            sub.stripe_current_period_start = __import__("datetime").datetime.fromtimestamp(
                subscription["current_period_start"], tz=__import__("datetime").timezone.utc
            )
            sub.stripe_current_period_end = __import__("datetime").datetime.fromtimestamp(
                subscription["current_period_end"], tz=__import__("datetime").timezone.utc
            )
            sub.stripe_cancel_at_period_end = subscription.get("cancel_at_period_end", False)

            # Map Stripe status to our status
            status_map = {
                "active": SubscriptionStatus.ACTIVE,
                "past_due": SubscriptionStatus.PAST_DUE,
                "canceled": SubscriptionStatus.CANCELED,
                "incomplete": SubscriptionStatus.INCOMPLETE,
                "trialing": SubscriptionStatus.TRIALING,
                "paused": SubscriptionStatus.PAUSED,
            }
            sub.status = status_map.get(subscription["status"], SubscriptionStatus.INCOMPLETE)

            # Update user plan
            user.plan = plan
            user.stripe_subscription_id = subscription["id"]
            user.stripe_price_id = sub.stripe_price_id
            user.plan_expires_at = sub.stripe_current_period_end

            await db.commit()

    @staticmethod
    async def _handle_subscription_deleted(subscription: Dict[str, Any]) -> None:
        """Handle subscription canceled."""
        from app.core.database import async_session_maker

        metadata = subscription.get("metadata", {})
        user_id = metadata.get("user_id")

        if not user_id:
            return

        async with async_session_maker() as db:
            result = await db.execute(select(User).where(User.id == int(user_id)))
            user = result.scalar_one_or_none()
            if not user:
                return

            # Downgrade to starter
            user.plan = UserPlan.STARTER
            user.stripe_subscription_id = None
            user.stripe_price_id = None
            user.plan_expires_at = None

            result = await db.execute(
                select(Subscription).where(Subscription.user_id == user.id)
            )
            sub = result.scalar_one_or_none()
            if sub:
                sub.status = SubscriptionStatus.CANCELED
                sub.plan = UserPlan.STARTER

            await db.commit()

    @staticmethod
    async def _handle_payment_failed(invoice: Dict[str, Any]) -> None:
        """Handle failed payment."""
        # Could send notification to user
        pass

    @staticmethod
    async def _handle_payment_succeeded(invoice: Dict[str, Any]) -> None:
        """Handle successful payment."""
        # Could send receipt
        pass

    @staticmethod
    async def cancel_subscription(user: User, db: AsyncSession) -> bool:
        """Cancel user's subscription at period end."""
        if not user.stripe_subscription_id:
            return False

        try:
            stripe.Subscription.modify(
                user.stripe_subscription_id,
                cancel_at_period_end=True,
            )
            return True
        except stripe.StripeError:
            return False

    @staticmethod
    async def reactivate_subscription(user: User, db: AsyncSession) -> bool:
        """Reactivate canceled subscription."""
        if not user.stripe_subscription_id:
            return False

        try:
            stripe.Subscription.modify(
                user.stripe_subscription_id,
                cancel_at_period_end=False,
            )
            return True
        except stripe.StripeError:
            return False

    @staticmethod
    async def get_upcoming_invoice(customer_id: str) -> Optional[Dict[str, Any]]:
        """Get upcoming invoice for customer."""
        try:
            invoice = stripe.Invoice.upcoming(customer=customer_id)
            return invoice
        except stripe.StripeError:
            return None