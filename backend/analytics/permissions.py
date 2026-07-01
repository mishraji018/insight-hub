from rest_framework import permissions

class IsExecutive(permissions.BasePermission):
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if not request.user.is_approved:  # ✅ FIXED
            return False
        return request.user.role in ['executive', 'admin']

class IsAnalyst(permissions.BasePermission):
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if not request.user.is_approved:  # ✅ FIXED
            return False
        return request.user.role in ['analyst', 'admin']

class IsManager(permissions.BasePermission):
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if not request.user.is_approved:  # ✅ FIXED
            return False
        return request.user.role in ['manager', 'admin']

class IsExecutiveOrAnalyst(permissions.BasePermission):
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if not request.user.is_approved:  # ✅ FIXED
            return False
        return request.user.role in ['executive', 'analyst', 'manager', 'admin', 'user']