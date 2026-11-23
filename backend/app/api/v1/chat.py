from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, WebSocket, WebSocketDisconnect
from sqlalchemy import select, func, and_, or_, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.dependencies import (
    get_db, get_current_user, require_roles, check_project_access
)
from app.models.user import User, UserRole
from app.models.project import Project, ProjectStatus
from app.models.message import Message, MessageType
from app.models.bid import Bid, BidStatus
from app.schemas.chat import (
    MessageCreate, MessageResponse, MessageListResponse,
    MessageRead, ConversationResponse
)
from app.core.websocket import manager
from app.services.notifications import create_notification
from app.tasks.notifications import send_message_notification

router = APIRouter()


@router.get("/projects/{project_uuid}/messages", response_model=MessageListResponse)
async def list_messages(
    project_uuid: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List messages for a project (participants only)."""
    # Get project
    project_query = select(Project).where(Project.uuid == project_uuid)
    project_result = await db.execute(project_query)
    project = project_result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Check if user is participant
    is_participant = False
    if project.client_id == current_user.id:
        is_participant = True
    elif project.selected_freelancer_id == current_user.id:
        is_participant = True
    elif current_user.role == UserRole.ADMIN:
        is_participant = True
    else:
        # Check if user has an accepted bid
        bid_query = select(Bid).where(
            Bid.project_id == project.id,
            Bid.freelancer_id == current_user.id,
            Bid.status == BidStatus.ACCEPTED
        )
        bid_result = await db.execute(bid_query)
        if bid_result.scalar_one_or_none():
            is_participant = True

    if not is_participant:
        raise HTTPException(status_code=403, detail="Not authorized to view messages")

    query = select(Message).where(Message.project_id == project.id).options(
        selectinload(Message.sender),
        selectinload(Message.reply_to).selectinload(Message.sender)
    ).order_by(Message.created_at.desc())

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    messages = result.scalars().all()

    total_pages = (total + page_size - 1) // page_size

    return MessageListResponse(
        items=list(reversed(messages)),
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        has_more=page < total_pages,
    )


@router.post("/projects/{project_uuid}/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    project_uuid: str,
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Send a message in a project chat."""
    # Get project
    project_query = select(Project).where(Project.uuid == project_uuid)
    project_result = await db.execute(project_query)
    project = project_result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Check if user is participant
    is_participant = False
    recipient_id = None
    if project.client_id == current_user.id:
        is_participant = True
        recipient_id = project.selected_freelancer_id
    elif project.selected_freelancer_id == current_user.id:
        is_participant = True
        recipient_id = project.client_id
    elif current_user.role == UserRole.ADMIN:
        is_participant = True
        recipient_id = project.client_id  # Admin messages go to client
    else:
        bid_query = select(Bid).where(
            Bid.project_id == project.id,
            Bid.freelancer_id == current_user.id,
            Bid.status == BidStatus.ACCEPTED
        )
        bid_result = await db.execute(bid_query)
        if bid_result.scalar_one_or_none():
            is_participant = True
            recipient_id = project.client_id

    if not is_participant:
        raise HTTPException(status_code=403, detail="Not authorized to send messages")

    if not recipient_id:
        raise HTTPException(status_code=400, detail="No recipient available for this project")

    # Handle reply_to
    reply_to_id = message_data.reply_to_id
    if reply_to_id:
        reply_query = select(Message).where(Message.id == reply_to_id, Message.project_id == project.id)
        reply_result = await db.execute(reply_query)
        if not reply_result.scalar_one_or_none():
            reply_to_id = None

    # Create message
    message = Message(
        project_id=project.id,
        sender_id=current_user.id,
        recipient_id=recipient_id,
        content=message_data.content,
        message_type=message_data.message_type,
        attachments=message_data.attachments or [],
        reply_to_id=reply_to_id,
    )
    db.add(message)
    await db.commit()
    await db.refresh(message, attribute_names=['sender', 'reply_to'])

    # Notify recipient via WebSocket
    await manager.send_personal_message(
        recipient_id,
        {
            "type": "new_message",
            "message": {
                "id": message.id,
                "project_id": message.project_id,
                "sender_id": message.sender_id,
                "recipient_id": message.recipient_id,
                "content": message.content,
                "message_type": message.message_type,
                "attachments": message.attachments,
                "reply_to_id": message.reply_to_id,
                "is_read": message.is_read,
                "created_at": message.created_at.isoformat(),
                "sender": {
                    "id": message.sender.id,
                    "full_name": message.sender.full_name,
                    "avatar_url": message.sender.avatar_url,
                } if message.sender else None,
            }
        }
    )

    # Create notification for recipient
    await create_notification(
        db=db,
        user_id=recipient_id,
        type="new_message",
        title=f"New message from {current_user.full_name}",
        message=message.content[:100] + ("..." if len(message.content) > 100 else ""),
        related_id=message.id,
        related_type="message",
    )

    # Send email notification (async via Celery)
    send_message_notification.delay(recipient_id, message.id)

    return message


@router.post("/messages/{message_id}/read", response_model=MessageResponse)
async def mark_message_read(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark a message as read."""
    query = select(Message).where(Message.id == message_id)
    result = await db.execute(query)
    message = result.scalar_one_or_none()

    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    if message.recipient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    if not message.is_read:
        message.is_read = True
        await db.commit()
        await db.refresh(message, attribute_names=['sender'])

        # Notify sender via WebSocket
        await manager.send_personal_message(
            message.sender_id,
            {
                "type": "message_read",
                "message_id": message.id,
                "read_at": message.read_at.isoformat() if message.read_at else None,
            }
        )

    return message


@router.post("/projects/{project_uuid}/messages/read-all", status_code=status.HTTP_204_NO_CONTENT)
async def mark_all_messages_read(
    project_uuid: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark all messages in a project as read."""
    project_query = select(Project).where(Project.uuid == project_uuid)
    project_result = await db.execute(project_query)
    project = project_result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Update all unread messages for this user in this project
    await db.execute(
        update(Message)
        .where(
            Message.project_id == project.id,
            Message.recipient_id == current_user.id,
            Message.is_read == False
        )
        .values(is_read=True)
    )
    await db.commit()


@router.get("/conversations", response_model=list[ConversationResponse])
async def list_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List user's conversations (projects with messages)."""
    # Get projects where user has messages
    if current_user.role == UserRole.CLIENT:
        project_query = select(Project).where(Project.client_id == current_user.id)
    elif current_user.role == UserRole.FREELANCER:
        # Freelancer projects are those where they have an accepted bid
        project_query = select(Project).join(Bid).where(
            Bid.freelancer_id == current_user.id,
            Bid.status == BidStatus.ACCEPTED
        )
    else:
        project_query = select(Project)

    project_query = project_query.options(selectinload(Project.client), selectinload(Project.selected_freelancer))
    project_result = await db.execute(project_query)
    projects = project_result.scalars().all()

    conversations = []
    for project in projects:
        # Get last message
        last_msg_query = select(Message).where(Message.project_id == project.id).order_by(Message.created_at.desc()).limit(1)
        last_msg_result = await db.execute(last_msg_query)
        last_message = last_msg_result.scalar_one_or_none()

        # Count unread messages
        unread_query = select(func.count(Message.id)).where(
            Message.project_id == project.id,
            Message.recipient_id == current_user.id,
            Message.is_read == False
        )
        unread_result = await db.execute(unread_query)
        unread_count = unread_result.scalar() or 0

        if last_message:
            # For client, other user is the selected freelancer; for freelancer, other user is the client
            if current_user.role == UserRole.CLIENT:
                other_user = project.selected_freelancer
            else:
                other_user = project.client
            # Load sender for the last_message
            await db.refresh(last_message, attribute_names=['sender'])
            conversations.append(ConversationResponse(
                project_id=project.id,
                project_uuid=project.uuid,
                project_title=project.title,
                other_user_id=other_user.id if other_user else None,
                other_user_name=other_user.full_name if other_user else "Unknown",
                other_user_avatar=other_user.avatar_url if other_user else None,
                last_message=last_message,
                last_message_at=last_message.created_at,
                unread_count=unread_count,
                updated_at=last_message.created_at,
            ))

    # Sort by last message time
    conversations.sort(key=lambda x: x.last_message_at, reverse=True)
    return conversations


# WebSocket endpoint
@router.websocket("/ws/{project_uuid}")
async def websocket_endpoint(
    websocket: WebSocket,
    project_uuid: str,
    token: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """WebSocket endpoint for real-time chat."""
    from app.core.security import decode_token
    from app.core.config import settings

    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        if not user_id:
            await websocket.close(code=4001)
            return
    except Exception:
        await websocket.close(code=4001)
        return

    # Get user
    user_query = select(User).where(User.id == int(user_id))
    user_result = await db.execute(user_query)
    user = user_result.scalar_one_or_none()

    if not user:
        await websocket.close(code=4001)
        return

    # Get project
    project_query = select(Project).where(Project.uuid == project_uuid)
    project_result = await db.execute(project_query)
    project = project_result.scalar_one_or_none()

    if not project:
        await websocket.close(code=4004)
        return

    # Check if user is participant
    is_participant = False
    if project.client_id == user.id or project.selected_freelancer_id == user.id:
        is_participant = True
    elif user.role == UserRole.ADMIN:
        is_participant = True
    else:
        bid_query = select(Bid).where(
            Bid.project_id == project.id,
            Bid.freelancer_id == user.id,
            Bid.status == BidStatus.ACCEPTED
        )
        bid_result = await db.execute(bid_query)
        if bid_result.scalar_one_or_none():
            is_participant = True

    if not is_participant:
        await websocket.close(code=4003)
        return

    # Connect
    await manager.connect(user.id, project.id, websocket)

    try:
        while True:
            data = await websocket.receive_json()

            if data.get("type") == "ping":
                await websocket.send_json({"type": "pong"})

            elif data.get("type") == "typing":
                # Broadcast typing indicator to other participant
                other_id = project.selected_freelancer_id if user.id == project.client_id else project.client_id
                if other_id:
                    await manager.send_personal_message(other_id, {
                        "type": "typing",
                        "project_id": project.id,
                        "user_id": user.id,
                        "user_name": user.full_name,
                    })

            elif data.get("type") == "read":
                message_id = data.get("message_id")
                if message_id:
                    # Mark as read
                    msg_query = select(Message).where(Message.id == message_id, Message.project_id == project.id)
                    msg_result = await db.execute(msg_query)
                    message = msg_result.scalar_one_or_none()
                    if message and message.recipient_id == user.id and not message.is_read:
                        message.is_read = True
                        await db.commit()

                        # Notify sender
                        await manager.send_personal_message(message.sender_id, {
                            "type": "message_read",
                            "message_id": message.id,
                        })

    except WebSocketDisconnect:
        manager.disconnect(user.id, project.id, websocket)
    except Exception as e:
        manager.disconnect(user.id, project.id, websocket)