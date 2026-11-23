from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from app.models.user import UserPlan, UserRole
from app.models.project import ProjectStatus
from app.models.withdrawal import WithdrawalStatus, WithdrawalMethod


class AdminStats(BaseModel):
    total_users: int
    total_freelancers: int
    total_clients: int
    total_projects: int
    open_projects: int
    in_progress_projects: int
    completed_projects: int
    total_bids: int
    total_transactions_volume_cents: int
    total_commission_cents: int
    pending_withdrawals: int
    pending_withdrawals_amount_cents: int
    revenue_this_month_cents: int
    users_by_plan: dict
    projects_by_status: dict


class AdminUserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    full_name: Optional[str]
    avatar_url: Optional[str]
    role: UserRole
    plan: UserPlan
    is_verified: bool
    is_active: bool
    is_banned: bool
    balance_cents: int
    rating: float
    reviews_count: int
    completed_projects: int
    stripe_customer_id: Optional[str]
    stripe_subscription_id: Optional[str]
    created_at: datetime
    last_login_at: Optional[datetime]


class AdminProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    client_id: int
    client_name: Optional[str]
    freelancer_id: Optional[int]
    freelancer_name: Optional[str]
    title: str
    status: ProjectStatus
    budget_min: int
    budget_max: Optional[int]
    bid_count: int
    created_at: datetime
    updated_at: datetime


class AdminWithdrawalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    user_email: str
    user_name: Optional[str]
    amount_cents: int
    commission_cents: int
    net_amount_cents: int
    method: WithdrawalMethod
    method_details: dict
    status: WithdrawalStatus
    admin_id: Optional[int]
    admin_notes: Optional[str]
    processed_at: Optional[datetime]
    completed_at: Optional[datetime]
    failure_reason: Optional[str]
    created_at: datetime


class WithdrawalAction(BaseModel):
    action: str = Field(pattern="^(approve|reject)$")
    admin_notes: Optional[str] = None


class AdminUserListResponse(BaseModel):
    users: List[AdminUserResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class AdminProjectListResponse(BaseModel):
    projects: List[AdminProjectResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class AdminWithdrawalListResponse(BaseModel):
    withdrawals: List[AdminWithdrawalResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class AdminStatsResponse(BaseModel):
    total_users: int
    total_freelancers: int
    total_clients: int
    total_projects: int
    open_projects: int
    in_progress_projects: int
    completed_projects: int
    total_bids: int
    total_transactions_volume_cents: int
    total_commission_cents: int
    pending_withdrawals: int
    pending_withdrawals_amount_cents: int
    revenue_this_month_cents: int
    users_by_plan: dict
    projects_by_status: dict


class AdminTransactionListResponse(BaseModel):
    transactions: List[dict]
    total: int
    page: int
    page_size: int
    total_pages: int


class AdminUserUpdate(BaseModel):
    role: Optional[UserRole] = None
    plan: Optional[UserPlan] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    is_banned: Optional[bool] = None


class AdminProjectUpdate(BaseModel):
    status: Optional[ProjectStatus] = None
    is_featured: Optional[bool] = None
    is_urgent: Optional[bool] = None