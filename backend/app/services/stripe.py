import stripe
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.user import User
from app.models.withdrawal import Withdrawal

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


async def create_checkout_session(
    user: User,
    amount_cents: int,
    success_url: str,
    cancel_url: str,
) -> stripe.checkout.Session:
    """Create a Stripe Checkout session for deposits."""
    # Create or get Stripe customer
    if not user.stripe_customer_id:
        customer = stripe.Customer.create(
            email=user.email,
            name=user.full_name,
            metadata={"user_id": str(user.id)},
        )
        user.stripe_customer_id = customer.id
        # Note: In real app, you'd save this to DB
    else:
        customer = stripe.Customer.retrieve(user.stripe_customer_id)

    session = stripe.checkout.Session.create(
        customer=user.stripe_customer_id,
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
        success_url=success_url + "?session_id={CHECKOUT_SESSION_ID}",
        cancel_url=cancel_url,
        metadata={
            "user_id": str(user.id),
            "type": "deposit",
            "amount_cents": str(amount_cents),
        },
    )

    return session


async def create_subscription_checkout(
    customer_id: str,
    price_id: str,
    success_url: str,
    cancel_url: str,
    metadata: dict,
) -> stripe.checkout.Session:
    """Create a Stripe Checkout session for subscriptions."""
    session = stripe.checkout.Session.create(
        customer=customer_id,
        payment_method_types=["card"],
        line_items=[{
            "price": price_id,
            "quantity": 1,
        }],
        mode="subscription",
        success_url=success_url + "?session_id={CHECKOUT_SESSION_ID}",
        cancel_url=cancel_url,
        metadata=metadata,
        subscription_data={
            "metadata": metadata,
        },
    )

    return session


async def create_portal_session(
    customer_id: str,
    return_url: str,
) -> stripe.billing_portal.Session:
    """Create a Stripe Billing Portal session."""
    session = stripe.billing_portal.Session.create(
        customer=customer_id,
        return_url=return_url,
    )

    return session


async def create_withdrawal_transfer(withdrawal: Withdrawal) -> stripe.Transfer:
    """Create a Stripe Transfer for withdrawal (to connected account)."""
    # This assumes the user has a connected Stripe account
    # In production, you'd use Stripe Connect for marketplace payouts

    # For now, create a transfer to the user's bank account via Stripe
    # This requires the user to have a connected account or use manual payouts

    transfer = stripe.Transfer.create(
        amount=withdrawal.net_amount_cents,
        currency="usd",
        destination=withdrawal.user.stripe_account_id,  # Connected account ID
        metadata={
            "withdrawal_id": str(withdrawal.id),
            "user_id": str(withdrawal.user_id),
        },
    )

    return transfer


async def get_subscription(subscription_id: str) -> stripe.Subscription:
    """Get Stripe subscription."""
    return stripe.Subscription.retrieve(subscription_id)


async def cancel_subscription(subscription_id: str) -> stripe.Subscription:
    """Cancel Stripe subscription."""
    return stripe.Subscription.modify(
        subscription_id,
        cancel_at_period_end=True,
    )


async def list_invoices(customer_id: str, limit: int = 20) -> list[stripe.Invoice]:
    """List customer invoices."""
    invoices = stripe.Invoice.list(
        customer=customer_id,
        limit=limit,
    )
    return invoices.data


async def get_plan_details(plan_id: str) -> dict:
    """Get plan details from Stripe."""
    # This would fetch from Stripe Products/Prices
    return {}


async def handle_stripe_webhook(
    payload: bytes,
    sig_header: str,
    db: AsyncSession,
):
    """Handle Stripe webhook events."""
    webhook_secret = settings.STRIPE_WEBHOOK_SECRET

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError:
        raise ValueError("Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise ValueError("Invalid signature")

    # Handle event types
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        await handle_checkout_completed(session, db)

    elif event["type"] == "invoice.payment_succeeded":
        invoice = event["data"]["object"]
        await handle_invoice_payment_succeeded(invoice, db)

    elif event["type"] == "invoice.payment_failed":
        invoice = event["data"]["object"]
        await handle_invoice_payment_failed(invoice, db)

    elif event["type"] == "customer.subscription.updated":
        subscription = event["data"]["object"]
        await handle_subscription_updated(subscription, db)

    elif event["type"] == "customer.subscription.deleted":
        subscription = event["data"]["object"]
        await handle_subscription_deleted(subscription, db)

    elif event["type"] == "transfer.created":
        transfer = event["data"]["object"]
        await handle_transfer_created(transfer, db)

    return {"received": True}


async def handle_checkout_completed(session: dict, db: AsyncSession):
    """Handle completed checkout session."""
    metadata = session.get("metadata", {})
    user_id = metadata.get("user_id")
    session_type = metadata.get("type")

    if session_type == "deposit":
        amount_cents = int(metadata.get("amount_cents", 0))
        # Create transaction record
        # Update user balance
        pass

    elif user_id and session.get("subscription"):
        # Subscription created
        pass


async def handle_invoice_payment_succeeded(invoice: dict, db: AsyncSession):
    """Handle successful invoice payment."""
    customer_id = invoice.get("customer")
    # Update subscription status, create transaction
    pass


async def handle_invoice_payment_failed(invoice: dict, db: AsyncSession):
    """Handle failed invoice payment."""
    customer_id = invoice.get("customer")
    # Update subscription status to past_due
    pass


async def handle_subscription_updated(subscription: dict, db: AsyncSession):
    """Handle subscription update."""
    # Update local subscription record
    pass


async def handle_subscription_deleted(subscription: dict, db: AsyncSession):
    """Handle subscription cancellation."""
    # Update local subscription record, downgrade user plan
    pass


async def handle_transfer_created(transfer: dict, db: AsyncSession):
    """Handle transfer creation (withdrawal)."""
    metadata = transfer.get("metadata", {})
    withdrawal_id = metadata.get("withdrawal_id")
    if withdrawal_id:
        # Update withdrawal status
        pass