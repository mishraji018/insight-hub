import os
import pandas as pd
import numpy as np
from celery import shared_task
from django.utils import timezone
from django.conf import settings
from datetime import timedelta

from analytics.models import SalesData, Prediction, MLModel, Anomaly
from analytics.services.data_processing import extract_from_csv, transform, load_to_db
from analytics.services.forecasting import prepare_features, train_model, save_model
from predictions.predictor import predict_sales

# FIX: Double retry conflict hataya
@shared_task(
    bind=True,
    max_retries=5,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=600
)
def process_csv_upload(self, file_path):
    """Async ETL pipeline — autoretry handles retries automatically."""
    df = extract_from_csv(file_path)
    df_clean = transform(df)
    result = load_to_db(df_clean)

    if os.path.exists(file_path):
        os.remove(file_path)

    recalculate_predictions.delay()
    retrain_model_if_needed.delay()

    return result

@shared_task(autoretry_for=(Exception,), max_retries=3, retry_backoff=True)
def retrain_model_if_needed():
    """Weekly task to check data growth and retrain model."""
    last_model = MLModel.objects.order_by('-trained_at').first()
    
    # Check if we have significant new data
    if last_model:
        new_records = SalesData.objects.filter(created_at__gt=last_model.trained_at).count()
    else:
        new_records = SalesData.objects.count()
        
    if new_records > 100 or not last_model:
        # Pull all data for training
        queryset = SalesData.objects.all().values()
        df = pd.DataFrame(list(queryset))
        
        if len(df) < 50: # Minimum data threshold
            return "Not enough data to train"
            
        # ML Pipeline
        X, y = prepare_features(df)
        results = train_model(X, y, algorithm="random_forest")
        
        # Save new version
        new_version = f"v{timezone.now().strftime('%Y%m%d%H%M')}"
        save_model(results['model'], new_version, "random_forest", results)
        
        return f"Retrained model version {new_version}"
    
    return "No retraining needed"

@shared_task(autoretry_for=(Exception,), max_retries=3, retry_backoff=True)
def recalculate_predictions():
    """Batch inference for the last 30 days of data."""
    # Logic to refresh predictions table based on latest historical data
    # (Placeholder for broadcast signal)
    print("Recalculated batch predictions and sending WebSocket signal...")
    return True

@shared_task(autoretry_for=(Exception,), max_retries=3, retry_backoff=True)
def detect_anomalies():
    """Daily IQR-based anomaly detection on the last 7 days of sales."""
    seven_days_ago = timezone.now().date() - timedelta(days=7)
    queryset = SalesData.objects.filter(date__gte=seven_days_ago).values()
    df = pd.DataFrame(list(queryset))
    
    if df.empty:
        return "No data for anomaly detection"
        
    anomalies_found = 0
    
    # Simple IQR per region
    for region in df['region'].unique():
        region_df = df[df['region'] == region]
        q1 = region_df['sales_amount'].quantile(0.25)
        q3 = region_df['sales_amount'].quantile(0.75)
        iqr = q3 - q1
        
        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr
        
        outliers = region_df[(region_df['sales_amount'] < lower_bound) | (region_df['sales_amount'] > upper_bound)]
        
        for _, row in outliers.iterrows():
            # Avoid duplicate anomaly reports
            if not Anomaly.objects.filter(date=row['date'], product_id=row['product_id'], region=region).exists():
                Anomaly.objects.create(
                    date=row['date'],
                    product_id=row['product_id'],
                    region=region,
                    sales_amount=row['sales_amount'],
                    description=f"Sales outlier detected in {region}: {row['sales_amount']} is outside bounds [{lower_bound}, {upper_bound}]",
                    severity='high' if row['sales_amount'] > upper_bound * 2 else 'medium'
                )
                anomalies_found += 1
                
    return f"Detected and logged {anomalies_found} anomalies"
