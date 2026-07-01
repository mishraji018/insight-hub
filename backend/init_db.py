import os
import django
from django.core.management import call_command

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.production')
django.setup()

print("Running migrations...")
call_command('migrate')

from django.contrib.auth import get_user_model
User = get_user_model()

email = 'pmishra2084@gmail.com'
password = 'Pawan@2005'
if not User.objects.filter(email=email).exists():
    User.objects.create_superuser(
        email=email,
        password=password,
        first_name='Admin',
        last_name='User'
    )
    print(f"Superuser {email} created successfully!")
else:
    print(f"Superuser {email} already exists.")
