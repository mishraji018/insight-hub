import hashlib
from rest_framework import authentication, exceptions
from django.core.cache import cache
from django.utils import timezone
from .models import APIKey

class APIKeyAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None

        full_key = auth_header.split(' ')[1]
        if not full_key.startswith('ih_'):
            return None # Fallback to other auth methods (like JWT)

        try:
            # We hash the key provided in the header to compare with our DB
            key_hash = hashlib.sha256(full_key.encode()).hexdigest()
            api_key = APIKey.objects.get(key_hash=key_hash, is_active=True)
        except APIKey.DoesNotExist:
            raise exceptions.AuthenticationFailed('Invalid or inactive API Key')

        # Rate Limiting Logic (Simple Redis-based)
        # Using ih_rate_limit:pk:hour_timestamp as key
        now = timezone.now()
        hour_key = f"ih_rl:{api_key.id}:{now.strftime('%Y%m%d%H')}"
        
        current_usage = cache.get(hour_key, 0)
        if current_usage >= api_key.rate_limit:
            raise exceptions.Throttled(detail=f"Rate limit exceeded. ({api_key.rate_limit} req/hr)")

        # Increment usage
        cache.set(hour_key, current_usage + 1, timeout=3600)
        
        # Update last_used occasionally (don't do it every second for perf)
        # if current_usage % 10 == 0:
        #     api_key.last_used = now
        #     api_key.save(update_fields=['last_used'])

        return (api_key.user, None)
