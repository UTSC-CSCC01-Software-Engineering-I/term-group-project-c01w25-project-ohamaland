import os
import subprocess

from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Runs the Daphne server for ASGI application'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting Daphne server...'))
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
        command = ['daphne', 'core.asgi:application', '-p', '8080']
        subprocess.run(command)