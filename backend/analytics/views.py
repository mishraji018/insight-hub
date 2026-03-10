from rest_framework import status, views, viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.utils import timezone
from django.db.models import Sum, Avg

from .models import SalesData, Prediction, MLModel
from .serializers import (
    SalesDataSerializer, PredictionSerializer, 
    AnalyticsSummarySerializer, CSVUploadSerializer
)
from .services.data_processing import extract_from_csv, transform, load_to_db
from .permissions import IsExecutive, IsAnalyst, IsExecutiveOrAnalyst
from predictions.predictor import predict_sales, forecast_week

import os
from django.conf import settings

class UploadCSVView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsExecutive]
    parser_classes = (permissions.AllowAny,) # Using default parsers, but restriction via code

    def post(self, request, *args, **kwargs):
        serializer = CSVUploadSerializer(data=request.data)
        if serializer.is_valid():
            file_obj = serializer.validated_data['file']
            # Save file temporarily
            tmp_path = os.path.join(settings.BASE_DIR, 'tmp_upload.csv')
            with open(tmp_path, 'wb+') as destination:
                for chunk in file_obj.chunks():
                    destination.write(chunk)
            
            try:
                # Run ETL
                df = extract_from_csv(tmp_path)
                df_clean = transform(df)
                result = load_to_db(df_clean)
                os.remove(tmp_path)
                return Response(result, status=status.HTTP_201_CREATED)
            except Exception as e:
                if os.path.exists(tmp_path):
                    os.remove(tmp_path)
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AnalyticsSummaryView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsExecutiveOrAnalyst]

    def get(self, request):
        # Filter for current month
        today = timezone.now().date()
        start_of_month = today.replace(day=1)
        
        queryset = SalesData.objects.filter(date__gte=start_of_month)
        
        total_revenue = queryset.aggregate(Sum('sales_amount'))['sales_amount__sum'] or 0
        avg_daily = queryset.aggregate(Avg('sales_amount'))['sales_amount__avg'] or 0
        
        # Simple top region logic
        top_region_data = queryset.values('region').annotate(total=Sum('sales_amount')).order_by('-total').first()
        top_region = top_region_data['region'] if top_region_data else "N/A"
        
        # Simple top product
        top_product_data = queryset.values('product_id').annotate(total=Sum('sales_amount')).order_by('-total').first()
        top_product = top_product_data['product_id'] if top_product_data else "N/A"

        data = {
            "total_revenue": total_revenue,
            "predicted_growth": 5.2, # Placeholder logic
            "top_product": top_product,
            "top_region": top_region,
            "avg_daily_sales": round(avg_daily, 2)
        }
        
        return Response(data)

class SalesPredictionView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsExecutiveOrAnalyst]

    def post(self, request):
        input_data = request.data
        try:
            result = predict_sales(input_data)
            
            # Save to Prediction table
            Prediction.objects.create(
                date=pd.to_datetime(input_data.get('date')).date(),
                predicted_sales=result['predicted_sales'],
                confidence_score=result['confidence'],
                model_version="1.0.0", # Simplified
                trend=result['trend']
            )
            
            return Response(result)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class WeeklyForecastView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsExecutiveOrAnalyst]

    def get(self, request):
        start_date = request.query_params.get('start_date', timezone.now().date().strftime('%Y-%m-%d'))
        product_id = request.query_params.get('product_id')
        region = request.query_params.get('region')
        
        try:
            forecast = forecast_week(start_date, product_id, region)
            return Response(forecast)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class PredictionHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsExecutiveOrAnalyst]
    serializer_class = PredictionSerializer
    queryset = Prediction.objects.all()
    
    def get_queryset(self):
        queryset = super().get_queryset()
        model_version = self.request.query_params.get('model_version')
        if model_version:
            queryset = queryset.filter(model_version=model_version)
        return queryset

class ModelTrainingView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def post(self, request):
        # In a real app, this would trigger a Celery task
        # training_task.delay(algorithm=request.data.get('algorithm', 'random_forest'))
        return Response({"task_id": "mock_task_id_123", "status": "queued"})

import pandas as pd
from django.http import FileResponse
from .services.report_generator import generate_pdf_report, generate_excel_report

class ExportPDFReportView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsExecutiveOrAnalyst]

    def get(self, request):
        date_from = request.query_params.get('from', timezone.now().date().strftime('%Y-%m-%d'))
        date_to = request.query_params.get('to', timezone.now().date().strftime('%Y-%m-%d'))
        
        try:
            pdf_buffer = generate_pdf_report(date_from, date_to, request.user.role)
            return FileResponse(pdf_buffer, as_attachment=True, filename=f"sales_report_{date_from}_{date_to}.pdf")
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ExportExcelReportView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsExecutiveOrAnalyst]

    def get(self, request):
        date_from = request.query_params.get('from', timezone.now().date().strftime('%Y-%m-%d'))
        date_to = request.query_params.get('to', timezone.now().date().strftime('%Y-%m-%d'))
        
        try:
            excel_buffer = generate_excel_report(date_from, date_to)
            return FileResponse(excel_buffer, as_attachment=True, filename=f"data_export_{date_from}_{date_to}.xlsx")
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

from django.db import connection
from django.core.cache import cache

class HealthCheckView(views.APIView):
    permission_classes = [permissions.AllowAny] # Publicly accessible for monitor tools

    def get(self, request):
        health = {"status": "ok", "services": {}}
        
        # Check DB
        try:
            connection.ensure_connection()
            health["services"]["db"] = "ok"
        except Exception:
            health["services"]["db"] = "fail"
            health["status"] = "error"

        # Check Redis (via Cache)
        try:
            cache.set("health_check", "ok", timeout=5)
            if cache.get("health_check") == "ok":
                health["services"]["redis"] = "ok"
            else:
                raise Exception
        except Exception:
            health["services"]["redis"] = "fail"
            health["status"] = "error"

        return Response(health, status=status.HTTP_200_OK if health["status"] == "ok" else status.HTTP_503_SERVICE_UNAVAILABLE)
