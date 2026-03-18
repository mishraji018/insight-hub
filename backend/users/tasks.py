import resend
import os

resend.api_key = os.environ.get("RESEND_API_KEY", "")

def send_otp_email_task(email, otp, subject="Your Verification Code"):
    resend.Emails.send({
        "from": "onboarding@resend.dev",
        "to": email,
        "subject": subject,
        "html": f"<div style='font-family:sans-serif'><h2>Insight Hub</h2><p>Your code:</p><h1 style='letter-spacing:8px'>{otp}</h1><p>Expires in 10 minutes.</p></div>",
    })

def record_login_history_task(user_id, device, browser):
    try:
        from django.contrib.auth import get_user_model
        from users.models import LoginHistory
        from django.utils import timezone
        User = get_user_model()
        user = User.objects.filter(id=user_id).first()
        if user:
            LoginHistory.objects.create(user=user, device_info=device, browser_info=browser, timestamp=timezone.now())
    except Exception as e:
        print(f"Warning: {e}")

def create_notification_task(user_id, title, message, notif_type="system"):
    try:
        from django.contrib.auth import get_user_model
        from users.models import Notification
        User = get_user_model()
        user = User.objects.filter(id=user_id).first()
        if user:
            Notification.objects.create(user=user, title=title, message=message, type=notif_type)
    except Exception as e:
        print(f"Warning: {e}")
