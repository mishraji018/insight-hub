import os
import django
import sys

# Setup django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')
django.setup()

from users.models import Plan

pro_plan = Plan.objects.get(id=2)
pro_plan.stripe_price_id = 'price_1TntFa8yocwy3DZS54MpPbLf'
pro_plan.save()

print("Successfully updated Pro plan with Stripe Price ID!")
