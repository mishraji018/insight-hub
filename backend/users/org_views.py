from rest_framework import viewsets, status, permissions, decorators
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils.crypto import get_random_string
from .models import Organisation, OrgMember, User
from .serializers import OrganisationSerializer, OrgMemberSerializer

class IsOrgOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if isinstance(obj, Organisation):
            return OrgMember.objects.filter(
                user=request.user, 
                organisation=obj, 
                role__in=['owner', 'admin']
            ).exists()
        return False

class OrganisationViewSet(viewsets.ModelViewSet):
    serializer_class = OrganisationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Organisation.objects.filter(members=self.request.user)

    def perform_create(self, serializer):
        org = serializer.save(owner=self.request.user)
        # Add creator as owner
        OrgMember.objects.create(
            user=self.request.user,
            organisation=org,
            role='owner'
        )

    @decorators.action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsOrgOwnerOrAdmin])
    def generate_invite(self, request, pk=None):
        org = self.get_object()
        code = get_random_string(12).upper()
        org.invite_code = code
        org.save()
        return Response({"invite_code": code})

    @decorators.action(detail=False, methods=['post'])
    def join(self, request):
        code = request.data.get('code')
        if not code:
            return Response({"error": "Invite code required"}, status=status.HTTP_400_BAD_REQUEST)
        
        org = get_object_or_404(Organisation, invite_code=code)
        
        if OrgMember.objects.filter(user=request.user, organisation=org).exists():
            return Response({"error": "Already a member"}, status=status.HTTP_400_BAD_REQUEST)
        
        OrgMember.objects.create(
            user=request.user,
            organisation=org,
            role='member'
        )
        return Response({"message": f"Joined {org.name}", "org_id": org.id})

    @decorators.action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        org = self.get_object()
        members = OrgMember.objects.filter(organisation=org)
        serializer = OrgMemberSerializer(members, many=True)
        return Response(serializer.data)

    @decorators.action(detail=True, methods=['patch'], url_path='members/(?P<member_id>[^/.]+)/role', permission_classes=[permissions.IsAuthenticated, IsOrgOwnerOrAdmin])
    def change_role(self, request, pk=None, member_id=None):
        org = self.get_object()
        member = get_object_or_404(OrgMember, id=member_id, organisation=org)
        
        new_role = request.data.get('role')
        if new_role not in dict(OrgMember.ROLE_CHOICES):
            return Response({"error": "Invalid role"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Prevent self-demotion of owner unless there's another owner
        if member.user == request.user and member.role == 'owner' and new_role != 'owner':
            other_owners = OrgMember.objects.filter(organisation=org, role='owner').exclude(user=request.user).exists()
            if not other_owners:
                return Response({"error": "Cannot demote the only owner"}, status=status.HTTP_400_BAD_REQUEST)

        member.role = new_role
        member.save()
        return Response({"message": "Role updated"})

    @decorators.action(detail=True, methods=['delete'], url_path='members/(?P<member_id>[^/.]+)', permission_classes=[permissions.IsAuthenticated, IsOrgOwnerOrAdmin])
    def remove_member(self, request, pk=None, member_id=None):
        org = self.get_object()
        member = get_object_or_404(OrgMember, id=member_id, organisation=org)
        
        if member.user == request.user:
            return Response({"error": "Use leave endpoint to remove yourself"}, status=status.HTTP_400_BAD_REQUEST)
            
        if member.role == 'owner' and not request.user == org.owner:
             return Response({"error": "Only the primary owner can remove other owners"}, status=status.HTTP_403_FORBIDDEN)

        member.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
