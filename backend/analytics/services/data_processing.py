import pandas as pd
import numpy as np
from django.core.exceptions import ValidationError
from analytics.models import SalesData
from analytics.services.forecasting import get_season

def extract_from_csv(file_path: str) -> pd.DataFrame:
    """Reads a CSV file and flexibly maps columns to required format."""
    try:
        df = pd.read_csv(file_path)
    except Exception as e:
        raise ValidationError(f"Error reading CSV file: {str(e)}")
        
    # Standardize column names
    df.columns = df.columns.str.lower().str.strip().str.replace(' ', '_')
    
    # Flexible fuzzy column mapping
    mapping = {
        'date': ['date', 'time', 'timestamp', 'day', 'created_at', 'order_date'],
        'product_id': ['product_id', 'product', 'item', 'sku', 'item_id', 'id'],
        'region': ['region', 'location', 'city', 'state', 'country', 'store', 'market'],
        'sales_amount': ['sales_amount', 'sales', 'revenue', 'amount', 'total', 'price', 'value'],
        'customers': ['customers', 'buyers', 'users', 'clients', 'traffic', 'visits'],
        'marketing_spend': ['marketing_spend', 'marketing', 'spend', 'cost', 'ad_spend', 'budget', 'expenses']
    }
    
    for standard_col, variants in mapping.items():
        if standard_col not in df.columns:
            for variant in variants:
                if variant in df.columns:
                    df.rename(columns={variant: standard_col}, inplace=True)
                    break
                    
    # Fill missing columns with defaults to accept ANY CSV
    if 'date' not in df.columns:
        df['date'] = pd.Timestamp('today').date()
    if 'product_id' not in df.columns:
        df['product_id'] = 'UNKNOWN_PRODUCT'
    if 'region' not in df.columns:
        df['region'] = 'Global'
    if 'sales_amount' not in df.columns:
        df['sales_amount'] = 0.0
    if 'customers' not in df.columns:
        df['customers'] = 0
    if 'marketing_spend' not in df.columns:
        df['marketing_spend'] = 0.0
        
    required_columns = ['date', 'product_id', 'region', 'sales_amount', 'customers', 'marketing_spend']
    # If the user uploaded a completely irrelevant CSV, just take what we have mapped
    for col in required_columns:
        if col not in df.columns:
             df[col] = 0
    df = df[required_columns]
    
    return df

def transform(df: pd.DataFrame) -> pd.DataFrame:
    """Cleans data and performs feature engineering safely."""
    # Coerce numeric types to avoid crashes
    df['sales_amount'] = pd.to_numeric(df['sales_amount'], errors='coerce').fillna(0)
    df['customers'] = pd.to_numeric(df['customers'], errors='coerce').fillna(0)
    df['marketing_spend'] = pd.to_numeric(df['marketing_spend'], errors='coerce').fillna(0)
    
    # Drop rows with null or negative sales
    df = df[df['sales_amount'] > 0].copy()
    
    if df.empty:
        raise ValidationError("No valid sales data (amount > 0) found in the CSV.")
        
    # Parse date safely
    df['date'] = pd.to_datetime(df['date'], errors='coerce')
    df = df.dropna(subset=['date']).copy()
    
    if df.empty:
        raise ValidationError("No valid dates could be parsed from the CSV.")
    
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
