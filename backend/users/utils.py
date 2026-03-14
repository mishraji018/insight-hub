from .models import AuditLog

def log_audit(request, action, target_user=None, metadata=None):
    """
    Utility to log audit events.
    request: The HTTP request object (to extract user, ip, user_agent)
    action: String describing the action (e.g. 'LOGIN_SUCCESS')
    target_user: The user being affected (optional)
    metadata: Dictionary with extra details (optional)
    """
    user = request.user if request.user.is_authenticated else None
    
    # Extract IP
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')

    user_agent = request.META.get('HTTP_USER_AGENT', '')

    AuditLog.objects.create(
        user=user,
        action=action,
        target_user=target_user,
        ip_address=ip,
        user_agent=user_agent,
        metadata=metadata or {}
    )
