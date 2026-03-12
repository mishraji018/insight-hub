import random
import string
from django.utils import timezone
from datetime import timedelta
from rest_framework import status, views, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import update_session_auth_hash
from django.shortcuts import get_object_or_404
from .models import InviteToken, User
from .serializers import (
    InviteTokenSerializer, 
    RegisterInviteSerializer, 
    UserManagementSerializer,
    ChangePasswordSerializer
)

def generate_random_token(length=8):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

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
            
            refresh = RefreshToken.for_user(user)
            return Response({
                "message": "Registration successful. Waiting for admin approval.",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "name": f"{user.first_name} {user.last_name}".strip() or user.email,
                    "role": user.role,
                    "is_approved": user.is_approved
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
            "is_staff": user.is_staff
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
        
        return Response({"message": "Access revoked"}, status=status.HTTP_200_OK)
