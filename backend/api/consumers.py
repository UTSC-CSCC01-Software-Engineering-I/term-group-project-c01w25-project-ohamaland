import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import GroupMembers

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        
        if self.user.is_anonymous:
            await self.close()
            return
        
        # Create a user-specific group for this connection
        self.user_group_name = f"user_{self.user.id}_notifications"
        
        # Add this channel to the user's notification group
        await self.channel_layer.group_add(
            self.user_group_name,
            self.channel_name
        )
        
        # Accept the connection
        await self.accept()
        
        # Also join groups the user is a member of
        user_groups = await self.get_user_groups(self.user.id)
        for group_id in user_groups:
            group_name = f"group_{group_id}_notifications"
            await self.channel_layer.group_add(
                group_name,
                self.channel_name
            )

    async def disconnect(self, close_code):
        # Remove this channel from the user's notification group
        if hasattr(self, 'user') and not self.user.is_anonymous:
            await self.channel_layer.group_discard(
                self.user_group_name,
                self.channel_name
            )
            
            # Also leave all group notification channels
            user_groups = await self.get_user_groups(self.user.id)
            for group_id in user_groups:
                group_name = f"group_{group_id}_notifications"
                await self.channel_layer.group_discard(
                    group_name,
                    self.channel_name
                )

    async def receive(self, text_data):
        # We don't expect to receive messages from the client
        pass

    @database_sync_to_async
    def get_user_groups(self, user_id):
        # Get all group IDs the user is a member of
        return list(GroupMembers.objects.filter(user_id=user_id).values_list('group_id', flat=True))

    async def notify_receipt_added(self, event):
        # Send the notification to the connected client
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'notification_type': 'receipt_added',
            'message': event['message'],
            'data': event['data']
        }))