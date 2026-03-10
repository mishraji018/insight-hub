import random
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from analytics.models import SalesData, Prediction, MLModel
from analytics.services.forecasting import prepare_features, train_model, save_model
import pandas as pd
import numpy as np

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with demo data for local development'

    def handle(self, *args, **options):
        self.stdout.write('Seeding demo data...')

        # 1. Create Users
        self.create_users()

        # 2. Insert 90 days of SalesData
        self.create_sales_data()

        # 3. Train and Save initial model
        self.train_initial_model()

        # 4. Insert 30 Prediction records
        self.create_predictions()

        self.stdout.write(self.style.SUCCESS('Successfully seeded demo data'))

    def create_users(self):
        self.stdout.write('Creating users...')
        users_to_create = [
            ('admin', 'admin@insight-hub.com', 'executive'),
            ('analyst', 'analyst@insight-hub.com', 'analyst'),
            ('manager', 'manager@insight-hub.com', 'manager'),
        ]
        for username, email, role in users_to_create:
            if not User.objects.filter(username=username).exists():
                User.objects.create_superuser(
                    username=username,
                    email=email,
                    password='password123',
                    role=role
                )
                self.stdout.write(f'Created user: {username}')

    def create_sales_data(self):
        self.stdout.write('Creating sales data (90 days)...')
        SalesData.objects.all().delete()
        
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=90)
        
        products = ['PRD-001', 'PRD-002', 'PRD-003']
        regions = ['North', 'South', 'East', 'West']
        
        sales_records = []
        current_date = start_date
        while current_date <= end_date:
            for product in products:
                for region in regions:
                    # Logic to make data somewhat realistic
                    base_sales = 5000 if product == 'PRD-001' else 3000
                    seasonal_factor = 1.2 if current_date.month in [11, 12] else 1.0
                    
                    sales_amount = base_sales * seasonal_factor + random.randint(-500, 1500)
                    marketing_spend = sales_amount * 0.1 + random.randint(50, 200)
                    customers = int(sales_amount / 100) + random.randint(-5, 10)
                    
                    sales_records.append(SalesData(
                        date=current_date,
                        product_id=product,
                        region=region,
                        sales_amount=max(0, sales_amount),
                        customers=max(0, customers),
                        marketing_spend=max(0, marketing_spend)
                    ))
            current_date += timedelta(days=1)
        
        SalesData.objects.bulk_create(sales_records)
        self.stdout.write(f'Created {len(sales_records)} sales records.')

    def train_initial_model(self):
        self.stdout.write('Training initial ML model...')
        MLModel.objects.all().delete()
        
        # Get data for training
        qs = SalesData.objects.all().values()
        df = pd.DataFrame(list(qs))
        
        # Add engineered features (simplified ETL for seeding)
        df['date'] = pd.to_datetime(df['date'])
        df['day_of_week'] = df['date'].dt.dayofweek
        df['month'] = df['date'].dt.month
        
        def get_season(month):
            if month in [3, 4, 5]: return 'spring'
            if month in [6, 7, 8]: return 'summer'
            if month in [9, 10, 11]: return 'autumn'
            return 'winter'
            
        df['season'] = df['month'].apply(get_season)
        
        # Fill missing lags with 0
        df = df.sort_values(['product_id', 'date'])
        df['sales_last_week'] = df.groupby('product_id')['sales_amount'].shift(7).fillna(0)
        df['sales_last_month'] = df.groupby('product_id')['sales_amount'].shift(30).fillna(0)
        
        X, y = prepare_features(df)
        training_results = train_model(X, y, algorithm="linear_regression")
        
        ml_model = save_model(
            model=training_results['model'],
            version='v1.0.0',
            algorithm='linear_regression',
            metrics={'r2_score': training_results['r2_score']}
        )
        
        # Activate the model
        ml_model.is_active = True
        ml_model.save()
        self.stdout.write(f'Created and activated model: {ml_model.version}')

    def create_predictions(self):
        self.stdout.write('Creating prediction history (30 days)...')
        Prediction.objects.all().delete()
        
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=30)
        
        prediction_records = []
        current_date = start_date
        while current_date <= end_date:
            prediction_records.append(Prediction(
                date=current_date,
                predicted_sales=8000 + random.randint(-1000, 2000),
                confidence_score=0.85 + random.uniform(-0.1, 0.1),
                model_version='v1.0.0',
                trend=random.choice(['increasing', 'stable', 'decreasing'])
            ))
            current_date += timedelta(days=1)
            
        Prediction.objects.bulk_create(prediction_records)
        self.stdout.write(f'Created {len(prediction_records)} prediction records.')
