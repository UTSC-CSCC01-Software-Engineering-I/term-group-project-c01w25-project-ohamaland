from django.core.mail import send_mail
from django.conf import settings
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from .models import Group, GroupMembers, Receipt
from .serializers import ReceiptSerializer


def notify_group_receipt_added(group_id, receipt_id):
    """
    Send notifications to all group members when a new receipt is added.
    
    Args:
        group_id: The ID of the group the receipt was added to
        receipt_id: The ID of the receipt that was added
    """
    try:
        group = Group.objects.get(id=group_id)
        receipt = Receipt.objects.get(id=receipt_id)
        members = GroupMembers.objects.filter(group=group)
        
        # Serialize the receipt data
        serializer = ReceiptSerializer(receipt)
        receipt_data = serializer.data
        
        # Send email notifications
        for member in members:
            user = member.user
            send_mail(
                f"New Receipt Added to {group.name} on Catalog",
                f"Dear {user.username},\n\nWe would like to inform you that a new receipt has been added to {group.name} on Catalog. You can view the details of the new receipt within your group's page.\n\nBest,\nCatalog Team",
                settings.EMAIL_HOST_USER,
                [user.email],
                fail_silently=False,
            )
        
        # Send WebSocket notifications
        channel_layer = get_channel_layer()
        
        # Notify the entire group
        group_notification = {
            'type': 'notify_receipt_added',
            'message': f"New receipt from {receipt.merchant} added to {group.name}",
            'data': {
                'group_id': group.id,
                'group_name': group.name,
                'receipt_id': receipt.id,
                'merchant': receipt.merchant,
                'total_amount': str(receipt.total_amount),
                'currency': receipt.currency,
                'date': receipt.date.isoformat()
            }
        }
        
        # Send to the group notification channel
        async_to_sync(channel_layer.group_send)(
            f"group_{group.id}_notifications",
            group_notification
        )
        
        # Also send individual notifications to each user
        for member in members:
            user = member.user
            async_to_sync(channel_layer.group_send)(
                f"user_{user.id}_notifications",
                group_notification
            )
            
    except (Group.DoesNotExist, Receipt.DoesNotExist) as e:
        print(f"Error sending notification: {e}")