import re
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import InviteToken, LoginHistory, UserActivity, Notification, UserSession, AuditLog, Plan, Organisation, OrgMember, APIKey

User = get_user_model()

class InviteTokenSerializer(serializers.ModelSerializer):
    is_expired = serializers.SerializerMethodField()

    class Meta:
        model = InviteToken
        fields = ('token', 'note', 'created_at', 'expires_at', 'is_used', 'used_by_email', 'is_expired')

class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = '__all__'

class OrganisationSerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source='owner.email', read_only=True)
    plan_name = serializers.CharField(source='plan.name', read_only=True)

    class Meta:
        model = Organisation
        fields = ('id', 'name', 'owner', 'owner_email', 'plan', 'plan_name', 'invite_code', 'created_at')

class OrgMemberSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = OrgMember
        fields = ('id', 'user', 'user_email', 'user_name', 'organisation', 'role', 'joined_at')

    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip()

class APIKeySerializer(serializers.ModelSerializer):
    class Meta:
        model = APIKey
        fields = ('id', 'name', 'prefix', 'last_used', 'is_active', 'rate_limit', 'created_at')
        read_only_fields = ('prefix', 'last_used', 'created_at')

    def get_is_expired(self, obj):
        return obj.is_expired()

class RegisterInviteSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    confirm_password = serializers.CharField(write_only=True, required=True)
    invite_token = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email', 'password', 'confirm_password', 'invite_token')

    def validate_invite_token(self, value):
        if not value:
            return None
        try:
            token = InviteToken.objects.get(token=value)
        except InviteToken.DoesNotExist:
            raise serializers.ValidationError("Invalid invite link")
        
        if token.is_used:
            raise serializers.ValidationError("Invite link already used")
        if token.is_expired():
            raise serializers.ValidationError("Invite link expired")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered")
        return value

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError(
                "Password must be at least 8 characters long.")
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError(
                "Password must contain at least one uppercase letter.")
        if not re.search(r'\d', value):
            raise serializers.ValidationError(
                "Password must contain at least one number.")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise serializers.ValidationError(
                "Password must contain at least one special character.")
    
    # FIX: password123 add kiya
        common_passwords = ["password", "12345678", "admin123", "password123"]
        if value.lower() in common_passwords:
            raise serializers.ValidationError("This password is too common.")
        
        return value

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        
        if data['email'] in data['password']:
            raise serializers.ValidationError({"password": "Password cannot contain your email address."})
            
        return data

    def create(self, validated_data):
        invite_val = validated_data.pop('invite_token', None)
        validated_data.pop('confirm_password')
    
        token = None
        if invite_val:
            token = InviteToken.objects.get(token=invite_val)
    
        # FIX: username parameter hata diya
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role='pending' if not token else 'user', # Default to user if invited? or pending?
            is_approved=True if token else False, # Approve if invited
            invite_token=token
        )
    
        if token:
            token.is_used = True
            token.used_by_email = user.email
            token.used_at = timezone.now()
            token.save()
    
        return user


class LoginHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = LoginHistory
        fields = ('id', 'timestamp', 'device_info', 'browser_info')

class UserManagementSerializer(serializers.ModelSerializer):
    invite_note = serializers.CharField(source='invite_token.note', read_only=True)
    invite_used = serializers.CharField(source='invite_token.token', read_only=True)

    class Meta:
        model = User
        fields = (
            'id', 'first_name', 'last_name', 'email', 'role', 'is_approved', 
            'is_email_verified', 'date_joined', 'invite_note', 'invite_used', 
            'avatar', 'theme_preference', 'subscription_plan', 'stripe_customer_id',
            'query_usage_count'
        )


class UserAvatarSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('avatar',)


class UserActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserActivity
        fields = ('id', 'feature_name', 'visited_at', 'session_id')


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ('id', 'title', 'message', 'is_read', 'type', 'created_at')


class UserSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSession
        fields = ('id', 'device_name', 'browser', 'ip_address', 'last_active', 'is_active')


class VerifyEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return data


class UpdateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'theme_preference', 'digest_enabled', 'security_alerts_enabled')

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_new_password = serializers.CharField(required=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_new_password']:
            raise serializers.ValidationError({"confirm_new_password": "New passwords do not match."})
        return data


class AuditLogSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    target_user_email = serializers.EmailField(source='target_user.email', read_only=True)

    class Meta:
        model = AuditLog
        fields = ('id', 'user', 'user_email', 'action', 'target_user', 'target_user_email', 'ip_address', 'user_agent', 'metadata', 'created_at')
