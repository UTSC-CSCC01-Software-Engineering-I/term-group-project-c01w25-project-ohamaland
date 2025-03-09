from django.core.mail import send_mail
from django.conf import settings

from .models import Group, GroupMembers


def notify_group_receipt_added(group):
    group = Group.objects.get(id=group)
    members = GroupMembers.objects.filter(group=group)
    for member in members:
        user = member.user
        send_mail(
            f"New Receipt Added to {group.name} on Catalog",
            f"Dear {user.username},\nWe would like to inform you that a \
                new receipt has been added to {group.name} on Catalog. \
                    You can view the details of the new receipt within \
                        your group’s page.",
            settings.EMAIL_HOST_USER,
            [user.email],
            fail_silently=False,
        )
