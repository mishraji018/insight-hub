import pytest
import pandas as pd
import numpy as np
from django.core.exceptions import ValidationError
from analytics.services.data_processing import extract_from_csv, transform, load_to_db
from analytics.models import SalesData
from datetime import datetime, timedelta

@pytest.fixture
def sample_raw_df():
    data = {
        'date': ['2023-01-01', '2023-01-02', '2023-01-03'],
        'product_id': ['P1', 'P1', 'P1'],
        'region': ['North', 'North', 'North'],
        'sales_amount': [100.0, 150.0, -10.0],  # One negative to test cleaning
        'customers': [10, 15, 5],
        'marketing_spend': [20.0, 30.0, 5.0]
    }
    return pd.DataFrame(data)

def test_extract_validation(tmp_path):
    csv_file = tmp_path / "test.csv"
    df = pd.DataFrame({'wrong_col': [1, 2]})
    df.to_csv(csv_file, index=False)
    
    with pytest.raises(ValidationError) as excinfo:
        extract_from_csv(str(csv_file))
    assert "Missing required columns" in str(excinfo.value)

def test_transform_logic(sample_raw_df):
    transformed_df = transform(sample_raw_df)
    
    # Test cleaning (negative sales removed)
    assert len(transformed_df) == 2
    assert (transformed_df['sales_amount'] > 0).all()
    
    # Test date parsing
    assert pd.api.types.is_datetime64_any_dtype(transformed_df['date'])
    
    # Test feature engineering
    assert 'day_of_week' in transformed_df.columns
    assert 'month' in transformed_df.columns
    assert 'season' in transformed_df.columns
    assert 'marketing_to_sales_ratio' in transformed_df.columns
    
    # Check specific value
    first_row = transformed_df.iloc[0]
    assert first_row['marketing_to_sales_ratio'] == (20.0 / 100.0)

@pytest.mark.django_db
def test_load_to_db(sample_raw_df):
    # Prepare clean data
    clean_df = transform(sample_raw_df)
    
    # First load
    result = load_to_db(clean_df)
    assert result['inserted'] == 2
    assert SalesData.objects.count() == 2
    
    # Second load (duplicates)
    result_dup = load_to_db(clean_df)
    assert result_dup['inserted'] == 0
    assert result_dup['skipped'] == 2
    assert SalesData.objects.count() == 2

def test_season_mapping(sample_raw_df):
    # Helper to test month to season logic directly
    df = sample_raw_df.copy()
    df['date'] = pd.to_datetime(['2023-01-01', '2023-04-01', '2023-07-01'])
    df['sales_amount'] = [10, 10, 10] # Ensure they aren't dropped
    
    transformed = transform(df)
    assert transformed.iloc[0]['season'] == 'winter'
    assert transformed.iloc[1]['season'] == 'spring'
    assert transformed.iloc[2]['season'] == 'summer'
