from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from app.models.user import UserPlan
from app.models.subscription import SubscriptionStatus, BillingInterval


class CheckoutRequest(BaseModel):
    plan: UserPlan
    success_url: Optional[str] = None
    cancel_url: Optional[str] = None


class CheckoutResponse(BaseModel):
    checkout_url: str
    session_id: str


class PortalResponse(BaseModel):
    portal_url: str


class PlanInfo(BaseModel):
    plan: UserPlan
    name: str
    price_cents: int
    currency: str = "USD"
    interval: str = "month"
    features: List[str]
    limits: dict
    commission_pct: int
    stripe_price_id: Optional[str] = None
    is_current: bool = False


class SubscriptionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    plan: UserPlan
    status: SubscriptionStatus
    stripe_customer_id: str
    stripe_subscription_id: Optional[str]
    stripe_price_id: Optional[str]
    current_period_start: Optional[datetime]
    current_period_end: Optional[datetime]
    cancel_at_period_end: bool
    trial_start: Optional[datetime]
    trial_end: Optional[datetime]
    created_at: datetime
    updated_at: datetime


class BillingHistoryResponse(BaseModel):
    subscriptions: List[SubscriptionResponse]
    invoices: List[dict]  # Stripe invoice objects


class PlanResponse(BaseModel):
    """Response for a single plan."""
    id: str
    name: str
    price_monthly_cents: int
    price_yearly_cents: int
    features: List[str]
    limits: dict


class SubscriptionCreate(BaseModel):
    plan_id: str
    billing_interval: BillingInterval
    success_url: str
    cancel_url: str


class CheckoutSessionResponse(BaseModel):
    checkout_url: str
    session_id: str


class PortalSessionResponse(BaseModel):
    portal_url: str


class InvoiceResponse(BaseModel):
    id: str
    amount_due: int
    amount_paid: int
    currency: str
    status: str
    created: datetime
    period_start: datetime
    period_end: datetime
    pdf_url: Optional[str] = None


class InvoiceListResponse(BaseModel):
    invoices: List[InvoiceResponse]
    total: int