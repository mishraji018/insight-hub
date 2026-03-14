from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
from users.models import UserActivity
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings

User = get_user_model()

class Command(BaseCommand):
    help = 'Sends a weekly activity digest email to users'

    def handle(self, *args, **options):
        last_week = timezone.now() - timedelta(days=7)
        users = User.objects.filter(digest_enabled=True, is_active=True, is_email_verified=True)
        
        sent_count = 0
        for user in users:
            activities = UserActivity.objects.filter(
                user=user, 
                visited_at__gte=last_week
            ).order_by('-visited_at')[:10]
            
            context = {
                'user': user,
                'activities': activities,
                'dashboard_url': f"{settings.FRONTEND_URL}/dashboard",
                'profile_url': f"{settings.FRONTEND_URL}/profile",
            }
            
            html_content = render_to_string('users/email_digest.html', context)
            text_content = strip_tags(html_content)
            
            subject = f"Insight Hub - Your Weekly Digest ({timezone.now().strftime('%b %d')})"
            email = EmailMultiAlternatives(
                subject,
                text_content,
                settings.DEFAULT_FROM_EMAIL,
                [user.email]
            )
            email.attach_alternative(html_content, "text/html")
            
            try:
                email.send()
                sent_count += 1
                self.stdout.write(self.style.SUCCESS(f'Successfully sent digest to {user.email}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Failed to send to {user.email}: {str(e)}'))

        self.stdout.write(self.style.SUCCESS(f'Finished sending {sent_count} digests.'))
        
