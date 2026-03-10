import pandas as pd
import numpy as np
from django.core.exceptions import ValidationError
from analytics.models import SalesData

def extract_from_csv(file_path: str) -> pd.DataFrame:
    """Reads a CSV file and validates required columns."""
    required_columns = [
        'date', 'product_id', 'region', 'sales_amount', 
        'customers', 'marketing_spend'
    ]
    
    try:
        df = pd.read_csv(file_path)
    except Exception as e:
        raise ValidationError(f"Error reading CSV file: {str(e)}")
        
    missing_cols = [col for col in required_columns if col not in df.columns]
    if missing_cols:
        raise ValidationError(f"Missing required columns: {', '.join(missing_cols)}")
        
    return df

def get_season(month):
    if month in [12, 1, 2]:
        return 'winter'
    elif month in [3, 4, 5]:
        return 'spring'
    elif month in [6, 7, 8]:
        return 'summer'
    else:
        return 'autumn'

def transform(df: pd.DataFrame) -> pd.DataFrame:
    """Cleans data and performs feature engineering."""
    # Drop rows with null or negative sales
    df = df[df['sales_amount'] > 0].copy()
    
    # Parse date
    df['date'] = pd.to_datetime(df['date'])
    
    # Time-based features
    df['day_of_week'] = df['date'].dt.dayofweek
    df['month'] = df['date'].dt.month
    df['season'] = df['month'].apply(get_season)
    
    # Lag features
    df = df.sort_values(['product_id', 'date'])
    df['sales_last_week'] = df.groupby('product_id')['sales_amount'].shift(7)
    df['sales_last_month'] = df.groupby('product_id')['sales_amount'].shift(30)
    
    # Ratio features
    df['marketing_to_sales_ratio'] = df['marketing_spend'] / df['sales_amount']
    
    # Fill NaN engineered features
    engineered_cols = ['sales_last_week', 'sales_last_month', 'marketing_to_sales_ratio']
    df[engineered_cols] = df[engineered_cols].fillna(0)
    
    return df

def load_to_db(df: pd.DataFrame) -> dict:
    """Bulk inserts data skipping existing records."""
    inserted = 0
    skipped = 0
    errors = []
    
    records_to_create = []
    
    # To handle duplicates properly, we check existing combinations
    # In a real heavy ETL, this might need optimization (e.g. temporary table merge)
    for _, row in df.iterrows():
        try:
            # Check for existing record
            exists = SalesData.objects.filter(
                date=row['date'].date(),
                product_id=row['product_id'],
                region=row['region']
            ).exists()
            
            if exists:
                skipped += 1
                continue
                
            records_to_create.append(SalesData(
                date=row['date'],
                product_id=row['product_id'],
                region=row['region'],
                sales_amount=row['sales_amount'],
                customers=row['customers'],
                marketing_spend=row['marketing_spend']
            ))
            
            inserted += 1
            
            # Batch creation for efficiency
            if len(records_to_create) >= 500:
                SalesData.objects.bulk_create(records_to_create)
                records_to_create = []
                
        except Exception as e:
            errors.append(f"Row error: {str(e)}")
            
    # Final batch
    if records_to_create:
        SalesData.objects.bulk_create(records_to_create)
        
    return {"inserted": inserted, "skipped": skipped, "errors": errors}
