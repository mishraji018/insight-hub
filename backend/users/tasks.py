import logging
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from .models import User, LoginHistory, Notification, AuditLog, PasswordResetOTP
from django.db.models import Count
from datetime import timedelta

logger = logging.getLogger(__name__)

@shared_task
def send_otp_email_task(email, otp, subject="Insight Hub - OTP Verification"):
    """
    Sends an OTP email asynchronously.
    """
    message = f"Your Insight Hub OTP is: {otp}\nThis code expires in 10 minutes."
    try:
        send_mail(
            subject,
            message,
            settings.EMAIL_HOST_USER,
            [email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        logger.error(f"Failed to send OTP email to {email}: {str(e)}")
        return False

@shared_task
def record_login_history_task(user_id, device_info, browser_info):
    """
    Records login history asynchronously.
    """
    try:
        user = User.objects.get(id=user_id)
        LoginHistory.objects.create(
            user=user,
            device_info=device_info,
            browser_info=browser_info
        )
        return True
    except User.DoesNotExist:
        logger.error(f"User {user_id} does not exist during login history recording.")
        return False

@shared_task
def create_notification_task(user_id, title, message, n_type='system'):
    """
    Creates a notification asynchronously.
    """
    try:
        user = User.objects.get(id=user_id)
        Notification.objects.create(
            user=user,
            title=title,
            message=message,
            type=n_type
        )
        return True
    except User.DoesNotExist:
        logger.error(f"User {user_id} does not exist during notification creation.")
        return False

@shared_task
def send_weekly_digests_task():
    """
    Scheduled task to send weekly activity digests to opted-in users.
    """
    users = User.objects.filter(digest_enabled=True)
    count = 0
    for user in users:
        # Simple placeholder logic for summary
        # In a real app, you'd calculate stats here
        subject = "Your Weekly Insight Hub Digest"
        message = f"Hello {user.first_name},\n\nHere is your activity summary for the week..."
        
        try:
            send_mail(
                subject,
                message,
                settings.EMAIL_HOST_USER,
                [user.email],
                fail_silently=False,
            )
            count += 1
        except Exception as e:
            logger.error(f"Failed to send digest to {user.email}: {str(e)}")
            
    return f"Sent {count} digests."

@shared_task
def cleanup_expired_otps_task():
    """
    Scheduled task to delete expired OTPs.
    """
    deleted_count, _ = PasswordResetOTP.objects.filter(
        expires_at__lt=timezone.now()
    ).delete()
    return f"Deleted {deleted_count} expired OTPs."

@shared_task
def cleanup_old_audit_logs_task():
    """
    Scheduled task to cleanup audit logs older than 90 days.
    """
    cutoff = timezone.now() - timedelta(days=90)
    deleted_count, _ = AuditLog.objects.filter(
        created_at__lt=cutoff
    ).delete()
    return f"Deleted {deleted_count} old audit logs."
