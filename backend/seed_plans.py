import os
import django
import sys

# Setup django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')
django.setup()

from users.models import Plan

# Create or update plans to ensure IDs match frontend
Plan.objects.update_or_create(id=1, defaults={'name': 'free', 'max_queries': 100, 'can_export': False, 'is_multi_user': False})
Plan.objects.update_or_create(id=2, defaults={'name': 'pro', 'max_queries': 10000, 'can_export': True, 'is_multi_user': False})
Plan.objects.update_or_create(id=3, defaults={'name': 'enterprise', 'max_queries': 99999, 'can_export': True, 'is_multi_user': True})

print("Successfully seeded plans!")
