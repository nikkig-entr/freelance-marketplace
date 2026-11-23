import enum
from datetime import datetime, timezone
from typing import TYPE_CHECKING
from uuid import uuid4

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.project import Project
    from app.models.bid import Bid
    from app.models.message import Message
    from app.models.transaction import Transaction
    from app.models.withdrawal import Withdrawal
    from app.models.review import Review
    from app.models.subscription import Subscription


class UserRole(str, enum.Enum):
    FREELANCER = "freelancer"
    CLIENT = "client"
    ADMIN = "admin"


class UserPlan(str, enum.Enum):
    STARTER = "starter"
    PRO = "pro"
    AGENCY = "agency"


class UserStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    BANNED = "banned"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    uuid: Mapped[str] = mapped_column(String(36), unique=True, default=lambda: str(uuid4()), index=True)

    # Auth
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    email_verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Profile
    full_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    website: Mapped[str | None] = mapped_column(String(500), nullable=True)
    skills: Mapped[list[str]] = mapped_column(JSONB, default=list, nullable=False)
    hourly_rate: Mapped[int | None] = mapped_column(Integer, nullable=True)  # in cents
    availability: Mapped[str] = mapped_column(String(50), default="available", nullable=False)
    email_notifications: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Role & Plan
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.FREELANCER, nullable=False, index=True)
    plan: Mapped[UserPlan] = mapped_column(Enum(UserPlan), default=UserPlan.STARTER, nullable=False, index=True)

    # OAuth
    google_id: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True, index=True)
    github_id: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True, index=True)
    telegram_id: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True, index=True)

    # Stripe
    stripe_customer_id: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True, index=True)
    stripe_account_id: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True, index=True)
    stripe_subscription_id: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True, index=True)

    # Balance (in cents)
    balance_cents: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    pending_balance_cents: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Ban status (derived from is_active)
    @property
    def is_banned(self) -> bool:
        return not self.is_active

    # Stats
    rating: Mapped[float] = mapped_column(default=0.0, nullable=False)
    reviews_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    completed_projects: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    owned_projects: Mapped[list["Project"]] = relationship(
        "Project", foreign_keys="Project.client_id", back_populates="client", lazy="selectin"
    )
    bids: Mapped[list["Bid"]] = relationship("Bid", back_populates="freelancer", lazy="selectin")
    sent_messages: Mapped[list["Message"]] = relationship("Message", foreign_keys="Message.sender_id", back_populates="sender", lazy="selectin")
    received_messages: Mapped[list["Message"]] = relationship("Message", foreign_keys="Message.recipient_id", back_populates="recipient", lazy="selectin")
    transactions: Mapped[list["Transaction"]] = relationship("Transaction", foreign_keys="Transaction.user_id", back_populates="user", lazy="selectin")
    withdrawals: Mapped[list["Withdrawal"]] = relationship("Withdrawal", foreign_keys="Withdrawal.user_id", back_populates="user", lazy="selectin")
    given_reviews: Mapped[list["Review"]] = relationship("Review", foreign_keys="Review.reviewer_id", back_populates="reviewer", lazy="selectin")
    received_reviews: Mapped[list["Review"]] = relationship("Review", foreign_keys="Review.reviewee_id", back_populates="reviewee", lazy="selectin")
    subscription: Mapped["Subscription | None"] = relationship("Subscription", back_populates="user", uselist=False, lazy="selectin")
    notifications: Mapped[list["Notification"]] = relationship("Notification", foreign_keys="Notification.user_id", back_populates="user", lazy="selectin")

    __table_args__ = (
        Index("ix_users_email_active", "email", "is_active"),
        Index("ix_users_role_plan", "role", "plan"),
    )

    def get_commission_pct(self) -> int:
        """Get commission percentage based on user's plan."""
        commission_map = {
            "starter": 5,
            "pro": 3,
            "agency": 2,
        }
        return commission_map.get(self.plan.value if hasattr(self.plan, 'value') else self.plan, 5)

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email}, role={self.role}, plan={self.plan})>"