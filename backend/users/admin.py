from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, InviteToken

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'first_name', 'last_name',
                    'role', 'is_approved', 'is_staff')
    list_filter = ('role', 'is_approved', 'is_staff')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('-date_joined',)

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name')}),
        ('Permissions', {'fields': ('is_staff', 'is_superuser',
                                    'is_active', 'groups',
                                    'user_permissions')}),
        ('Dashboard Info', {'fields': ('role', 'is_approved',
                                       'approved_by', 'approved_at')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name',
                      'password1', 'password2', 'role',
                      'is_staff', 'is_superuser'),
        }),
    )
    readonly_fields = ('approved_by', 'approved_at', 'date_joined')

    actions = ['approve_as_executive', 'approve_as_analyst',
               'approve_as_manager', 'revoke_access']

    def approve_as_executive(self, request, queryset):
        queryset.update(role='executive', is_approved=True)
    approve_as_executive.short_description = "Approve as Executive"

    def approve_as_analyst(self, request, queryset):
        queryset.update(role='analyst', is_approved=True)
    approve_as_analyst.short_description = "Approve as Analyst"

    def approve_as_manager(self, request, queryset):
        queryset.update(role='manager', is_approved=True)
    approve_as_manager.short_description = "Approve as Manager"

    def revoke_access(self, request, queryset):
        queryset.update(role='pending', is_approved=False)
    revoke_access.short_description = "Revoke Access"


@admin.register(InviteToken)
class InviteTokenAdmin(admin.ModelAdmin):
    list_display = ('token', 'note', 'created_by',
                    'is_used', 'expires_at', 'used_by_email')
    list_filter = ('is_used',)
    readonly_fields = ('created_at', 'used_at', 'used_by_email')