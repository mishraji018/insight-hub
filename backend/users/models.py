from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone


class CustomUserManager(BaseUserManager):
    """Custom manager — email se login, username nahi."""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_approved', True)
        extra_fields.setdefault('role', 'executive')
        return self.create_user(email, password, **extra_fields)


class InviteToken(models.Model):
    token = models.CharField(max_length=8, unique=True)
    created_by = models.ForeignKey(
        'User', on_delete=models.CASCADE,
        related_name='generated_invites'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    used_by_email = models.CharField(max_length=255, null=True, blank=True)
    used_at = models.DateTimeField(null=True, blank=True)
    note = models.CharField(max_length=255, null=True, blank=True)

    def is_expired(self):
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"{self.token} ({'Used' if self.is_used else 'Available'})"


class User(AbstractUser):
    ROLE_CHOICES = (
        ('pending', 'Pending'),
        ('executive', 'Executive'),
        ('analyst', 'Analyst'),
        ('manager', 'Manager'),
    )

    username = None
    email = models.EmailField(unique=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    # ✅ Custom manager assign karo
    objects = CustomUserManager()

    role = models.CharField(
        max_length=20, choices=ROLE_CHOICES, default='pending')
    is_approved = models.BooleanField(default=False)
    approved_by = models.ForeignKey(
        'self', on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='approved_users'
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    invite_token = models.ForeignKey(
        InviteToken, on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='registered_users'
    )

    def __str__(self):
        return f"{self.email} ({self.role})"