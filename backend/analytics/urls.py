from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UploadCSVView, AnalyticsSummaryView, SalesPredictionView, 
    WeeklyForecastView, PredictionHistoryViewSet, ModelTrainingView
)

router = DefaultRouter()
router.register(r'predictions/history', PredictionHistoryViewSet, basename='prediction-history')

urlpatterns = [
    path('upload-csv/', UploadCSVView.as_view(), name='upload-csv'),
    path('analytics-summary/', AnalyticsSummaryView.as_view(), name='analytics-summary'),
    path('predict-sales/', SalesPredictionView.as_view(), name='predict-sales'),
    path('forecast-week/', WeeklyForecastView.as_view(), name='forecast-week'),
    path('train-model/', ModelTrainingView.as_view(), name='train-model'),
    path('reports/pdf/', ExportPDFReportView.as_view(), name='export-pdf'),
    path('reports/excel/', ExportExcelReportView.as_view(), name='export-excel'),
    # FIXED: System monitoring endpoint
    path('health/', HealthCheckView.as_view(), name='health-check'),
    path('', include(router.urls)),
]
