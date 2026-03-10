import json
import logging
import time

logger = logging.getLogger('insight_hub.audit')

class LoggingMiddleware:
    """FIXED: Structured JSON logging for production request auditing."""
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.time()
        
        response = self.get_response(request)
        
        duration = time.time() - start_time
        
        log_data = {
            "timestamp": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
            "method": request.method,
            "path": request.path,
            "status": response.status_code,
            "duration_ms": int(duration * 1000),
            "ip": self.get_client_ip(request),
            "user": request.user.email if request.user.is_authenticated else "anonymous",
        }
        
        logger.info(json.dumps(log_data))
        
        return response

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
