import json

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

from .models import Notification
from .serializers import NotificationSerializer


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]

        if self.user.is_anonymous:
            await self.close()
            return

        self.user_group_name = f"user_{self.user.id}_notifications"
        await self.channel_layer.group_add(self.user_group_name, self.channel_name)
        await self.accept()
        await self.send_stored_notifications()

    async def disconnect(self, close_code):
        # Remove this channel from the user's notification group
        if hasattr(self, "user") and not self.user.is_anonymous:
            await self.channel_layer.group_discard(
                self.user_group_name, self.channel_name
            )

    async def receive(self, text_data):
        """Handle incoming messages from the client"""
        try:
            data = json.loads(text_data)
            action = data.get("action")

            if action == "dismiss_notification":
                notification_id = data.get("notification_id")
                if notification_id:
                    success = await self.dismiss_notification(notification_id)
                    await self.send(
                        text_data=json.dumps(
                            {
                                "type": "dismiss_response",
                                "notification_id": notification_id,
                                "success": success,
                            }
                        )
                    )

            elif action == "mark_read":
                notification_id = data.get("notification_id")
                if notification_id:
                    success = await self.mark_notification_read(notification_id)
                    await self.send(
                        text_data=json.dumps(
                            {
                                "type": "mark_read_response",
                                "notification_id": notification_id,
                                "success": success,
                            }
                        )
                    )

        except json.JSONDecodeError:
            pass

    @database_sync_to_async
    def get_stored_notifications(self):
        """Get all unread and undismissed notifications for the current user"""
        notifications = Notification.objects.filter(
            user=self.user, is_dismissed=False
        ).order_by("-created_at")

        serialized_notifications = NotificationSerializer(notifications, many=True).data

        # Process each notification to make format consistent with real-time notifications
        for notification in serialized_notifications:
            # Change 'id' to 'notification_id' for consistency
            if "id" in notification:
                notification["notification_id"] = notification["id"]
                del notification["id"]

            # Parse JSON string data to make it consistent with real-time notifications
            if notification.get("data") and isinstance(notification["data"], str):
                try:
                    notification["data"] = json.loads(notification["data"])
                except json.JSONDecodeError:
                    # If it's not valid JSON, keep as is
                    pass

        return serialized_notifications

    @database_sync_to_async
    def dismiss_notification(self, notification_id):
        """Mark a notification as dismissed"""
        try:
            notification = Notification.objects.get(id=notification_id, user=self.user)
            notification.is_dismissed = True
            notification.save()
            return True
        except Notification.DoesNotExist:
            return False

    @database_sync_to_async
    def mark_notification_read(self, notification_id):
        """Mark a notification as read"""
        try:
            notification = Notification.objects.get(id=notification_id, user=self.user)
            notification.is_read = True
            notification.save()
            return True
        except Notification.DoesNotExist:
            return False

    async def send_stored_notifications(self):
        """Send all unread and undismissed notifications to the client"""
        notifications = await self.get_stored_notifications()

        if notifications:
            await self.send(
                text_data=json.dumps(
                    {"type": "stored_notifications", "notifications": notifications}
                )
            )

    # General handler for all notification types
    async def send_notification(self, event):
        """
        Send any notification to the connected client.
        This generalizes notification handling instead of having
        specific methods for each notification type.
        """
        # Extract the data from the event
        notification_type = event.get("notification_type")
        title = event.get("title")
        message = event.get("message")
        data = event.get("data")
        notification_id = event.get("notification_id")

        # Send the notification to the connected client
        await self.send(
            text_data=json.dumps(
                {
                    "type": "notification",
                    "notification_type": notification_type,
                    "notification_id": notification_id,
                    "title": title,
                    "message": message,
                    "data": data,
                }
            )
        )
