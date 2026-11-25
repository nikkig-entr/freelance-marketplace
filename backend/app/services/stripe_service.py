import stripe
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.config import get_settings
from app.models.user import User
from app.models.subscription import Subscription, SubscriptionStatus, SubscriptionPlan
from app.models.withdrawal import Withdrawal
from app.models.transaction import Transaction

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
        plan: SubscriptionPlan,
        db: AsyncSession,
        success_url: Optional[str] = None,
        cancel_url: Optional[str] = None,
    ) -> str:
        """Create Stripe Checkout session for subscription."""
        # Validate price_id belongs to the correct plan
        await StripeService._validate_price_id(price_id, plan)

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
    async def _validate_price_id(price_id: str, plan: SubscriptionPlan) -> None:
        """Validate that the price_id matches the expected plan."""
        # In production, fetch the price from Stripe and verify it matches the plan
        # For now, do a basic format check and mapping
        valid_price_prefixes = {
            SubscriptionPlan.PRO: "price_pro_",
            SubscriptionPlan.AGENCY: "price_agency_",
        }
        expected_prefix = valid_price_prefixes.get(plan)
        if expected_prefix and not price_id.startswith(expected_prefix):
            raise ValueError(f"Invalid price_id for plan {plan.value}: expected prefix '{expected_prefix}'")

    @staticmethod
    async def create_deposit_checkout_session(
        user: User,
        amount_cents: int,
        db: AsyncSession,
        success_url: Optional[str] = None,
        cancel_url: Optional[str] = None,
    ) -> str:
        """Create a Stripe Checkout session for account deposits."""
        customer_id = await StripeService.get_or_create_customer(user, db)

        session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "usd",
                    "product_data": {
                        "name": "Account Deposit",
                        "description": f"Add ${amount_cents / 100:.2f} to your freelance account",
                    },
                    "unit_amount": amount_cents,
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url=success_url or settings.STRIPE_SUCCESS_URL + "?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=cancel_url or settings.STRIPE_CANCEL_URL,
            metadata={
                "user_id": str(user.id),
                "type": "deposit",
                "amount_cents": str(amount_cents),
            },
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
    async def create_withdrawal_transfer(withdrawal: Withdrawal) -> stripe.Transfer:
        """Create a Stripe Transfer for withdrawal (to connected account)."""
        transfer = stripe.Transfer.create(
            amount=withdrawal.net_amount_cents,
            currency="usd",
            destination=withdrawal.user.stripe_account_id,
            metadata={
                "withdrawal_id": str(withdrawal.id),
                "user_id": str(withdrawal.user_id),
            },
        )
        return transfer

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
        elif event_type == "transfer.created":
            await StripeService._handle_transfer_created(data)

        return {"status": "ok"}

    @staticmethod
    async def _handle_checkout_completed(session: Dict[str, Any]) -> None:
        """Handle completed checkout session."""
        from app.core.database import async_session_maker

        metadata = session.get("metadata", {})
        user_id = metadata.get("user_id")
        session_type = metadata.get("type")

        if session_type == "deposit" and user_id:
            amount_cents = int(metadata.get("amount_cents", 0))

            async with async_session_maker() as db:
                result = await db.execute(select(User).where(User.id == int(user_id)))
                user = result.scalar_one_or_none()
                if not user:
                    return

                # Create transaction record
                transaction = Transaction(
                    user_id=user.id,
                    amount_cents=amount_cents,
                    type="deposit",
                    status="completed",
                    stripe_payment_intent_id=session.get("payment_intent"),
                    description=f"Deposit via Stripe Checkout",
                )
                db.add(transaction)

                # Update user balance
                user.balance_cents += amount_cents

                await db.commit()

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
            plan = SubscriptionPlan(plan_str)
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
            sub.stripe_current_period_start = datetime.fromtimestamp(
                subscription["current_period_start"], tz=timezone.utc
            )
            sub.stripe_current_period_end = datetime.fromtimestamp(
                subscription["current_period_end"], tz=timezone.utc
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
            user.plan = SubscriptionPlan.STARTER
            user.stripe_subscription_id = None
            user.stripe_price_id = None
            user.plan_expires_at = None

            result = await db.execute(
                select(Subscription).where(Subscription.user_id == user.id)
            )
            sub = result.scalar_one_or_none()
            if sub:
                sub.status = SubscriptionStatus.CANCELED
                sub.plan = SubscriptionPlan.STARTER

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
    async def _handle_transfer_created(transfer: Dict[str, Any]) -> None:
        """Handle transfer creation (withdrawal)."""
        from app.core.database import async_session_maker

        metadata = transfer.get("metadata", {})
        withdrawal_id = metadata.get("withdrawal_id")

        if withdrawal_id:
            async with async_session_maker() as db:
                result = await db.execute(select(Withdrawal).where(Withdrawal.id == int(withdrawal_id)))
                withdrawal = result.scalar_one_or_none()
                if withdrawal:
                    withdrawal.status = "completed"
                    withdrawal.stripe_transfer_id = transfer["id"]
                    await db.commit()

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

    @staticmethod
    async def get_subscription(subscription_id: str) -> stripe.Subscription:
        """Get Stripe subscription."""
        return stripe.Subscription.retrieve(subscription_id)

    @staticmethod
    async def cancel_subscription_stripe(subscription_id: str) -> stripe.Subscription:
        """Cancel Stripe subscription at period end."""
        return stripe.Subscription.modify(
            subscription_id,
            cancel_at_period_end=True,
        )

    @staticmethod
    async def list_invoices(customer_id: str, limit: int = 20) -> list[stripe.Invoice]:
        """List customer invoices."""
        invoices = stripe.Invoice.list(
            customer=customer_id,
            limit=limit,
        )
        return invoices.data