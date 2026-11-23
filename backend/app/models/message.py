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
    from app.models.project import Project


class MessageType(str, enum.Enum):
    TEXT = "text"
    FILE = "file"
    IMAGE = "image"
    SYSTEM = "system"
    OFFER = "offer"
    DELIVERY = "delivery"
    REVISION_REQUEST = "revision_request"


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    uuid: Mapped[str] = mapped_column(String(36), unique=True, default=lambda: str(uuid4()), index=True)

    # Relations
    project_id: Mapped[int] = mapped_column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    sender_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    recipient_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Content
    content: Mapped[str] = mapped_column(Text, nullable=False)
    message_type: Mapped[MessageType] = mapped_column(Enum(MessageType), default=MessageType.TEXT, nullable=False)

    # Attachments
    attachments: Mapped[list[dict]] = mapped_column(JSONB, default=list, nullable=False)

    # Read status
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    read_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Reply threading
    reply_to_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("messages.id", ondelete="SET NULL"), nullable=True)

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

    # Relationships
    project: Mapped["Project"] = relationship("Project", back_populates="messages", lazy="selectin")
    sender: Mapped["User"] = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages", lazy="selectin")
    recipient: Mapped["User"] = relationship("User", foreign_keys=[recipient_id], lazy="selectin")
    reply_to: Mapped["Message | None"] = relationship("Message", remote_side=[id], backref="replies", lazy="selectin")

    __table_args__ = (
        Index("ix_messages_project_created", "project_id", "created_at"),
        Index("ix_messages_sender_recipient", "sender_id", "recipient_id"),
        Index("ix_messages_recipient_read", "recipient_id", "is_read"),
    )

    def __repr__(self) -> str:
        return f"<Message(id={self.id}, project_id={self.project_id}, sender_id={self.sender_id}, type={self.message_type})>"
