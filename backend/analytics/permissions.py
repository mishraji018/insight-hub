from rest_framework import permissions

class IsExecutive(permissions.BasePermission):
    """Allows access only to users with the 'executive' role."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'executive')

class IsAnalyst(permissions.BasePermission):
    """Allows access only to users with the 'analyst' role."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'analyst')

class IsManager(permissions.BasePermission):
    """Allows access only to users with the 'manager' role."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'manager')

class IsExecutiveOrAnalyst(permissions.BasePermission):
    """Allows access to both executives and analysts."""
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return request.user.role in ['executive', 'analyst', 'manager']
