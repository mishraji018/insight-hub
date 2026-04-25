from .base import *

SECRET_KEY = 'v7$h&3!j*9#k2Lp5mN8qRzT4uW1xY0zS'

DEBUG = True

ALLOWED_HOSTS = ['*']

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:8080",
    "http://localhost:8081",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:8081",
    "https://insight-hub-azure.vercel.app",
    "https://tricksiest-janey-unprecipitously.ngrok-free.dev",
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'ngrok-skip-browser-warning',
]

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = True

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer"
    }
}

# Email — reads from .env; falls back to console if not set
import environ as _env
_e = _env.Env()
EMAIL_BACKEND    = _e('EMAIL_BACKEND',     default='django.core.mail.backends.console.EmailBackend')
EMAIL_HOST       = _e('EMAIL_HOST',        default='smtp.gmail.com')
EMAIL_PORT       = _e.int('EMAIL_PORT',    default=587)
EMAIL_USE_TLS    = _e.bool('EMAIL_USE_TLS', default=True)
EMAIL_HOST_USER  = _e('EMAIL_HOST_USER',   default='')
EMAIL_HOST_PASSWORD = _e('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL  = _e('DEFAULT_FROM_EMAIL',  default=EMAIL_HOST_USER)

# ── DEV ONLY: Auto-approve & auto-verify every user on save ──────────────────
# This stops the "Pending Approval" loop in local development.
# Has zero effect in production (this file is never loaded there).
from django.db.models.signals import post_save
from django.dispatch import receiver

def _auto_approve_user(sender, instance, created, **kwargs):
    """Silently approve + verify every user in dev so login always works."""
    if not instance.is_approved or not instance.is_email_verified:
        # Use update() to avoid triggering another post_save signal
        sender.objects.filter(pk=instance.pk).update(
            is_approved=True,
            is_email_verified=True,
        )

def _connect_signal(sender, **kwargs):
    post_save.connect(_auto_approve_user, sender=sender)

from django.apps import apps
from django.db import models

# Connect lazily after apps are ready to avoid AppRegistryNotReady error
try:
    from users.models import User as _User
    post_save.connect(_auto_approve_user, sender=_User)
except Exception:
    pass  # Will connect when apps are ready

EMAIL_HOST_PASSWORD = _e('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL  = _e('DEFAULT_FROM_EMAIL',  default=EMAIL_HOST_USER)