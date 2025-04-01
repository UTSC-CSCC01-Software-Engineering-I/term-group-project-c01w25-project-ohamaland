from django.core.management.base import BaseCommand
from api.notifications import send_subscription_notifications

class Command(BaseCommand):
    help = 'Sends notifications for subscriptions due tomorrow'

    def handle(self, *args, **options):
        count = send_subscription_notifications()
        self.stdout.write(self.style.SUCCESS(f'Successfully sent {count} subscription reminders'))