from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView,
    TokenObtainPairView
)
from django.conf import settings
from django.conf.urls.static import static
from core.views import HealthCheckView
from core.serializers import CustomTokenObtainPairSerializer
from users.views import (
    RegisterView, ValidateInviteView, MeView, ChangePasswordView,
    GenerateInviteView, ListInvitesView, DeleteInviteView,
    AllUsersView, PendingUsersView, AssignRoleView, RevokeAccessView,
    LoginHistoryView, CustomTokenObtainPairView,
    ForgotPasswordView, ResetPasswordView, VerifyEmailView,
    ResendVerificationView, UpdateProfileView, UploadAvatarView,
    TrackActivityView, UserStatsView,
    NotificationListView, MarkNotificationReadView, ClearNotificationsView,
    UserSessionListView, RevokeSessionView, RevokeAllSessionsView,
    DataExportView,
    TwoFASetupView, TwoFAEnableView, TwoFADisableView, TwoFAVerifyView,
    CompleteOnboardingView,
    AdminStatsView, AdminUserListView, AdminUserActionView,
    GlobalSearchView, AuditLogListView, AuditLogExportView
)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('analytics.urls')),
    path('api/', include('users.urls')),
    
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/validate-invite/', ValidateInviteView.as_view(), name='validate-invite'),
    path('api/auth/me/', MeView.as_view(), name='me'),
    path('api/auth/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('api/auth/login-history/', LoginHistoryView.as_view(), name='login-history'),
    
    path('api/auth/forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('api/auth/reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('api/auth/verify-email/', VerifyEmailView.as_view(), name='verify-email'),
    path('api/auth/resend-verification/', ResendVerificationView.as_view(), name='resend-verification'),
    path('api/auth/profile/', UpdateProfileView.as_view(), name='update-profile'),
    path('api/auth/upload-avatar/', UploadAvatarView.as_view(), name='upload-avatar'),
    
    path('api/analytics/track/', TrackActivityView.as_view(), name='track-activity'),
    path('api/analytics/my-stats/', UserStatsView.as_view(), name='user-stats'),
    
    path('api/notifications/', NotificationListView.as_view(), name='notification-list'),
    path('api/notifications/<int:id>/read/', MarkNotificationReadView.as_view(), name='notification-read'),
    path('api/notifications/clear-all/', ClearNotificationsView.as_view(), name='notification-clear'),
    
    path('api/auth/sessions/', UserSessionListView.as_view(), name='session-list'),
    path('api/auth/sessions/<int:id>/revoke/', RevokeSessionView.as_view(), name='session-revoke'),
    path('api/auth/sessions/logout-all/', RevokeAllSessionsView.as_view(), name='session-logout-all'),
    path('api/auth/export-data/', DataExportView.as_view(), name='data-export'),
    
    path('api/admin/invite/generate/', GenerateInviteView.as_view(), name='generate-invite'),
    path('api/admin/invite/list/', ListInvitesView.as_view(), name='list-invites'),
    path('api/admin/invite/<str:token>/delete/', DeleteInviteView.as_view(), name='delete-invite'),
    
    path('api/admin/users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('api/admin/users/pending/', PendingUsersView.as_view(), name='pending-users'),
    path('api/admin/users/<int:id>/assign-role/', AssignRoleView.as_view(), name='assign-role'),
    path('api/admin/users/<int:id>/revoke/', RevokeAccessView.as_view(), name='revoke-access'),
    path('api/admin/users/<int:id>/action/', AdminUserActionView.as_view(), name='admin-user-action'),
    path('api/admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('api/admin/audit-log/', AuditLogListView.as_view(), name='admin-audit-log'),
    path('api/admin/audit-log/export/', AuditLogExportView.as_view(), name='admin-audit-log-export'),
    
    path('api/auth/2fa/setup/', TwoFASetupView.as_view(), name='2fa-setup'),
    path('api/auth/2fa/enable/', TwoFAEnableView.as_view(), name='2fa-enable'),
    path('api/auth/2fa/disable/', TwoFADisableView.as_view(), name='2fa-disable'),
    path('api/auth/2fa/verify/', TwoFAVerifyView.as_view(), name='2fa-verify'),
    path('api/auth/onboarding/complete/', CompleteOnboardingView.as_view(), name='onboarding-complete'),
    path('api/search/', GlobalSearchView.as_view(), name='global-search'),
    
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    path('api/health/', HealthCheckView.as_view(), name='health'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)