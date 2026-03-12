from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView,
    TokenObtainPairView
)
from core.views import HealthCheckView
from core.serializers import CustomTokenObtainPairSerializer
from users.views import (
    RegisterView, ValidateInviteView, MeView, ChangePasswordView,
    GenerateInviteView, ListInvitesView, DeleteInviteView,
    AllUsersView, PendingUsersView, AssignRoleView, RevokeAccessView
)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('analytics.urls')),
    
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/validate-invite/', ValidateInviteView.as_view(), name='validate-invite'),
    path('api/auth/me/', MeView.as_view(), name='me'),
    path('api/auth/change-password/', ChangePasswordView.as_view(), name='change-password'),
    
    path('api/admin/invite/generate/', GenerateInviteView.as_view(), name='generate-invite'),
    path('api/admin/invite/list/', ListInvitesView.as_view(), name='list-invites'),
    path('api/admin/invite/<str:token>/delete/', DeleteInviteView.as_view(), name='delete-invite'),
    
    path('api/admin/users/', AllUsersView.as_view(), name='all-users'),
    path('api/admin/users/pending/', PendingUsersView.as_view(), name='pending-users'),
    path('api/admin/users/<int:id>/assign-role/', AssignRoleView.as_view(), name='assign-role'),
    path('api/admin/users/<int:id>/revoke/', RevokeAccessView.as_view(), name='revoke-access'),
    
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    path('api/health/', HealthCheckView.as_view(), name='health'),
]