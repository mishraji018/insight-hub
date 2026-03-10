import json
from channels.generic.websocket import AsyncWebsocketConsumer
from urllib.parse import parse_qs
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model

User = get_user_model()

class DashboardConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Authenticate via JWT query param
        query_string = self.scope.get('query_string', b'').decode()
        params = parse_qs(query_string)
        token = params.get('token', [None])[0]
        
        self.user = AnonymousUser()
        if token:
            try:
                access_token = AccessToken(token)
                user_id = access_token['user_id']
                self.user = await self.get_user(user_id)
            except Exception:
                pass

        if self.user.is_authenticated:
            self.role_group = f"dashboard_{self.user.role}"
            # Join role group
            await self.channel_layer.group_add(
                self.role_group,
                self.channel_name
            )
            await self.accept()
        else:
            await self.close()

    async def disconnect(self, close_code):
        if hasattr(self, 'role_group'):
            await self.channel_layer.group_discard(
                self.role_group,
                self.channel_name
            )

    async def receive(self, text_data):
        data = json.loads(text_data)
        if data.get('type') == 'ping':
            await self.send(text_data=json.dumps({'type': 'pong'}))

    # Broadcast handlers
    async def prediction_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'prediction.update',
            'data': event['data']
        }))

    async def anomaly_alert(self, event):
        await self.send(text_data=json.dumps({
            'type': 'anomaly.alert',
            'data': event['data']
        }))

    async def kpi_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'kpi.update',
            'data': event['data']
        }))

    @staticmethod
    async def get_user(user_id):
        try:
            from channels.db import database_sync_to_async
            return await database_sync_to_async(User.objects.get)(id=user_id)
        except User.DoesNotExist:
            return AnonymousUser()
