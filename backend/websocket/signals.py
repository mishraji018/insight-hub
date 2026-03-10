from django.db.models.signals import post_save
from django.dispatch import receiver
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from analytics.models import Prediction, Anomaly
from analytics.serializers import PredictionSerializer

@receiver(post_save, sender=Prediction)
def broadcast_prediction(sender, instance, created, **kwargs):
    if created:
        channel_layer = get_channel_layer()
        data = PredictionSerializer(instance).data
        
        # Broadcast to both roles
        for role in ['executive', 'analyst', 'manager']:
            async_to_sync(channel_layer.group_send)(
                f"dashboard_{role}",
                {
                    "type": "prediction_update",
                    "data": data
                }
            )

@receiver(post_save, sender=Anomaly)
def broadcast_anomaly(sender, instance, created, **kwargs):
    if created:
        channel_layer = get_channel_layer()
        data = {
            "id": instance.id,
            "severity": instance.severity,
            "description": instance.description,
            "date": str(instance.date)
        }
        
        # Anomalies go primarily to executives and managers
        for role in ['executive', 'manager']:
            async_to_sync(channel_layer.group_send)(
                f"dashboard_{role}",
                {
                    "type": "anomaly_alert",
                    "data": data
                }
            )
