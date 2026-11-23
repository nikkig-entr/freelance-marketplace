from typing import Optional, List
from datetime import datetime
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.notification import Notification, NotificationType
from app.services.email import send_email
from app.core.config import settings


async def create_notification(
    db: AsyncSession,
    user_id: int,
    type: str,
    title: str,
    message: str,
    related_id: Optional[int] = None,
    related_type: Optional[str] = None,
    action_url: Optional[str] = None,
) -> Notification:
    """Create a notification for a user."""
    notification = Notification(
        user_id=user_id,
        type=type,
        title=title,
        message=message,
        related_id=related_id,
        related_type=related_type,
        action_url=action_url,
    )
    db.add(notification)
    await db.commit()
    await db.refresh(notification)

    # Send email notification if user has email notifications enabled
    user_query = select(User).where(User.id == user_id)
    user_result = await db.execute(user_query)
    user = user_result.scalar_one_or_none()

    if user and user.email_notifications:
        await send_email_notification(user, notification)

    return notification


async def send_email_notification(user: User, notification: Notification):
    """Send email for notification."""
    subject = f"Freelance Marketplace: {notification.title}"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }}
            .content {{ background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }}
            .button {{ display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px; }}
            .footer {{ text-align: center; padding: 20px; color: #64748b; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="margin: 0;">{notification.title}</h1>
            </div>
            <div class="content">
                <p>Hi {user.full_name},</p>
                <p>{notification.message}</p>
                {f'<a href="{settings.FRONTEND_URL}{notification.action_url}" class="button">View Details</a>' if notification.action_url else ''}
            </div>
            <div class="footer">
                <p>You received this because you have email notifications enabled.</p>
                <p><a href="{settings.FRONTEND_URL}/settings/notifications">Manage preferences</a></p>
            </div>
        </div>
    </body>
    </html>
    """

    text_content = f"""
    Hi {user.full_name},

    {notification.title}
    {notification.message}

    {f"View details: {settings.FRONTEND_URL}{notification.action_url}" if notification.action_url else ""}

    ---
    You received this because you have email notifications enabled.
    Manage preferences: {settings.FRONTEND_URL}/settings/notifications
    """

    await send_email(
        to_email=user.email,
        subject=subject,
        html_content=html_content,
        text_content=text_content,
    )


async def get_user_notifications(
    db: AsyncSession,
    user_id: int,
    page: int = 1,
    page_size: int = 20,
    unread_only: bool = False,
) -> tuple[List[Notification], int]:
    """Get user notifications with pagination."""
    query = select(Notification).where(Notification.user_id == user_id)

    if unread_only:
        query = query.where(Notification.is_read == False)

    query = query.order_by(Notification.created_at.desc())

    # Count total
    from sqlalchemy import func
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Paginate
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    notifications = result.scalars().all()

    return list(notifications), total


async def mark_notification_read(
    db: AsyncSession,
    notification_id: int,
    user_id: int,
) -> Optional[Notification]:
    """Mark a notification as read."""
    query = select(Notification).where(
        Notification.id == notification_id,
        Notification.user_id == user_id
    )
    result = await db.execute(query)
    notification = result.scalar_one_or_none()

    if notification and not notification.is_read:
        notification.is_read = True
        notification.read_at = datetime.utcnow()
        await db.commit()
        await db.refresh(notification)

    return notification


async def mark_all_notifications_read(
    db: AsyncSession,
    user_id: int,
) -> int:
    """Mark all user notifications as read."""
    from sqlalchemy import update
    result = await db.execute(
        update(Notification)
        .where(
            Notification.user_id == user_id,
            Notification.is_read == False
        )
        .values(is_read=True, read_at=datetime.utcnow())
    )
    await db.commit()
    return result.rowcount


async def delete_notification(
    db: AsyncSession,
    notification_id: int,
    user_id: int,
) -> bool:
    """Delete a notification."""
    query = select(Notification).where(
        Notification.id == notification_id,
        Notification.user_id == user_id
    )
    result = await db.execute(query)
    notification = result.scalar_one_or_none()

    if notification:
        await db.delete(notification)
        await db.commit()
        return True
    return False


async def get_unread_count(db: AsyncSession, user_id: int) -> int:
    """Get count of unread notifications."""
    from sqlalchemy import func
    query = select(func.count(Notification.id)).where(
        Notification.user_id == user_id,
        Notification.is_read == False
    )
    result = await db.execute(query)
    return result.scalar() or 0


# Notification type helpers
async def notify_new_bid(db: AsyncSession, client_id: int, freelancer_name: str, project_title: str, bid_id: int, project_uuid: str):
    """Notify client of new bid."""
    await create_notification(
        db=db,
        user_id=client_id,
        type=NotificationType.NEW_BID,
        title="New bid received",
        message=f"{freelancer_name} placed a bid on '{project_title}'",
        related_id=bid_id,
        related_type="bid",
        action_url=f"/projects/{project_uuid}",
    )


async def notify_bid_accepted(db: AsyncSession, freelancer_id: int, project_title: str, bid_id: int, project_uuid: str):
    """Notify freelancer their bid was accepted."""
    await create_notification(
        db=db,
        user_id=freelancer_id,
        type=NotificationType.BID_ACCEPTED,
        title="Bid accepted!",
        message=f"Your bid on '{project_title}' was accepted",
        related_id=bid_id,
        related_type="bid",
        action_url=f"/projects/{project_uuid}",
    )


async def notify_bid_rejected(db: AsyncSession, freelancer_id: int, project_title: str, bid_id: int, project_uuid: str):
    """Notify freelancer their bid was rejected."""
    await create_notification(
        db=db,
        user_id=freelancer_id,
        type=NotificationType.BID_REJECTED,
        title="Bid rejected",
        message=f"Your bid on '{project_title}' was rejected",
        related_id=bid_id,
        related_type="bid",
        action_url=f"/projects/{project_uuid}",
    )


async def notify_bid_shortlisted(db: AsyncSession, freelancer_id: int, project_title: str, bid_id: int, project_uuid: str):
    """Notify freelancer their bid was shortlisted."""
    await create_notification(
        db=db,
        user_id=freelancer_id,
        type=NotificationType.BID_SHORTLISTED,
        title="Bid shortlisted!",
        message=f"Your bid on '{project_title}' was shortlisted",
        related_id=bid_id,
        related_type="bid",
        action_url=f"/projects/{project_uuid}",
    )


async def notify_new_message(db: AsyncSession, recipient_id: int, sender_name: str, message_preview: str, message_id: int, project_uuid: str):
    """Notify user of new message."""
    await create_notification(
        db=db,
        user_id=recipient_id,
        type=NotificationType.NEW_MESSAGE,
        title=f"New message from {sender_name}",
        message=message_preview,
        related_id=message_id,
        related_type="message",
        action_url=f"/messages/{project_uuid}",
    )


async def notify_project_completed(db: AsyncSession, user_id: int, project_title: str, project_uuid: str, amount_cents: int):
    """Notify user project was completed."""
    await create_notification(
        db=db,
        user_id=user_id,
        type=NotificationType.PROJECT_COMPLETED,
        title="Project completed",
        message=f"'{project_title}' has been completed. ${amount_cents / 100:.2f} added to your balance.",
        related_type="project",
        action_url=f"/projects/{project_uuid}",
    )


async def notify_payment_received(db: AsyncSession, user_id: int, amount_cents: int, project_title: str, project_uuid: str):
    """Notify user of payment received."""
    await create_notification(
        db=db,
        user_id=user_id,
        type=NotificationType.PAYMENT_RECEIVED,
        title="Payment received",
        message=f"You received ${amount_cents / 100:.2f} for '{project_title}'",
        related_type="transaction",
        action_url=f"/balance",
    )


async def notify_withdrawal_requested(db: AsyncSession, user_id: int, amount_cents: int, withdrawal_id: int):
    """Notify user withdrawal was requested."""
    await create_notification(
        db=db,
        user_id=user_id,
        type=NotificationType.WITHDRAWAL_REQUESTED,
        title="Withdrawal requested",
        message=f"Your withdrawal of ${amount_cents / 100:.2f} is being processed",
        related_id=withdrawal_id,
        related_type="withdrawal",
        action_url="/balance",
    )


async def notify_withdrawal_completed(db: AsyncSession, user_id: int, amount_cents: int, withdrawal_id: int):
    """Notify user withdrawal was completed."""
    await create_notification(
        db=db,
        user_id=user_id,
        type=NotificationType.WITHDRAWAL_COMPLETED,
        title="Withdrawal completed",
        message=f"Your withdrawal of ${amount_cents / 100:.2f} has been completed",
        related_id=withdrawal_id,
        related_type="withdrawal",
        action_url="/balance",
    )


async def notify_subscription_renewal(db: AsyncSession, user_id: int, plan_name: str, amount_cents: int):
    """Notify user of subscription renewal."""
    await create_notification(
        db=db,
        user_id=user_id,
        type=NotificationType.SUBSCRIPTION_RENEWAL,
        title="Subscription renewed",
        message=f"Your {plan_name} subscription (${amount_cents / 100:.2f}) has been renewed",
        related_type="subscription",
        action_url="/settings/billing",
    )


async def notify_subscription_cancelled(db: AsyncSession, user_id: int, plan_name: str):
    """Notify user of subscription cancellation."""
    await create_notification(
        db=db,
        user_id=user_id,
        type=NotificationType.SUBSCRIPTION_CANCELLED,
        title="Subscription cancelled",
        message=f"Your {plan_name} subscription has been cancelled",
        related_type="subscription",
        action_url="/settings/billing",
    )


async def notify_review_received(db: AsyncSession, user_id: int, reviewer_name: str, project_title: str, rating: float, review_id: int):
    """Notify user of new review."""
    await create_notification(
        db=db,
        user_id=user_id,
        type=NotificationType.REVIEW_RECEIVED,
        title="New review received",
        message=f"{reviewer_name} left a {rating}-star review for '{project_title}'",
        related_id=review_id,
        related_type="review",
        action_url="/profile/reviews",
    )