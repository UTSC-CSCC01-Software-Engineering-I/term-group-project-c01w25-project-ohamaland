import json

from django.core.mail import send_mail
from django.conf import settings
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from .models import Group, GroupMembers, Receipt, Notification, User
from .serializers import ReceiptSerializer


def create_notification(user, notification_type, title, message, data=None):
    """
    Create a notification in the database
    """
    return Notification.objects.create(
        user=user,
        notification_type=notification_type,
        title=title,
        message=message,
        data=json.dumps(data) if data else None,
    )


def notify_group_receipt_added(group_id, receipt_id):
    """
    Send notifications to all group members when a new receipt is added.
    """
    try:
        group = Group.objects.get(id=group_id)
        receipt = Receipt.objects.get(id=receipt_id)
        members = GroupMembers.objects.filter(group=group)
        
        # Serialize the receipt data
        serializer = ReceiptSerializer(receipt)
        receipt_data = serializer.data
        
        # Prepare the notification data
        notification_data = {
            'group_id': group.id,
            'group_name': group.name,
            'receipt_id': receipt.id,
            'merchant': receipt.merchant,
            'total_amount': str(receipt.total_amount),
            'currency': receipt.currency,
            'date': receipt.date.isoformat()
        }
        
        # Send email notifications and store in database
        for member in members:
            user = member.user
            
            # Send email
            send_mail(
                f"New Receipt Added to {group.name} on Catalog",
                f"Dear {user.username},\n\nWe would like to inform you that a new receipt has been added to {group.name} on Catalog. You can view the details of the new receipt within your group's page.\n\nBest,\nCatalog Team",
                settings.EMAIL_HOST_USER,
                [user.email],
                fail_silently=False,
            )
            
            # Create notification in database
            notification = create_notification(
                user=user,
                notification_type='receipt_added',
                title=f"New Receipt in {group.name}",
                message=f"A new receipt from {receipt.merchant} was added to your group {group.name}.",
                data=notification_data
            )
            
            # Send WebSocket notification
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"user_{user.id}_notifications",
                {
                    'type': 'notify_receipt_added',
                    'notification_id': notification.id,
                    'message': notification.message,
                    'data': notification_data
                }
            )
            
    except (Group.DoesNotExist, Receipt.DoesNotExist) as e:
        print(f"Error sending notification: {e}")