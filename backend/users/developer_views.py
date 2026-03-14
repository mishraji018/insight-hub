import secrets
import hashlib
from rest_framework import viewsets, status, permissions, decorators
from rest_framework.response import Response
from .models import APIKey
from .serializers import APIKeySerializer

def generate_key():
    prefix = "ih_" + secrets.token_hex(3)
    secret = secrets.token_urlsafe(32)
    full_key = f"{prefix}.{secret}"
    key_hash = hashlib.sha256(full_key.encode()).hexdigest()
    return prefix, full_key, key_hash

class APIKeyViewSet(viewsets.ModelViewSet):
    serializer_class = APIKeySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return APIKey.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        name = request.data.get('name', 'My API Key')
        prefix, full_key, key_hash = generate_key()
        
        # User is limited to 5 keys
        if APIKey.objects.filter(user=request.user).count() >= 5:
            return Response({"error": "Maximum 5 API keys allowed"}, status=status.HTTP_400_BAD_REQUEST)
            
        api_key = APIKey.objects.create(
            user=request.user,
            name=name,
            key_hash=key_hash,
            prefix=prefix,
            rate_limit=1000 # Default 1000 req/hr
        )
        
        return Response({
            "id": api_key.id,
            "name": api_key.name,
            "key": full_key, # ONLY SHOWN ONCE
            "prefix": api_key.prefix,
            "created_at": api_key.created_at
        }, status=status.HTTP_201_CREATED)

    @decorators.action(detail=True, methods=['post'])
    def toggle(self, request, pk=None):
        api_key = self.get_object()
        api_key.is_active = not api_key.is_active
        api_key.save()
        return Response({"is_active": api_key.is_active})
