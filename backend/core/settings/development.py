from .base import *

# FIXED: Hardcoded default for local execution stability
SECRET_KEY = 'v7$h&3!j*9#k2Lp5mN8qRzT4uW1xY0zS'

DEBUG = True

# FIXED: Allow frontend to communicate with backend
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:8080",   # ← ye add karo
    "http://localhost:8081",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8080",   # ← ye bhi
    "http://127.0.0.1:8081",
]
CORS_ALLOW_CREDENTIALS = True

# FIXED: Local setup without Docker
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# FIXED: Eager mode for Celery (no Redis required)
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True

# FIXED: In-memory channel layer (no Redis required for WebSockets)
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer"
    }
}
