import random
from datetime import timedelta
from django.utils import timezone
from analytics.models import SalesData, Prediction, Anomaly

def run():
    print("Deleting old data...")
    SalesData.objects.all().delete()
    Prediction.objects.all().delete()
    Anomaly.objects.all().delete()

    print("Generating new seed data...")
    today = timezone.now().date()
    regions = ["North", "South", "East", "West"]
    products = ["PROD-1001", "PROD-1002", "PROD-1003", "PROD-1004"]

    # Generate 60 days of sales data
    sales_objects = []
    for i in range(60):
        current_date = today - timedelta(days=60 - i)
        for _ in range(random.randint(5, 15)):
            sales_objects.append(SalesData(
                date=current_date,
                product_id=random.choice(products),
                region=random.choice(regions),
                sales_amount=round(random.uniform(500, 5000), 2),
                customers=random.randint(10, 100),
                marketing_spend=round(random.uniform(100, 1000), 2)
            ))
    SalesData.objects.bulk_create(sales_objects)

    # Generate predictions for the next 7 days
    pred_objects = []
    for i in range(1, 8):
        current_date = today + timedelta(days=i)
        pred_objects.append(Prediction(
            date=current_date,
            predicted_sales=round(random.uniform(3000, 8000), 2),
            confidence_score=round(random.uniform(0.7, 0.95), 2),
            model_version="1.0.0",
            trend=random.choice(['increasing', 'decreasing', 'stable'])
        ))
    Prediction.objects.bulk_create(pred_objects)

    # Generate some anomalies
    anomaly_objects = []
    for i in range(3):
        current_date = today - timedelta(days=random.randint(1, 30))
        anomaly_objects.append(Anomaly(
            date=current_date,
            product_id=random.choice(products),
            region=random.choice(regions),
            sales_amount=round(random.uniform(8000, 12000), 2),  # Unusually high
            description="Unusually high sales volume detected compared to historical average.",
            severity=random.choice(['low', 'medium', 'high'])
        ))
    Anomaly.objects.bulk_create(anomaly_objects)

    print("Seed data generated successfully!")

if __name__ == '__main__':
    run()
