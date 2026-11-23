from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from app.models.message import MessageType


class MessageCreate(BaseModel):
    content: str = Field(min_length=1)
    message_type: MessageType = MessageType.TEXT
    reply_to_id: Optional[int] = None
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    attachments: Optional[list] = None


class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    sender_id: int
    recipient_id: int
    content: str
    message_type: MessageType
    attachments: list
    is_read: bool
    read_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    reply_to_id: Optional[int]

    # Nested user info
    sender: Optional["UserResponse"] = None
    reply_to: Optional["MessageResponse"] = None


class MessageListResponse(BaseModel):
    items: List[MessageResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
    has_more: bool


# WebSocket event schemas
class ChatEvent(BaseModel):
    type: str  # "message", "system_event", "typing", "read", "user_joined", "user_left"
    data: Dict[str, Any]
    timestamp: float


class TypingEvent(BaseModel):
    user_id: int
    is_typing: bool


class ReadEvent(BaseModel):
    message_ids: List[int]


class FileUploadResponse(BaseModel):
    url: str
    file_name: str
    file_size: int
    file_type: str


class MessageRead(BaseModel):
    """Schema for marking messages as read."""
    message_ids: List[int]


class ConversationResponse(BaseModel):
    """Schema for a conversation summary."""
    project_id: int
    project_uuid: str
    project_title: str
    other_user_id: int
    other_user_name: str
    other_user_avatar: Optional[str]
    last_message: Optional[MessageResponse]
    last_message_at: datetime
    unread_count: int
    updated_at: datetime


# Forward reference
from app.schemas.auth import UserResponse
MessageResponse.model_rebuild()