from rest_framework import serializers
from .models import SalesData, Prediction, MLModel

class SalesDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesData
        fields = '__all__'
        read_only_fields = ['created_at']

class PredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prediction
        fields = '__all__'
        read_only_fields = ['created_at']

class AnalyticsSummarySerializer(serializers.Serializer):
    total_revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    predicted_growth = serializers.FloatField()
    top_product = serializers.CharField(max_length=100)
    top_region = serializers.CharField(max_length=100)
    avg_daily_sales = serializers.DecimalField(max_digits=12, decimal_places=2)

class CSVUploadSerializer(serializers.Serializer):
    file = serializers.FileField()

    def validate_file(self, value):
        if not value.name.endswith('.csv'):
            raise serializers.ValidationError("File must be a CSV.")
        return value
