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


class Plan(models.Model):
    NAME_CHOICES = (
        ('free', 'Free'),
        ('pro', 'Pro'),
        ('enterprise', 'Enterprise'),
    )
    name = models.CharField(max_length=20, choices=NAME_CHOICES, unique=True)
    stripe_price_id = models.CharField(max_length=100, null=True, blank=True)
    max_queries = models.PositiveIntegerField(default=100) # Per month
    can_export = models.BooleanField(default=False)
    has_custom_domain = models.BooleanField(default=False)
    is_multi_user = models.BooleanField(default=False)

    def __str__(self):
        return self.get_name_display()


class Organisation(models.Model):
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(
        'User', on_delete=models.CASCADE, related_name='owned_organisations'
    )
    members = models.ManyToManyField(
        'User', through='OrgMember', related_name='organisations'
    )
    plan = models.ForeignKey(Plan, on_delete=models.SET_NULL, null=True, blank=True)
    invite_code = models.CharField(max_length=12, unique=True, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class OrgMember(models.Model):
    ROLE_CHOICES = (
        ('owner', 'Owner'),
        ('admin', 'Admin'),
        ('member', 'Member'),
        ('viewer', 'Viewer'),
    )
    user = models.ForeignKey('User', on_delete=models.CASCADE)
    organisation = models.ForeignKey(Organisation, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'organisation')

    def __str__(self):
        return f"{self.user.email} - {self.organisation.name} ({self.role})"


class User(AbstractUser):
    ROLE_CHOICES = (
        ('pending', 'Pending'),
        ('executive', 'Executive'),
        ('analyst', 'Analyst'),
        ('manager', 'Manager'),
        ('user', 'User'),
        ('admin', 'Admin'),
    )

    THEME_CHOICES = (
        ('light', 'Light'),
        ('dark', 'Dark'),
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
    is_email_verified = models.BooleanField(default=False)
    
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    theme_preference = models.CharField(max_length=10, choices=THEME_CHOICES, default='light')
    
    # 2FA fields
    two_fa_enabled = models.BooleanField(default=False)
    two_fa_secret = models.CharField(max_length=32, null=True, blank=True)
    backup_codes = models.JSONField(null=True, blank=True)

    # Onboarding fields
    onboarding_complete = models.BooleanField(default=False)
    onboarding_step = models.PositiveSmallIntegerField(default=0)
    
    # Email Preferences
    digest_enabled = models.BooleanField(default=True)
    security_alerts_enabled = models.BooleanField(default=True)
    
    # Rate limiting fields
    failed_attempts = models.PositiveSmallIntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)

    approved_at = models.DateTimeField(null=True, blank=True)
    
    # Subscription fields
    subscription_plan = models.ForeignKey(
        Plan, on_delete=models.SET_NULL, null=True, blank=True, related_name='subscribers'
    )
    stripe_customer_id = models.CharField(max_length=100, null=True, blank=True)
    query_usage_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.email
    last_usage_reset = models.DateTimeField(auto_now_add=True)

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


class LoginHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='login_history')
    timestamp = models.DateTimeField(auto_now_add=True)
    device_info = models.CharField(max_length=255, null=True, blank=True)
    browser_info = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user.email} - {self.timestamp}"


class PasswordResetOTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reset_otps')
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    def is_expired(self):
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"OTP for {self.user.email} - {self.otp}"


class UserActivity(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    feature_name = models.CharField(max_length=100)
    visited_at = models.DateTimeField(auto_now_add=True)
    session_id = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        ordering = ['-visited_at']

    def __str__(self):
        return f"{self.user.email} visited {self.feature_name} at {self.visited_at}"


class Notification(models.Model):
    TYPE_CHOICES = (
        ('login', 'Login'),
        ('security', 'Security'),
        ('system', 'System'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='system')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.title}"


class UserSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='active_sessions')
    session_token = models.CharField(max_length=255, unique=True)
    device_name = models.CharField(max_length=255)
    browser = models.CharField(max_length=255)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    last_active = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-last_active']

    def __str__(self):
        return f"{self.user.email} - {self.device_name} ({self.browser})"


class AuditLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs')
    action = models.CharField(max_length=100)
    target_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='target_audit_logs')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.action} by {self.user.email if self.user else 'System'} at {self.created_at}"


class APIKey(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='api_keys')
    name = models.CharField(max_length=100)
    key_hash = models.CharField(max_length=128) # Hashed key
    prefix = models.CharField(max_length=8) # ih_xxxx...
    last_used = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    rate_limit = models.PositiveIntegerField(default=1000) # req/hour
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.prefix}...)"