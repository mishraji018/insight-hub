# ============================================
# ALL IMPORTS AT TOP — FIXED
# ============================================
import os
import pandas as pd

from django.conf import settings
from django.db import connection
from django.core.cache import cache
from django.http import FileResponse
from django.utils import timezone
from django.db.models import Sum, Avg

from rest_framework import status, views, viewsets, permissions
from rest_framework.response import Response

from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import SalesData, Prediction, MLModel
from .serializers import (
    SalesDataSerializer,
    PredictionSerializer,
    AnalyticsSummarySerializer,
    CSVUploadSerializer,
)
from .services.data_processing import extract_from_csv, transform, load_to_db
from .services.report_generator import generate_pdf_report, generate_excel_report
from .permissions import IsExecutive, IsAnalyst, IsExecutiveOrAnalyst
from predictions.predictor import predict_sales, forecast_week

# ============================================
# VIEWS
# ============================================

class UploadCSVView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsExecutive]

    def post(self, request, *args, **kwargs):
        serializer = CSVUploadSerializer(data=request.data)
        if serializer.is_valid():
            file_obj = serializer.validated_data['file']
            tmp_path = os.path.join(settings.BASE_DIR, 'tmp_upload.csv')
            with open(tmp_path, 'wb+') as destination:
                for chunk in file_obj.chunks():
                    destination.write(chunk)
            try:
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
        today = timezone.now().date()
        start_of_month = today.replace(day=1)
        queryset = SalesData.objects.filter(date__gte=start_of_month)

        total_revenue = queryset.aggregate(Sum('sales_amount'))['sales_amount__sum'] or 0
        avg_daily = queryset.aggregate(Avg('sales_amount'))['sales_amount__avg'] or 0

        top_region_data = queryset.values('region').annotate(
            total=Sum('sales_amount')).order_by('-total').first()
        top_region = top_region_data['region'] if top_region_data else "N/A"

        top_product_data = queryset.values('product_id').annotate(
            total=Sum('sales_amount')).order_by('-total').first()
        top_product = top_product_data['product_id'] if top_product_data else "N/A"

        return Response({
            "total_revenue": total_revenue,
            "predicted_growth": 5.2,
            "top_product": top_product,
            "top_region": top_region,
            "avg_daily_sales": round(float(avg_daily), 2),
        })


class SalesPredictionView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsExecutiveOrAnalyst]

    def post(self, request):
        user = request.user
        plan = user.subscription_plan
        limit = plan.max_queries if plan else 100

        if user.query_usage_count >= limit:
            return Response(
                {"error": "Monthly query limit reached. Please upgrade your plan."},
                status=status.HTTP_403_FORBIDDEN
            )

        input_data = request.data
        try:
            result = predict_sales(input_data)
            Prediction.objects.create(
                date=pd.to_datetime(input_data.get('date')).date(),
                predicted_sales=result['predicted_sales'],
                confidence_score=result['confidence'],
                model_version="1.0.0",
                trend=result['trend'],
            )
            # Increment usage
            user.query_usage_count += 1
            user.save()
            
            return Response(result)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class WeeklyForecastView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsExecutiveOrAnalyst]

    def get(self, request):
        user = request.user
        plan = user.subscription_plan
        limit = plan.max_queries if plan else 100

        if user.query_usage_count >= limit:
            return Response(
                {"error": "Monthly query limit reached. Please upgrade your plan."},
                status=status.HTTP_403_FORBIDDEN
            )

        start_date = request.query_params.get(
            'start_date', timezone.now().date().strftime('%Y-%m-%d'))
        product_id = request.query_params.get('product_id')
        region = request.query_params.get('region')
        try:
            forecast = forecast_week(start_date, product_id, region)
            
            # Increment usage
            user.query_usage_count += 1
            user.save()

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
        return Response({"task_id": "mock_task_id_123", "status": "queued"})


class ExportPDFReportView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsExecutiveOrAnalyst]

    def get(self, request):
        user = request.user
        plan = user.subscription_plan
        if not plan or not plan.can_export:
            return Response(
                {"error": "PDF export is only available for Pro and Enterprise plans."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        date_from = request.query_params.get(
            'from', timezone.now().date().strftime('%Y-%m-%d'))
        date_to = request.query_params.get(
            'to', timezone.now().date().strftime('%Y-%m-%d'))
        try:
            pdf_buffer = generate_pdf_report(date_from, date_to, user.role)
            return FileResponse(
                pdf_buffer, as_attachment=True,
                filename=f"sales_report_{date_from}_{date_to}.pdf")
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ExportExcelReportView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsExecutiveOrAnalyst]

    def get(self, request):
        user = request.user
        plan = user.subscription_plan
        if not plan or not plan.can_export:
            return Response(
                {"error": "Excel export is only available for Pro and Enterprise plans."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        date_from = request.query_params.get(
            'from', timezone.now().date().strftime('%Y-%m-%d'))
        date_to = request.query_params.get(
            'to', timezone.now().date().strftime('%Y-%m-%d'))
        try:
            excel_buffer = generate_excel_report(date_from, date_to)
            return FileResponse(
                excel_buffer, as_attachment=True,
                filename=f"data_export_{date_from}_{date_to}.xlsx")
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class HealthCheckView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        health = {"status": "ok", "services": {}}

        try:
            connection.ensure_connection()
            health["services"]["db"] = "ok"
        except Exception:
            health["services"]["db"] = "fail"
            health["status"] = "error"

        try:
            cache.set("health_check", "ok", timeout=5)
            if cache.get("health_check") == "ok":
                health["services"]["redis"] = "ok"
            else:
                raise Exception("Cache mismatch")
        except Exception:
            health["services"]["redis"] = "fail"
            health["status"] = "error"

        http_status = status.HTTP_200_OK if health["status"] == "ok" \
            else status.HTTP_503_SERVICE_UNAVAILABLE
        return Response(health, status=http_status)