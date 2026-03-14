import random
import string
from django.utils import timezone
from datetime import timedelta
from rest_framework import status, views, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import update_session_auth_hash
from django.shortcuts import get_object_or_404
import pyotp
import qrcode
import base64
from io import BytesIO
import json
import secrets
from django.db.models import Q
from .models import InviteToken, User, LoginHistory, PasswordResetOTP, UserActivity, Notification, UserSession, AuditLog
from .utils import log_audit
from .serializers import (
    InviteTokenSerializer, 
    RegisterInviteSerializer, 
    UserManagementSerializer,
    ChangePasswordSerializer,
    LoginHistorySerializer,
    UserAvatarSerializer,
    UserActivitySerializer,
    VerifyEmailSerializer,
    ResetPasswordSerializer,
    UpdateProfileSerializer,
    NotificationSerializer,
    UserSessionSerializer,
    AuditLogSerializer
)
from rest_framework_simplejwt.views import TokenObtainPairView
from django.core.mail import send_mail
from django.conf import settings
from .tasks import send_otp_email_task, record_login_history_task, create_notification_task

def generate_random_token(length=8):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

def generate_otp(length=6):
    return ''.join(random.choices(string.digits, k=length))

def send_otp_email(email, otp, subject="Your Verification Code"):
    message = f"Your code is: {otp}. It expires in 10 minutes."
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [email],
        fail_silently=False,
    )

class GenerateInviteView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        note = request.data.get('note', '')
        token_str = generate_random_token()
        
        # Ensure uniqueness
        while InviteToken.objects.filter(token=token_str).exists():
            token_str = generate_random_token()
            
        invite = InviteToken.objects.create(
            token=token_str,
            created_by=request.user,
            expires_at=timezone.now() + timedelta(hours=24),
            note=note
        )
        
        # In a real app, this base URL would come from settings
        invite_link = f"http://localhost:8081/register?invite={token_str}"
        
        return Response({
            "token": invite.token,
            "invite_link": invite_link,
            "expires_at": invite.expires_at,
            "note": invite.note
        }, status=status.HTTP_201_CREATED)

class ValidateInviteView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        token_str = request.query_params.get('token')
        if not token_str:
            return Response({"valid": False, "error": "Invite token is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            token = InviteToken.objects.get(token=token_str)
        except InviteToken.DoesNotExist:
            return Response({"valid": False, "error": "Invalid invite link"}, status=status.HTTP_400_BAD_REQUEST)
            
        if token.is_used:
            return Response({"valid": False, "error": "Invite link already used"}, status=status.HTTP_400_BAD_REQUEST)
        if token.is_expired():
            return Response({"valid": False, "error": "Invite link expired"}, status=status.HTTP_400_BAD_REQUEST)
            
        return Response({"valid": True, "expires_at": token.expires_at}, status=status.HTTP_200_OK)

class RegisterView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterInviteSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate and send OTP for email verification
            otp = generate_otp()
            PasswordResetOTP.objects.create(
                user=user,
                otp=otp,
                expires_at=timezone.now() + timedelta(minutes=10)
            )
            send_otp_email_task.delay(user.email, otp, subject="Insight Hub - Verify Your Email")

            refresh = RefreshToken.for_user(user)
            return Response({
                "message": "Registration successful. Please verify your email with the code sent to you.",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "name": f"{user.first_name} {user.last_name}".strip() or user.email,
                    "role": user.role,
                    "is_approved": user.is_approved,
                    "is_email_verified": user.is_email_verified
                },
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MeView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "email": user.email,
            "name": f"{user.first_name} {user.last_name}".strip() or user.email,
            "role": user.role,
            "is_approved": user.is_approved,
            "is_staff": user.is_staff,
            "date_joined": user.date_joined
        })

class LoginHistoryView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        history = LoginHistory.objects.filter(user=request.user)
        serializer = LoginHistorySerializer(history, many=True)
        return Response(serializer.data)

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        user = User.objects.filter(email=email).first()

        if user:
            if user.locked_until and user.locked_until > timezone.now():
                diff = user.locked_until - timezone.now()
                minutes = int(diff.total_seconds() // 60)
                seconds = int(diff.total_seconds() % 60)
                return Response({
                    "detail": f"Account locked. Try again in {minutes}:{seconds:02d}."
                }, status=status.HTTP_403_FORBIDDEN)

        try:
            response = super().post(request, *args, **kwargs)
        except Exception as e:
            if user:
                user.failed_attempts += 1
                if user.failed_attempts >= 5:
                    user.locked_until = timezone.now() + timedelta(minutes=10)
                user.save()
                
                attempts_left = 5 - user.failed_attempts
                if attempts_left > 0:
                    detail = f"Invalid credentials. {user.failed_attempts} of 5 attempts used."
                else:
                    detail = "Account locked for 10 minutes due to multiple failed attempts."
                
                return Response({"detail": detail}, status=status.HTTP_401_UNAUTHORIZED)
            raise e

        if response.status_code == status.HTTP_200_OK:
            # Check 2FA
            if user.two_fa_enabled:
                return Response({
                    "requires_2fa": True,
                    "email": user.email
                }, status=status.HTTP_200_OK)

            # Check email verification before allowing login
            if not user.is_email_verified:
                return Response({
                    "detail": "Please verify your email first.",
                    "not_verified": True
                }, status=status.HTTP_403_FORBIDDEN)

            # Reset failed attempts
            user.failed_attempts = 0
            user.locked_until = None
            user.save()
            # simple device/browser detection
            user_agent = request.META.get('HTTP_USER_AGENT', '')
            browser = "Unknown"
            if 'Chrome' in user_agent: browser = "Chrome"
            elif 'Firefox' in user_agent: browser = "Firefox"
            elif 'Safari' in user_agent: browser = "Safari"
            elif 'Edge' in user_agent: browser = "Edge"
            
            device = "Desktop"
            if 'Mobile' in user_agent: device = "Mobile"
            elif 'Tablet' in user_agent: device = "Tablet"

            # Create User Session
            session_token = str(response.data.get('access')) # Using access token as session identifier for now
            
            UserSession.objects.create(
                user=user,
                session_token=session_token,
                device_name=device,
                browser=browser,
                ip_address=request.META.get('REMOTE_ADDR')
            )

            # Record login history (also keeping this for compatibility/legacy analytics)
            record_login_history_task.delay(user.id, device, browser)

            # Security Notification for new login
            # Check if this is a new browser/device combination
            is_new_device = not LoginHistory.objects.filter(
                user=user, 
                device_info=device, 
                browser_info=browser
            ).exclude(timestamp__gte=timezone.now() - timedelta(seconds=1)).exists()

            if is_new_device:
                create_notification_task.delay(
                    user.id,
                    "New Login Detected",
                    f"Your account was accessed from a new {device} using {browser}.",
                    'login'
                )

            # Add user details to response for frontend convenience
            response.data['user'] = {
                "id": user.id,
                "email": user.email,
                "name": f"{user.first_name} {user.last_name}".strip() or user.email,
                "role": user.role,
                "is_approved": user.is_approved,
                "is_staff": user.is_staff,
                "avatar": user.avatar.url if user.avatar else None,
                "theme_preference": user.theme_preference,
                "onboarding_complete": user.onboarding_complete
            }
        return response

class ForgotPasswordView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        user = User.objects.filter(email=email).first()
        if user:
            otp = generate_otp()
            PasswordResetOTP.objects.create(
                user=user,
                otp=otp,
                expires_at=timezone.now() + timedelta(minutes=10)
            )
            send_otp_email_task.delay(email, otp, subject="Insight Hub - Password Reset OTP")
        
        return Response({"message": "If an account exists with this email, an OTP has been sent."}, status=status.HTTP_200_OK)

class ResetPasswordView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp = serializer.validated_data['otp']
            new_password = serializer.validated_data['new_password']
            
            reset_otp = PasswordResetOTP.objects.filter(
                user__email=email,
                otp=otp,
                is_used=False
            ).last()
            
            if not reset_otp or reset_otp.is_expired():
                return Response({"otp": ["Invalid or expired OTP."]}, status=status.HTTP_400_BAD_REQUEST)
            
            user = reset_otp.user
            user.set_password(new_password)
            user.save()
            
            reset_otp.is_used = True
            reset_otp.save()
            
            return Response({"message": "Password reset successfully."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyEmailView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = VerifyEmailSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp = serializer.validated_data['otp']
            
            reset_otp = PasswordResetOTP.objects.filter(
                user__email=email,
                otp=otp,
                is_used=False
            ).last()
            
            otp_obj = PasswordResetOTP.objects.filter(
                user__email=email,
                otp=otp,
                is_used=False
            ).last()
            
            if not otp_obj or otp_obj.is_expired():
                return Response({"otp": ["Invalid or expired code."]}, status=status.HTTP_400_BAD_REQUEST)
            
            user = otp_obj.user
            user.is_email_verified = True
            otp_obj.is_used = True
            user.save()
            otp_obj.save()
            
            log_audit(request, 'EMAIL_VERIFIED', target_user=user)
            
            return Response({"message": "Email verified successfully."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ResendVerificationView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        user = User.objects.filter(email=email).first()
        if user and not user.is_email_verified:
            otp = generate_otp()
            PasswordResetOTP.objects.create(
                user=user,
                otp=otp,
                expires_at=timezone.now() + timedelta(minutes=10)
            )
            send_otp_email(email, otp, subject="Insight Hub - New Verification Code")
            log_audit(request, 'EMAIL_VERIFICATION_RESENT', target_user=user)
            return Response({"message": "New code sent."}, status=status.HTTP_200_OK)
        return Response({"error": "User not found or already verified."}, status=status.HTTP_400_BAD_REQUEST)

class UpdateProfileView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        serializer = UpdateProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            Notification.objects.create(
                user=request.user,
                title="Profile Updated",
                message="Your profile information has been successfully updated.",
                type='system'
            )
            log_audit(request, 'PROFILE_UPDATED')
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UploadAvatarView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = UserAvatarSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            user = serializer.save()
            log_audit(request, 'AVATAR_UPLOADED')
            return Response({
                "avatar_url": user.avatar.url if user.avatar else None
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TrackActivityView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        feature_name = request.data.get('feature_name')
        if feature_name:
            UserActivity.objects.create(
                user=request.user,
                feature_name=feature_name,
                session_id=request.session.session_key
            )
            return Response(status=status.HTTP_201_CREATED)
        return Response({"error": "Feature name is required"}, status=status.HTTP_400_BAD_REQUEST)

class UserStatsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        total_logins = LoginHistory.objects.filter(user=user).count()
        
        from django.db.models import Count
        most_used = UserActivity.objects.filter(user=user).values('feature_name').annotate(count=Count('feature_name')).order_by('-count')[:5]
        
        days_active_count = UserActivity.objects.filter(user=user).dates('visited_at', 'day').count()
        last_seen = UserActivity.objects.filter(user=user).order_by('-visited_at').first()
        
        return Response({
            "total_logins": total_logins,
            "most_used_features": list(most_used),
            "days_active": days_active_count,
            "last_seen": last_seen.visited_at if last_seen else None,
            "member_since": user.date_joined
        })

class ChangePasswordView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({"old_password": ["Current password is incorrect."]}, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            update_session_auth_hash(request, user)
            
            log_audit(request, 'PASSWORD_CHANGED')
            
            # Security notification
            Notification.objects.create(
                user=user,
                title="Password Changed",
                message="Your account password was recently changed. If this wasn't you, please contact support immediately.",
                type='security'
            )
            
            return Response({"message": "Password changed successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ListInvitesView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        invites = InviteToken.objects.all().order_by('-created_at')
        serializer = InviteTokenSerializer(invites, many=True)
        return Response(serializer.data)

class DeleteInviteView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def delete(self, request, token):
        invite = InviteToken.objects.filter(token=token, is_used=False).first()
        if not invite:
            return Response({"error": "Invite not found or already used"}, status=status.HTTP_404_NOT_FOUND)
        invite.delete()
        log_audit(request, 'INVITE_DELETED', message=f"Invite token {token} deleted.")
        return Response(status=status.HTTP_204_NO_CONTENT)

class PendingUsersView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        users = User.objects.filter(is_approved=False).order_by('-date_joined')
        serializer = UserManagementSerializer(users, many=True)
        return Response(serializer.data)

class AllUsersView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        users = User.objects.all().order_by('-date_joined')
        serializer = UserManagementSerializer(users, many=True)
        return Response(serializer.data)

class AssignRoleView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, id):
        user = User.objects.filter(id=id).first()
        if not user:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            
        role = request.data.get('role')
        if role not in ['executive', 'analyst', 'manager']:
            return Response({"error": "Invalid role"}, status=status.HTTP_400_BAD_REQUEST)
            
        user.role = role
        user.is_approved = True
        user.approved_by = request.user
        user.approved_at = timezone.now()
        user.save()
        
        log_audit(request, 'USER_ROLE_ASSIGNED', target_user=user, message=f"Role '{role}' assigned.")
        
        return Response({"message": "Role assigned successfully"}, status=status.HTTP_200_OK)

class RevokeAccessView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, id):
        user = User.objects.filter(id=id).first()
        if not user:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            
        user.is_approved = False
        user.role = 'pending'
        user.save()
        
        log_audit(request, 'USER_ACCESS_REVOKED', target_user=user)
        
        return Response({"message": "Access revoked"}, status=status.HTTP_200_OK)


class NotificationListView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(user=request.user)[:20]
        serializer = NotificationSerializer(notifications, many=True)
        unread_count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({
            "results": serializer.data,
            "unread_count": unread_count
        })


class MarkNotificationReadView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, id):
        notification = get_object_or_404(Notification, id=id, user=request.user)
        notification.is_read = True
        notification.save()
        log_audit(request, 'NOTIFICATION_READ', message=f"Notification {id} marked as read.")
        return Response(status=status.HTTP_200_OK)


class ClearNotificationsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        Notification.objects.filter(user=request.user).delete()
        log_audit(request, 'NOTIFICATIONS_CLEARED')
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserSessionListView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        sessions = UserSession.objects.filter(user=request.user, is_active=True)
        serializer = UserSessionSerializer(sessions, many=True)
        return Response(serializer.data)


class RevokeSessionView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, id):
        session = get_object_or_404(UserSession, id=id, user=request.user)
        session.is_active = False
        session.save()
        log_audit(request, 'SESSION_REVOKED', message=f"Session {id} revoked.")
        return Response(status=status.HTTP_204_NO_CONTENT)


class RevokeAllSessionsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        # Mark all active sessions except the current one as inactive
        # Since we don't have a reliable way to get the current session token easily in this stateless JWT setup,
        # we'll just deactivate all for now.
        UserSession.objects.filter(user=request.user).update(is_active=False)
        log_audit(request, 'ALL_SESSIONS_REVOKED')
        return Response(status=status.HTTP_204_NO_CONTENT)


class DataExportView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        export_type = request.query_params.get('format', 'json')

        data = {
            "profile": {
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": user.role,
                "date_joined": user.date_joined.isoformat(),
            },
            "login_history": list(LoginHistory.objects.filter(user=user).values()),
            "activity_log": list(UserActivity.objects.filter(user=user).values()),
            "notifications": list(Notification.objects.filter(user=user).values())
        }

        if export_type == 'pdf':
            from io import BytesIO
            from reportlab.pdfgen import canvas
            from django.http import HttpResponse

            buffer = BytesIO()
            p = canvas.Canvas(buffer)
            p.drawString(100, 800, f"Account Data Export: {user.email}")
            p.drawString(100, 780, f"Generated at: {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}")
            
            y = 750
            p.drawString(100, y, "Profile Information:")
            y -= 20
            p.drawString(120, y, f"Name: {user.first_name} {user.last_name}")
            y -= 15
            p.drawString(120, y, f"Joined: {user.date_joined.strftime('%Y-%m-%d')}")
            
            y -= 40
            p.drawString(100, y, "Recent Logins:")
            y -= 20
            for lh in LoginHistory.objects.filter(user=user)[:10]:
                p.drawString(120, y, f"{lh.timestamp.strftime('%Y-%m-%d %H:%M:%S')} - {lh.browser_info} on {lh.device_info}")
                y -= 15
            
            p.showPage()
            p.save()
            
            buffer.seek(0)
            log_audit(request, 'DATA_EXPORTED', message=f"Data exported as {export_type}.")
            return HttpResponse(buffer, content_type='application/pdf')

        log_audit(request, 'DATA_EXPORTED', message=f"Data exported as {export_type}.")
        return Response(data)


class TwoFASetupView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if not user.two_fa_secret:
            user.two_fa_secret = pyotp.random_base32()
            user.save()

        otp_uri = pyotp.totp.TOTP(user.two_fa_secret).provisioning_uri(
            name=user.email,
            issuer_name="Insight Hub"
        )

        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(otp_uri)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")

        buffer = BytesIO()
        img.save(buffer, format="PNG")
        qr_code_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')

        log_audit(request, '2FA_SETUP_INITIATED')
        return Response({
            "secret": user.two_fa_secret,
            "qr_code": f"data:image/png;base64,{qr_code_base64}"
        })


class TwoFAEnableView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        otp_code = request.data.get('otp_code')
        user = request.user

        if not user.two_fa_secret:
            return Response({"detail": "2FA setup not initiated."}, status=status.HTTP_400_BAD_REQUEST)

        totp = pyotp.TOTP(user.two_fa_secret)
        if totp.verify(otp_code, valid_window=1): # Added a small window for clock drift
            user.two_fa_enabled = True
            # Generate 8 backup codes
            backup_codes = [secrets.token_hex(4).upper() for _ in range(8)]
            user.backup_codes = backup_codes
            user.save()
            
            Notification.objects.create(
                user=user,
                title="2FA Enabled",
                message="Two-factor authentication has been successfully enabled for your account.",
                type='security'
            )
            log_audit(request, '2FA_ENABLED')
            
            return Response({
                "message": "2FA enabled successfully.",
                "backup_codes": backup_codes
            })
        
        log_audit(request, '2FA_ENABLE_FAILED', message="Invalid TOTP code during 2FA enable.")
        return Response({"detail": "Invalid TOTP code."}, status=status.HTTP_400_BAD_REQUEST)


class TwoFADisableView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        password = request.data.get('password')
        otp_code = request.data.get('otp_code')
        user = request.user

        if not user.check_password(password):
            log_audit(request, '2FA_DISABLE_FAILED', message="Invalid password during 2FA disable.")
            return Response({"detail": "Invalid password."}, status=status.HTTP_400_BAD_REQUEST)

        totp = pyotp.TOTP(user.two_fa_secret)
        if totp.verify(otp_code):
            user.two_fa_enabled = False
            user.two_fa_secret = None
            user.backup_codes = None
            user.save()
            
            Notification.objects.create(
                user=user,
                title="2FA Disabled",
                message="Two-factor authentication has been disabled for your account.",
                type='security'
            )
            log_audit(request, '2FA_DISABLED')
            
            return Response({"message": "2FA disabled successfully."})
        
        log_audit(request, '2FA_DISABLE_FAILED', message="Invalid TOTP code during 2FA disable.")
        return Response({"detail": "Invalid TOTP code."}, status=status.HTTP_400_BAD_REQUEST)


class TwoFAVerifyView(views.APIView):
    def post(self, request):
        email = request.data.get('email')
        otp_code = request.data.get('otp_code')
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        if not otp_code:
            return Response({"detail": "Code is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Check TOTP
        totp = pyotp.TOTP(user.two_fa_secret)
        is_valid = totp.verify(otp_code, valid_window=1)

        # Check Backup Codes if not TOTP
        if not is_valid and user.backup_codes:
            cleaned_code = otp_code.strip().upper()
            if cleaned_code in user.backup_codes:
                user.backup_codes.remove(cleaned_code)
                user.save()
                is_valid = True

        if is_valid:
            refresh = RefreshToken.for_user(user)
            # Finalize login
            user.last_login = timezone.now()
            user.failed_attempts = 0
            user.save()
            log_audit(request, 'LOGIN_SUCCESS_2FA', target_user=user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    "id": user.id,
                    "email": user.email,
                    "name": f"{user.first_name} {user.last_name}".strip() or user.email,
                    "role": user.role,
                    "is_approved": user.is_approved,
                    "is_staff": user.is_staff,
                    "avatar": user.avatar.url if user.avatar else None,
                    "theme_preference": user.theme_preference,
                    "onboarding_complete": user.onboarding_complete
                }
            })

        log_audit(request, '2FA_VERIFY_FAILED', target_user=user, message="Invalid 2FA code during login.")
        return Response({"detail": "Invalid 2FA code."}, status=status.HTTP_400_BAD_REQUEST)


class CompleteOnboardingView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        user = request.user
        user.onboarding_complete = True
        user.save()
        log_audit(request, 'ONBOARDING_COMPLETE')
        return Response({"message": "Onboarding complete"})


class AdminStatsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def get(self, request):
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = today_start - timedelta(days=7)
        month_start = today_start - timedelta(days=30)

        total_users = User.objects.count()
        active_today = UserSession.objects.filter(last_active__gte=today_start, is_active=True).values('user').distinct().count()
        new_this_week = User.objects.filter(date_joined__gte=week_start).count()
        new_this_month = User.objects.filter(date_joined__gte=month_start).count()
        
        total_logins_today = LoginHistory.objects.filter(timestamp__gte=today_start).count()
        failed_logins_today = User.objects.filter(failed_attempts__gt=0, last_login__gte=today_start).count() # Best guess
        locked_accounts_count = User.objects.filter(locked_until__gt=now).count()

        # Most used features (top 5)
        from django.db.models import Count
        most_used = UserActivity.objects.values('feature_name').annotate(count=Count('id')).order_by('-count')[:5]

        # User growth (last 12 months)
        user_growth = []
        for i in range(12):
            # Calculate for each month
            m_date = now - timedelta(days=i*30)
            m_start = m_date.replace(day=1, hour=0, minute=0, second=0)
            # Find next month start
            if m_start.month == 12:
                next_m_start = m_start.replace(year=m_start.year + 1, month=1)
            else:
                next_m_start = m_start.replace(month=m_start.month + 1)
            
            monthly_count = User.objects.filter(date_joined__gte=m_start, date_joined__lt=next_m_start).count()
            user_growth.append({
                "month": m_start.strftime("%b %Y"),
                "count": monthly_count
            })
        user_growth.reverse()

        return Response({
            "total_users": total_users,
            "active_today": active_today,
            "new_this_week": new_this_week,
            "new_this_month": new_this_month,
            "total_logins_today": total_logins_today,
            "failed_logins_today": failed_logins_today,
            "locked_accounts_count": locked_accounts_count,
            "most_used_features": list(most_used),
            "user_growth": user_growth
        })


class AdminUserListView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def get(self, request):
        now = timezone.now()
        from django.db.models import Count
        users = User.objects.annotate(login_count=Count('login_history')).order_by('-date_joined')
        
        search = request.query_params.get('search')
        if search:
            users = users.filter(Q(email__icontains=search) | Q(first_name__icontains=search) | Q(last_name__icontains=search))
        
        data = []
        for u in users:
            data.append({
                "id": u.id,
                "name": f"{u.first_name} {u.last_name}".strip() or u.email,
                "email": u.email,
                "joined": u.date_joined,
                "last_login": u.last_login,
                "is_verified": u.is_email_verified,
                "is_locked": u.locked_until > now if u.locked_until else False,
                "two_fa_enabled": u.two_fa_enabled,
                "is_active": u.is_active,
                "login_count": getattr(u, 'login_count', 0)
            })
        return Response(data)


class AdminUserActionView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def patch(self, request, id):
        user = get_object_or_404(User, id=id)
        action = request.data.get('action')

        if action == 'unlock_account':
            user.locked_until = None
            user.failed_attempts = 0
            user.save()
            log_audit(request, 'ADMIN_USER_UNLOCKED', target_user=user)
        elif action == 'toggle_active':
            user.is_active = not user.is_active
            user.save()
            log_audit(request, 'ADMIN_USER_DEACTIVATED' if not user.is_active else 'ADMIN_USER_ACTIVATED', target_user=user)
        elif action == 'force_logout':
            UserSession.objects.filter(user=user).update(is_active=False)
            log_audit(request, 'ADMIN_FORCE_LOGOUT', target_user=user)
        
        return Response({"message": f"Action {action} performed successfully."})


class GlobalSearchView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if not query:
            return Response({"pages": [], "history": [], "users": []})

        # 1. Pages/Features (Static List)
        all_pages = [
            {"title": "Dashboard", "url": "/dashboard", "icon": "LayoutDashboard"},
            {"title": "Profile", "url": "/profile", "icon": "User"},
            {"title": "Settings", "url": "/profile?tab=settings", "icon": "Settings"},
            {"title": "Notifications", "url": "/notifications", "icon": "Bell"},
            {"title": "Security", "url": "/profile?tab=security", "icon": "Shield"},
            {"title": "Predictions", "url": "/predictions", "icon": "Brain"},
            {"title": "Analytics", "url": "/analytics", "icon": "BarChart3"},
        ]
        if request.user.role == 'admin' or request.user.is_staff:
             all_pages.append({"title": "Admin Dashboard", "url": "/admin/dashboard", "icon": "ShieldAlert"})

        pages = [p for p in all_pages if query.lower() in p['title'].lower()]

        # 2. User's Own Activity History
        history_objs = UserActivity.objects.filter(
            user=request.user,
            feature_name__icontains=query
        ).distinct('feature_name')[:5]
        history = [{"title": h.feature_name, "visited_at": h.visited_at} for h in history_objs]

        # 3. Admin: Searches Users (Only if admin)
        users = []
        if request.user.role == 'admin' or request.user.is_staff:
            user_objs = User.objects.filter(
                Q(email__icontains=query) | 
                Q(first_name__icontains=query) | 
                Q(last_name__icontains=query)
            )[:5]
            users = [{
                "id": u.id,
                "name": f"{u.first_name} {u.last_name}".strip() or u.email,
                "email": u.email,
                "avatar": u.avatar.url if u.avatar else None
            } for u in user_objs]

        return Response({
            "pages": pages,
            "history": history,
            "users": users
        })


class AuditLogListView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def get(self, request):
        logs = AuditLog.objects.all().order_by('-created_at')
        
        # Filtering
        action_type = request.query_params.get('action')
        if action_type:
            logs = logs.filter(action=action_type)
            
        user_email = request.query_params.get('user')
        if user_email:
            logs = logs.filter(Q(user__email__icontains=user_email) | Q(target_user__email__icontains=user_email))
            
        # Pagination
        from django.core.paginator import Paginator
        paginator = Paginator(logs, 50)
        page_number = request.query_params.get('page', 1)
        page_obj = paginator.get_page(page_number)
        
        serializer = AuditLogSerializer(page_obj, many=True)
        return Response({
            "results": serializer.data,
            "total_pages": paginator.num_pages,
            "current_page": page_obj.number,
            "total_count": paginator.count
        })


class AuditLogExportView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def get(self, request):
        import csv
        from django.http import HttpResponse
        
        logs = AuditLog.objects.all().order_by('-created_at')
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="audit_log_export.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Timestamp', 'User', 'Action', 'Target User', 'IP Address', 'User Agent', 'Metadata'])
        
        for log in logs:
            writer.writerow([
                log.created_at,
                log.user.email if log.user else 'System',
                log.action,
                log.target_user.email if log.target_user else '',
                log.ip_address,
                log.user_agent,
                log.metadata
            ])
            
        log_audit(request, 'ADMIN_AUDIT_LOG_EXPORTED')
        return response
