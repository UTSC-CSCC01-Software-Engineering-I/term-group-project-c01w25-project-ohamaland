import json
import datetime

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


def send_notification(user, notification_type, title, message, data=None, send_email=False):
    """
    General function to send notifications through all channels (database, websocket, email)
    """
    # Create notification in database
    notification = create_notification(
        user=user,
        notification_type=notification_type,
        title=title,
        message=message,
        data=data
    )
    
    # Send WebSocket notification
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"user_{user.id}_notifications",
        {
            'type': 'send_notification',
            'notification_id': notification.id,
            'notification_type': notification_type,
            'title': title,
            'message': message,
            'data': data
        }
    )
    
    # Send email if required
    if send_email and user.email:
        send_mail(
            title,
            message,
            settings.EMAIL_HOST_USER,
            [user.email],
            fail_silently=False,
        )
    
    return notification


def send_group_notification(group_id, notification_type, title, message, send_mail, data=None, excluded_user_ids=None):
    """
    Send notifications to all members of a group except excluded users
    """
    try:
        group = Group.objects.get(id=group_id)
        members = GroupMembers.objects.filter(group=group)
        
        notifications = []
        
        for member in members:
            user = member.user
            
            # Skip excluded users if provided
            if user.id in excluded_user_ids:
                continue
                
            # Send notification to this user
            notification = send_notification(
                user=user,
                notification_type=notification_type,
                title=title,
                message=message,
                send_email=send_mail,
                data=data
            )
            
            notifications.append(notification)
            
        return notifications
            
    except Group.DoesNotExist:
        print(f"Error sending group notification: Group with ID {group_id} does not exist")
        return []


def notify_group_receipt_added(group_id, receipt_id, user_id, send_mail):
    """
    Send notifications to all group members when a new receipt is added.
    """
    try:
        group = Group.objects.get(id=group_id)
        receipt = Receipt.objects.get(id=receipt_id)
        
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
        
        # Send notification to all group members
        return send_group_notification(
            group_id=group.id,
            notification_type='group_receipt_added',
            title=f"New Receipt in {group.name}",
            message=f"A new receipt from {receipt.merchant} was added to your group {group.name}.",
            send_mail=send_mail,
            data=notification_data,
            excluded_user_ids=[user_id]
        )
            
    except (Group.DoesNotExist, Receipt.DoesNotExist) as e:
        print(f"Error sending notification: {e}")
        return []

# NOT USED CURRENTLY MAYBE IN THE FUTURE
def notify_user_added_to_group(group_id, user_id):
    """
    Send notifications to all group members when a new user is added.
    """
    try:
        group = Group.objects.get(id=group_id)
        new_user = User.objects.get(id=user_id)
        
        # Prepare the notification data
        notification_data = {
            'group_id': group.id,
            'group_name': group.name,
            'user_id': new_user.id,
            'username': new_user.username
        }
        
        # Send notification to all group members except the newly added user
        return send_group_notification(
            group_id=group.id,
            notification_type='user_added',
            title=f"New Member in {group.name}",
            message=f"{new_user.username} has joined your group {group.name}.",
            data=notification_data,
            excluded_user_ids=[user_id]  # Don't notify the newly added user
        )
            
    except (Group.DoesNotExist, User.DoesNotExist) as e:
        print(f"Error sending notification: {e}")
        return []


# NOT USED CURRENTLY MAYBE IN THE FUTURE
def notify_group_settings_changed(group_id, changed_by_user_id, admin_ids=None):
    """
    Send notifications to all non-admin group members when group settings are changed.
    """
    try:
        group = Group.objects.get(id=group_id)
        changed_by = User.objects.get(id=changed_by_user_id)
        
        # List of users to exclude (the user who made the change and optionally all admins)
        excluded_user_ids = [changed_by_user_id]
        
        # If admin_ids is provided, exclude all admin users from notification
        if admin_ids:
            for admin_id in admin_ids:
                if admin_id != changed_by_user_id:  # Avoid adding the same user twice
                    excluded_user_ids.append(admin_id)
        
        # Prepare the notification data
        notification_data = {
            'group_id': group.id,
            'group_name': group.name,
            'changed_by_id': changed_by.id,
            'changed_by_name': changed_by.username,
            'timestamp': datetime.datetime.now().isoformat()
        }
        
        # Send notification to all group members except excluded users
        return send_group_notification(
            group_id=group.id,
            notification_type='group_settings_changed',
            title=f"Group Settings Updated",
            message=f"{changed_by.username} has updated settings for {group.name}.",
            data=notification_data,
            excluded_user_ids=excluded_user_ids
        )
            
    except (Group.DoesNotExist, User.DoesNotExist) as e:
        print(f"Error sending notification: {e}")
        return []