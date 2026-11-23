from typing import Optional, List
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib
import httpx
from app.core.config import get_settings
from app.models.user import User

settings = get_settings()


class NotificationService:
    """Service for sending notifications (email, Telegram)."""

    @staticmethod
    async def send_email(
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
    ) -> bool:
        """Send email via SMTP."""
        if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
            return False

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{settings.EMAIL_FROM_NAME} <{settings.EMAIL_FROM}>"
            msg["To"] = to_email

            if text_content:
                msg.attach(MIMEText(text_content, "plain"))
            msg.attach(MIMEText(html_content, "html"))

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)

            return True
        except Exception:
            return False

    @staticmethod
    async def send_verification_email(email: str, token: str) -> bool:
        """Send email verification link."""
        verify_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"

        html = f"""
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #f8f9fa; padding: 30px; border-radius: 8px;">
                <h1 style="color: #1a1a2e; margin-bottom: 20px;">Welcome to Freelance Marketplace!</h1>
                <p style="color: #4a4a6a; line-height: 1.6;">
                    Thanks for signing up! Please verify your email address by clicking the button below:
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{verify_url}"
                       style="background: #1a1a2e; color: white; padding: 14px 28px;
                              text-decoration: none; border-radius: 6px; display: inline-block;
                              font-weight: 600;">
                        Verify Email Address
                    </a>
                </div>
                <p style="color: #4a4a6a; font-size: 14px;">
                    Or copy this link: <br>
                    <a href="{verify_url}" style="color: #6366f1;">{verify_url}</a>
                </p>
                <p style="color: #4a4a6a; font-size: 14px;">
                    This link expires in 24 hours. If you didn't create an account, please ignore this email.
                </p>
            </div>
        </body>
        </html>
        """

        text = f"""
        Welcome to Freelance Marketplace!

        Please verify your email: {verify_url}

        This link expires in 24 hours.
        """

        return await NotificationService.send_email(email, "Verify your email", html, text)

    @staticmethod
    async def send_password_reset_email(email: str, token: str) -> bool:
        """Send password reset link."""
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"

        html = f"""
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #f8f9fa; padding: 30px; border-radius: 8px;">
                <h1 style="color: #1a1a2e; margin-bottom: 20px;">Password Reset Request</h1>
                <p style="color: #4a4a6a; line-height: 1.6;">
                    You requested a password reset. Click the button below to create a new password:
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{reset_url}"
                       style="background: #1a1a2e; color: white; padding: 14px 28px;
                              text-decoration: none; border-radius: 6px; display: inline-block;
                              font-weight: 600;">
                        Reset Password
                    </a>
                </div>
                <p style="color: #4a4a6a; font-size: 14px;">
                    This link expires in 1 hour. If you didn't request this, please ignore this email.
                </p>
            </div>
        </body>
        </html>
        """

        return await NotificationService.send_email(email, "Reset your password", html)

    @staticmethod
    async def send_bid_notification(client: User, project_title: str, freelancer_name: str) -> bool:
        """Notify client about new bid."""
        html = f"""
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #f8f9fa; padding: 30px; border-radius: 8px;">
                <h1 style="color: #1a1a2e; margin-bottom: 20px;">New Bid Received!</h1>
                <p style="color: #4a4a6a; line-height: 1.6;">
                    <strong>{freelancer_name}</strong> placed a bid on your project <strong>"{project_title}"</strong>.
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{settings.FRONTEND_URL}/projects"
                       style="background: #1a1a2e; color: white; padding: 14px 28px;
                              text-decoration: none; border-radius: 6px; display: inline-block;">
                        View Bid
                    </a>
                </div>
            </div>
        </body>
        </html>
        """
        return await NotificationService.send_email(client.email, f"New bid on {project_title}", html)

    @staticmethod
    async def send_bid_accepted_notification(freelancer: User, project_title: str, client_name: str) -> bool:
        """Notify freelancer their bid was accepted."""
        html = f"""
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #f8f9fa; padding: 30px; border-radius: 8px;">
                <h1 style="color: #1a1a2e; margin-bottom: 20px;">🎉 Your Bid Was Accepted!</h1>
                <p style="color: #4a4a6a; line-height: 1.6;">
                    <strong>{client_name}</strong> accepted your bid for <strong>"{project_title}"</strong>.
                    You can now start working on the project.
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{settings.FRONTEND_URL}/projects"
                       style="background: #1a1a2e; color: white; padding: 14px 28px;
                              text-decoration: none; border-radius: 6px; display: inline-block;">
                        Go to Project
                    </a>
                </div>
            </div>
        </body>
        </html>
        """
        return await NotificationService.send_email(freelancer.email, f"Bid accepted: {project_title}", html)

    @staticmethod
    async def send_withdrawal_notification(user: User, amount: int, status: str) -> bool:
        """Notify user about withdrawal status change."""
        status_text = {
            "approved": "approved",
            "rejected": "rejected",
            "completed": "completed",
        }.get(status, status)

        html = f"""
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #f8f9fa; padding: 30px; border-radius: 8px;">
                <h1 style="color: #1a1a2e; margin-bottom: 20px;">Withdrawal {status_text.title()}</h1>
                <p style="color: #4a4a6a; line-height: 1.6;">
                    Your withdrawal request for <strong>${amount/100:.2f}</strong> has been <strong>{status_text}</strong>.
                </p>
            </div>
        </body>
        </html>
        """
        return await NotificationService.send_email(user.email, f"Withdrawal {status_text}", html)

    @staticmethod
    async def send_telegram_message(chat_id: str, text: str) -> bool:
        """Send message via Telegram Bot."""
        if not settings.TELEGRAM_NOTIFY_BOT_TOKEN:
            return False

        try:
            url = f"https://api.telegram.org/bot{settings.TELEGRAM_NOTIFY_BOT_TOKEN}/sendMessage"
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json={
                    "chat_id": chat_id,
                    "text": text,
                    "parse_mode": "HTML",
                })
                return response.status_code == 200
        except Exception:
            return False

    @staticmethod
    async def notify_admin_new_user(user: User) -> bool:
        """Notify admin about new user registration."""
        if not settings.TELEGRAM_NOTIFY_CHAT_ID:
            return False

        text = (
            f"👤 <b>New User Registered</b>\n"
            f"Email: {user.email}\n"
            f"Name: {user.full_name or 'N/A'}\n"
            f"Role: {user.role.value}\n"
            f"ID: {user.id}"
        )
        return await NotificationService.send_telegram_message(settings.TELEGRAM_NOTIFY_CHAT_ID, text)

    @staticmethod
    async def notify_admin_withdrawal_request(user: User, amount: int) -> bool:
        """Notify admin about new withdrawal request."""
        if not settings.TELEGRAM_NOTIFY_CHAT_ID:
            return False

        text = (
            f"💰 <b>New Withdrawal Request</b>\n"
            f"User: {user.email} ({user.full_name or 'N/A'})\n"
            f"Amount: ${amount/100:.2f}\n"
            f"User ID: {user.id}"
        )
        return await NotificationService.send_telegram_message(settings.TELEGRAM_NOTIFY_CHAT_ID, text)

    @staticmethod
    async def notify_admin_dispute(project_id: int, client_id: int, freelancer_id: int) -> bool:
        """Notify admin about dispute."""
        if not settings.TELEGRAM_NOTIFY_CHAT_ID:
            return False

        text = (
            f"⚠️ <b>Dispute Opened</b>\n"
            f"Project ID: {project_id}\n"
            f"Client ID: {client_id}\n"
            f"Freelancer ID: {freelancer_id}"
        )
        return await NotificationService.send_telegram_message(settings.TELEGRAM_NOTIFY_CHAT_ID, text)