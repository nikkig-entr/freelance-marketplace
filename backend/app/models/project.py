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
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.bid import Bid
    from app.models.message import Message
    from app.models.review import Review


class ProjectStatus(str, enum.Enum):
    DRAFT = "draft"
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    IN_REVIEW = "in_review"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    DISPUTED = "disputed"


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    uuid: Mapped[str] = mapped_column(String(36), unique=True, default=lambda: str(uuid4()), index=True)

    # Ownership
    client_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Basic info
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    subcategory: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    tags: Mapped[list[str]] = mapped_column(JSONB, default=list, nullable=False)

    # Budget
    budget_min: Mapped[int | None] = mapped_column(Integer, nullable=True)  # in cents
    budget_max: Mapped[int | None] = mapped_column(Integer, nullable=True)  # in cents
    is_fixed_price: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Timeline
    deadline: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, index=True)
    estimated_duration_days: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Status
    status: Mapped[ProjectStatus] = mapped_column(Enum(ProjectStatus), default=ProjectStatus.DRAFT, nullable=False, index=True)

    # Featured/urgent
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_urgent: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Requirements
    required_skills: Mapped[list[str]] = mapped_column(JSONB, default=list, nullable=False)
    experience_level: Mapped[str] = mapped_column(String(50), default="any", nullable=False)  # any, junior, mid, senior, expert
    english_level: Mapped[str] = mapped_column(String(50), default="any", nullable=False)

    # Attachments
    attachments: Mapped[list[dict]] = mapped_column(JSONB, default=list, nullable=False)

    # Stats
    views_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    bids_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Selected freelancer
    selected_freelancer_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    client: Mapped["User"] = relationship("User", foreign_keys=[client_id], back_populates="owned_projects", lazy="selectin")
    selected_freelancer: Mapped["User | None"] = relationship("User", foreign_keys=[selected_freelancer_id], lazy="selectin")
    bids: Mapped[list["Bid"]] = relationship("Bid", back_populates="project", lazy="selectin")
    messages: Mapped[list["Message"]] = relationship("Message", back_populates="project", lazy="selectin")
    reviews: Mapped[list["Review"]] = relationship("Review", back_populates="project", lazy="selectin")

    __table_args__ = (
        Index("ix_projects_client_status", "client_id", "status"),
        Index("ix_projects_category_status", "category", "status"),
        Index("ix_projects_status_created", "status", "created_at"),
        Index("ix_projects_featured_status", "is_featured", "status"),
    )

    def __repr__(self) -> str:
        return f"<Project(id={self.id}, title={self.title}, status={self.status})>"