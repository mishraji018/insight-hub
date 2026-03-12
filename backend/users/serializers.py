import re
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import InviteToken

User = get_user_model()

class InviteTokenSerializer(serializers.ModelSerializer):
    is_expired = serializers.SerializerMethodField()

    class Meta:
        model = InviteToken
        fields = ('token', 'note', 'created_at', 'expires_at', 'is_used', 'used_by_email', 'is_expired')

    def get_is_expired(self, obj):
        return obj.is_expired()

class RegisterInviteSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    confirm_password = serializers.CharField(write_only=True, required=True)
    invite_token = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email', 'password', 'confirm_password', 'invite_token')

    def validate_invite_token(self, value):
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
        invite_val = validated_data.pop('invite_token')
        validated_data.pop('confirm_password')
    
        token = InviteToken.objects.get(token=invite_val)
    
        # FIX: username parameter hata diya
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role='pending',
            is_approved=False,
            invite_token=token
        )
    
        token.is_used = True
        token.used_by_email = user.email
        token.used_at = timezone.now()
        token.save()
    
        return user

class UserManagementSerializer(serializers.ModelSerializer):
    invite_note = serializers.CharField(source='invite_token.note', read_only=True)
    invite_used = serializers.CharField(source='invite_token.token', read_only=True)

    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'email', 'role', 'is_approved', 'date_joined', 'invite_note', 'invite_used')

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_new_password = serializers.CharField(required=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_new_password']:
            raise serializers.ValidationError({"confirm_new_password": "New passwords do not match."})
        return data
