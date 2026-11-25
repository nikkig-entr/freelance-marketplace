from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.dependencies import get_db, get_current_user
from app.models.user import User, UserRole
from app.models.subscription import Subscription, SubscriptionStatus, BillingInterval, SubscriptionPlan
from app.schemas.billing import (
    PlanResponse, SubscriptionResponse, SubscriptionCreate,
    CheckoutSessionResponse, PortalSessionResponse,
    InvoiceResponse, InvoiceListResponse
)
from app.services.stripe_service import StripeService
from app.services.notifications import create_notification

router = APIRouter()


# Plan configurations
PLANS = {
    "starter": {
        "name": "Starter",
        "price_monthly_cents": 0,
        "price_yearly_cents": 0,
        "features": [
            "Up to 10 bids per week",
            "Basic project search",
            "Standard support",
            "2% platform fee",
        ],
        "limits": {
            "weekly_bids": 10,
            "ai_requests": 0,
            "featured_projects": 0,
        },
    },
    "pro": {
        "name": "Pro",
        "price_monthly_cents": 2900,  # $29/month
        "price_yearly_cents": 29000,  # $290/year (save ~17%)
        "features": [
            "Up to 50 bids per week",
            "Advanced project search & filters",
            "AI-powered proposal generation (50/month)",
            "AI profile optimization",
            "Priority support",
            "1.5% platform fee",
            "Featured project listings",
        ],
        "limits": {
            "weekly_bids": 50,
            "ai_requests": 50,
            "featured_projects": 3,
        },
        "stripe_price_id_monthly": "price_pro_monthly",
        "stripe_price_id_yearly": "price_pro_yearly",
    },
    "agency": {
        "name": "Agency",
        "price_monthly_cents": 9900,  # $99/month
        "price_yearly_cents": 99000,  # $990/year (save ~17%)
        "features": [
            "Unlimited bids",
            "Advanced analytics & insights",
            "AI-powered everything (200/month)",
            "Team collaboration (up to 5 members)",
            "White-label options",
            "1% platform fee",
            "Unlimited featured projects",
            "Dedicated account manager",
            "API access",
        ],
        "limits": {
            "weekly_bids": 999,
            "ai_requests": 200,
            "featured_projects": 999,
        },
        "stripe_price_id_monthly": "price_agency_monthly",
        "stripe_price_id_yearly": "price_agency_yearly",
    },
}


@router.get("/plans", response_model=list[PlanResponse])
async def list_plans():
    """List available subscription plans."""
    plans = []
    for key, plan in PLANS.items():
        plans.append(PlanResponse(
            id=key,
            name=plan["name"],
            price_monthly_cents=plan["price_monthly_cents"],
            price_yearly_cents=plan["price_yearly_cents"],
            features=plan["features"],
            limits=plan["limits"],
        ))
    return plans


@router.get("/plans/{plan_id}", response_model=PlanResponse)
async def get_plan(plan_id: str):
    """Get plan details."""
    if plan_id not in PLANS:
        raise HTTPException(status_code=404, detail="Plan not found")

    plan = PLANS[plan_id]
    return PlanResponse(
        id=plan_id,
        name=plan["name"],
        price_monthly_cents=plan["price_monthly_cents"],
        price_yearly_cents=plan["price_yearly_cents"],
        features=plan["features"],
        limits=plan["limits"],
    )


@router.get("/subscription", response_model=Optional[SubscriptionResponse])
async def get_current_subscription(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user's subscription."""
    query = select(Subscription).where(
        Subscription.user_id == current_user.id,
        Subscription.status.in_([SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING, SubscriptionStatus.PAST_DUE])
    ).order_by(Subscription.created_at.desc())
    result = await db.execute(query)
    subscription = result.scalar_one_or_none()

    if not subscription:
        return None

    return subscription


@router.post("/subscription/checkout", response_model=CheckoutSessionResponse)
async def create_subscription_checkout_session(
    subscription_data: SubscriptionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create Stripe Checkout session for subscription."""
    plan_id = subscription_data.plan_id
    billing_interval = subscription_data.billing_interval

    if plan_id not in PLANS:
        raise HTTPException(status_code=404, detail="Plan not found")

    if plan_id == "starter":
        raise HTTPException(status_code=400, detail="Starter plan is free, no checkout needed")

    plan = PLANS[plan_id]
    interval_key = "monthly" if billing_interval == BillingInterval.MONTHLY else "yearly"
    price_id = plan.get(f"stripe_price_id_{interval_key}")
    if not price_id:
        raise HTTPException(status_code=400, detail="Invalid billing interval for this plan")

    # Create or get Stripe customer
    if not current_user.stripe_customer_id:
        # Would create Stripe customer here
        pass

    plan_enum = SubscriptionPlan(plan_id)
    try:
        checkout_url = await StripeService.create_checkout_session(
            user=current_user,
            price_id=price_id,
            plan=plan_enum,
            db=db,
            success_url=subscription_data.success_url,
            cancel_url=subscription_data.cancel_url,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return CheckoutSessionResponse(
        checkout_url=checkout_url,
        session_id="session_id",  # Would need to get from session if needed
    )


@router.post("/subscription/portal", response_model=PortalSessionResponse)
async def create_billing_portal_session(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create Stripe Billing Portal session."""
    if not current_user.stripe_customer_id:
        raise HTTPException(status_code=400, detail="No billing account found")

    portal_url = await StripeService.create_portal_session(current_user.stripe_customer_id)

    return PortalSessionResponse(portal_url=portal_url)


@router.post("/subscription/cancel", response_model=SubscriptionResponse)
async def cancel_current_subscription(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Cancel current subscription."""
    query = select(Subscription).where(
        Subscription.user_id == current_user.id,
        Subscription.status.in_([SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING, SubscriptionStatus.PAST_DUE])
    ).order_by(Subscription.created_at.desc())
    result = await db.execute(query)
    subscription = result.scalar_one_or_none()

    if not subscription:
        raise HTTPException(status_code=404, detail="No active subscription found")

    # Cancel in Stripe
    await StripeService.cancel_subscription(current_user, db)

    # Update local subscription
    subscription.status = SubscriptionStatus.CANCELED
    subscription.cancel_at_period_end = True
    await db.commit()
    await db.refresh(subscription)

    # Downgrade user plan at period end
    # This would be handled by webhook in production

    return subscription


@router.get("/invoices", response_model=InvoiceListResponse)
async def list_user_invoices(
    page: int = 1,
    page_size: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List user's invoices."""
    if not current_user.stripe_customer_id:
        return InvoiceListResponse(items=[], total=0, page=page, page_size=page_size, total_pages=0)

    invoices = await StripeService.list_invoices(current_user.stripe_customer_id, limit=page_size)
    # Convert to response format
    items = [
        InvoiceResponse(
            id=inv.id,
            amount_cents=inv.amount_paid,
            currency=inv.currency,
            status=inv.status,
            invoice_url=inv.hosted_invoice_url,
            invoice_pdf=inv.invoice_pdf,
            created_at=inv.created,
            period_start=inv.period_start,
            period_end=inv.period_end,
        )
        for inv in invoices
    ]

    return InvoiceListResponse(
        items=items,
        total=len(items),
        page=page,
        page_size=page_size,
        total_pages=1,
    )


# Webhook endpoint (called by Stripe)
@router.post("/webhooks/stripe", status_code=status.HTTP_200_OK)
async def stripe_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Handle Stripe webhook events."""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    if not sig_header:
        raise HTTPException(status_code=400, detail="Missing stripe-signature header")

    try:
        await StripeService.handle_webhook(payload, sig_header)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Webhook error: {str(e)}")

    return {"received": True}