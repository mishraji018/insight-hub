import pytest
from channels.testing import WebsocketCommunicator
from core.asgi import application
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken

User = get_user_model()

@pytest.mark.asyncio
@pytest.mark.django_db
async def test_dashboard_consumer_auth():
    # FIX: username hataya, email add kiya
    user = User.objects.create_user(
        email='ws_user@test.com',
        password='Test@1234',
        role='executive',
        is_approved=True,
    )
    token = str(AccessToken.for_user(user))

    communicator = WebsocketCommunicator(
        application,
        f"ws/dashboard/?token={token}"
    )
    connected, subprotocol = await communicator.connect()
    assert connected

    await communicator.send_json_to({"type": "ping"})
    response = await communicator.receive_json_from()
    assert response["type"] == "pong"

    await communicator.disconnect()

@pytest.mark.asyncio
@pytest.mark.django_db
async def test_dashboard_consumer_unauth():
    communicator = WebsocketCommunicator(
        application, "ws/dashboard/")
    connected, subprotocol = await communicator.connect()
    assert not connected