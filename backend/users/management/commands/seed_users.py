from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds initial administrative user'

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding superadmin...")

        email = "pmishra2084@gmail.com"

        # FIX: Delete mat karo — sirf check karo
        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.WARNING(
                f"Admin {email} already exists — skipping"))
            return

        # FIX: username parameter hata diya
        User.objects.create_superuser(
            email=email,
            first_name="Pranjal",
            last_name="Mishra",
            role="executive",
            is_approved=True,
            password=None   # password=None forces unusable password
        )                   # must set via changepassword command

        self.stdout.write("=" * 50)
        self.stdout.write(self.style.SUCCESS(" ADMIN ACCOUNT READY"))
        self.stdout.write(f" Email: {email}")
        self.stdout.write(self.style.WARNING(
            " Run: python manage.py changepassword " + email))
        self.stdout.write(" to set your password")
        self.stdout.write("=" * 50)