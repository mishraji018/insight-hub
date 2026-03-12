from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db import connection
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class HealthCheckView(APIView):
    """FIXED: System health check for database and version status."""
    permission_classes = [AllowAny]

    def get(self, request):
        health_status = {
            "status": "ok",
            "database": "unknown",
            "redis": "ok", # Eager mode is active so redis is bypassed
            "version": "1.0.0"
        }

        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            health_status["database"] = "ok"
        except Exception as e:
            logger.error(f"Database health check failed: {str(e)}")
            health_status["database"] = "err"
            health_status["status"] = "error"

        return Response(health_status)
