import logging
from datetime import datetime, timedelta, timezone

from app.tasks.celery_app import celery_app
from app.core.database import get_db_context
from app.models.user import User
from app.models.project import Project, ProjectStatus
from app.models.bid import Bid, BidStatus
from app.services.email import send_notification_email

logger = logging.getLogger(__name__)


@celery_app.task(name="app.tasks.notifications.send_daily_notifications")
async def send_daily_notifications() -> dict:
    """
    Send daily digest notifications to users.
    Runs daily at 9 AM UTC.
    """
    async with get_db_context() as db:
        # Get active users who want notifications
        from sqlalchemy import select
        result = await db.execute(
            select(User).where(User.is_active == True)  # noqa: E712
        )
        users = result.scalars().all()

        sent_count = 0
        for user in users:
            try:
                notifications = await _build_user_notifications(db, user)
                if notifications:
                    await send_notification_email(
                        email=user.email,
                        subject="Your Daily Freelance Marketplace Digest",
                        message=notifications["message"],
                        action_url=notifications.get("action_url"),
                        action_text=notifications.get("action_text"),
                    )
                    sent_count += 1
            except Exception as e:
                logger.error(f"Failed to send notification to user {user.id}: {e}")

        logger.info(f"Sent daily notifications to {sent_count} users")
        return {"sent": sent_count, "status": "completed"}


async def _build_user_notifications(db, user: User) -> dict | None:
    """Build personalized notifications for a user."""
    from sqlalchemy import select, and_

    notifications = []

    if user.role.value == "freelancer":
        # New projects matching skills
        if user.skills:
            result = await db.execute(
                select(Project)
                .where(
                    and_(
                        Project.status == ProjectStatus.OPEN,
                        Project.category.in_(user.skills[:5]),  # Limit to top 5 skills
                        Project.created_at >= datetime.now(timezone.utc) - timedelta(days=1),
                    )
                )
                .limit(5)
            )
            new_projects = result.scalars().all()
            if new_projects:
                notifications.append({
                    "type": "new_projects",
                    "count": len(new_projects),
                    "message": f"Found {len(new_projects)} new projects matching your skills",
                })

        # Bid status updates
        result = await db.execute(
            select(Bid)
            .where(
                and_(
                    Bid.freelancer_id == user.id,
                    Bid.status.in_([BidStatus.ACCEPTED, BidStatus.REJECTED]),
                    Bid.updated_at >= datetime.now(timezone.utc) - timedelta(days=1),
                )
            )
        )
        bid_updates = result.scalars().all()
        if bid_updates:
            accepted = [b for b in bid_updates if b.status == BidStatus.ACCEPTED]
            rejected = [b for b in bid_updates if b.status == BidStatus.REJECTED]
            msg_parts = []
            if accepted:
                msg_parts.append(f"{len(accepted)} bid(s) accepted")
            if rejected:
                msg_parts.append(f"{len(rejected)} bid(s) rejected")
            notifications.append({
                "type": "bid_updates",
                "message": "; ".join(msg_parts),
            })

    elif user.role.value == "client":
        # New bids on projects
        result = await db.execute(
            select(Bid)
            .join(Project)
            .where(
                and_(
                    Project.client_id == user.id,
                    Bid.status == BidStatus.PENDING,
                    Bid.created_at >= datetime.now(timezone.utc) - timedelta(days=1),
                )
            )
        )
        new_bids = result.scalars().all()
        if new_bids:
            notifications.append({
                "type": "new_bids",
                "count": len(new_bids),
                "message": f"Received {len(new_bids)} new bid(s) on your projects",
            })

        # Project milestones
        result = await db.execute(
            select(Project)
            .where(
                and_(
                    Project.client_id == user.id,
                    Project.status == ProjectStatus.IN_PROGRESS,
                )
            )
        )
        active_projects = result.scalars().all()
        for project in active_projects:
            if project.deadline:
                days_left = (project.deadline - datetime.now(timezone.utc)).days
                if days_left in (1, 3, 7):
                    notifications.append({
                        "type": "deadline_approaching",
                        "project_id": project.id,
                        "message": f"Project '{project.title}' deadline in {days_left} day(s)",
                    })

    if not notifications:
        return None

    # Build email message
    message_lines = ["Here's your daily summary:"]
    for notif in notifications:
        message_lines.append(f"• {notif['message']}")

    return {
        "message": "\n".join(message_lines),
        "action_url": "https://freelance-marketplace.com/dashboard",
        "action_text": "View Dashboard",
    }


@celery_app.task(name="app.tasks.notifications.send_bid_notification")
async def send_bid_notification(bid_id: int) -> dict:
    """Send notification when a new bid is placed."""
    async with get_db_context() as db:
        from sqlalchemy import select
        result = await db.execute(
            select(Bid).where(Bid.id == bid_id)
        )
        bid = result.scalar_one_or_none()
        if not bid:
            return {"status": "bid_not_found"}

        # Notify project client
        result = await db.execute(
            select(User).where(User.id == bid.project.client_id)
        )
        client = result.scalar_one_or_none()
        if client and client.is_active:
            await send_notification_email(
                email=client.email,
                subject=f"New bid on '{bid.project.title}'",
                message=f"A freelancer has placed a bid of ${bid.price_cents / 100:.2f} on your project.",
                action_url=f"https://freelance-marketplace.com/projects/{bid.project.uuid}",
                action_text="View Bid",
            )

        return {"status": "sent"}


@celery_app.task(name="app.tasks.notifications.send_message_notification")
async def send_message_notification(message_id: int) -> dict:
    """Send notification when a new message is received."""
    async with get_db_context() as db:
        from sqlalchemy import select
        from app.models.message import Message

        result = await db.execute(
            select(Message).where(Message.id == message_id)
        )
        message = result.scalar_one_or_none()
        if not message:
            return {"status": "message_not_found"}

        # Notify recipient
        result = await db.execute(
            select(User).where(User.id == message.recipient_id)
        )
        recipient = result.scalar_one_or_none()
        if recipient and recipient.is_active:
            sender_name = message.sender.full_name or message.sender.email
            await send_notification_email(
                email=recipient.email,
                subject=f"New message from {sender_name}",
                message=f"You have a new message regarding project.",
                action_url=f"https://freelance-marketplace.com/messages/{message.project_id}",
                action_text="Read Message",
            )

        return {"status": "sent"}