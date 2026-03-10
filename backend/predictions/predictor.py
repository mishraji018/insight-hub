import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from analytics.services.forecasting import load_active_model, get_season

def predict_sales(input_data: dict) -> dict:
    """Performs a single sales prediction."""
    model = load_active_model()
    
    # Prepare input vector (must match training feature order)
    # Expected inputs: date, marketing_spend, sales_last_week, sales_last_month
    date = pd.to_datetime(input_data.get('date', datetime.now()))
    month = date.month
    day_of_week = date.dayofweek
    season = get_season(month)
    
    # Create DF for encoding consistency
    df_in = pd.DataFrame([{
        'day_of_week': day_of_week,
        'month': month,
        'marketing_spend': input_data.get('marketing_spend', 0),
        'sales_last_week': input_data.get('sales_last_week', 0),
        'sales_last_month': input_data.get('sales_last_month', 0),
        'season': season
    }])
    
    # One-hot encoding (matching training logic)
    for s in ['spring', 'summer', 'autumn', 'winter']:
        df_in[f'season_{s}'] = 1 if season == s else 0
        
    feature_cols = [
        'day_of_week', 'month', 'marketing_spend', 
        'sales_last_week', 'sales_last_month',
        'season_spring', 'season_summer', 'season_autumn', 'season_winter'
    ]
    
    X = df_in[feature_cols]
    prediction = model.predict(X)[0]
    
    return {
        "predicted_sales": float(round(prediction, 2)),
        "confidence": 0.85, # Mock confidence for now
        "trend": "increasing" if prediction > input_data.get('sales_last_week', 0) else "decreasing"
    }

def forecast_week(start_date: str, product_id: str, region: str) -> list[dict]:
    """Generates a 7-day rolling forecast."""
    # This is a simplified version; a real one would need historical lags for each rolling day
    current_date = pd.to_datetime(start_date)
    forecasts = []
    
    for i in range(7):
        target_date = current_date + timedelta(days=i)
        
        # Simplified prediction (in reality, lags would update based on previous predictions)
        pred = predict_sales({
            "date": target_date,
            "marketing_spend": 50.0, # Placeholder
            "sales_last_week": 100.0, # Placeholder
            "sales_last_month": 400.0  # Placeholder
        })
        
        forecasts.append({
            "date": target_date.strftime('%Y-%m-%d'),
            "predicted_sales": pred["predicted_sales"],
            "confidence": pred["confidence"]
        })
        
    return forecasts
