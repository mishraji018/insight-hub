from django.contrib import admin
from .models import SalesData, Prediction, MLModel, Anomaly

@admin.register(SalesData)
class SalesDataAdmin(admin.ModelAdmin):
    list_display = ('date', 'product_id', 'region', 'sales_amount', 'customers')
    list_filter = ('region', 'date')
    search_fields = ('product_id', 'region')
    date_hierarchy = 'date'

@admin.register(Prediction)
class PredictionAdmin(admin.ModelAdmin):
    list_display = ('date', 'predicted_sales', 'confidence_score', 'trend', 'model_version')
    list_filter = ('trend', 'date', 'model_version')
    search_fields = ('model_version',)
    date_hierarchy = 'date'

@admin.register(MLModel)
class MLModelAdmin(admin.ModelAdmin):
    list_display = ('algorithm', 'version', 'trained_at', 'accuracy_score', 'is_active')
    list_filter = ('is_active', 'algorithm')
    search_fields = ('version', 'algorithm')
    ordering = ('-trained_at',)

@admin.register(Anomaly)
class AnomalyAdmin(admin.ModelAdmin):
    list_display = ('date', 'product_id', 'region', 'sales_amount', 'severity', 'created_at')
    list_filter = ('severity', 'region', 'date')
    search_fields = ('product_id', 'description')
    readonly_fields = ('created_at',)
    date_hierarchy = 'date'
