import os
import joblib
import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn import metrics
try:
    import xgboost as xgb
except ImportError:
    xgb = None

from django.conf import settings
from analytics.models import MLModel
from .exceptions import ModelNotAvailableError

def prepare_features(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.Series]:
    """Prepares features for ML training."""
    # Ensure date-based features exist (from ETL)
    # Required: day_of_week, month, season, marketing_spend, sales_last_week, sales_last_month
    
    # One-hot encode 'season'
    df_encoded = pd.get_dummies(df, columns=['season'], prefix='season')
    
    # Ensure all seasons are present if possible, or fill missing with 0
    for s in ['spring', 'summer', 'autumn', 'winter']:
        col = f'season_{s}'
        if col not in df_encoded.columns:
            df_encoded[col] = 0
            
    feature_cols = [
        'day_of_week', 'month', 'marketing_spend', 
        'sales_last_week', 'sales_last_month',
        'season_spring', 'season_summer', 'season_autumn', 'season_winter'
    ]
    
    X = df_encoded[feature_cols]
    y = df_encoded['sales_amount']
    
    return X, y

def train_model(X, y, algorithm="random_forest") -> dict:
    """Trains a model using requested algorithm."""
    # Time-series safe split (no shuffle)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)
    
    if algorithm == "linear_regression":
        model = LinearRegression()
    elif algorithm == "xgboost":
        if xgb is None:
            raise ImportError("xgboost is not installed. Please use linear_regression or random_forest.")
        model = xgb.XGBRegressor(n_estimators=100, learning_rate=0.1)
    else:  # random_forest default
        model = RandomForestRegressor(n_estimators=100)
        
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    
    return {
        "model": model,
        "r2_score": metrics.r2_score(y_test, y_pred),
        "rmse": np.sqrt(metrics.mean_squared_error(y_test, y_pred)),
        "mae": metrics.mean_absolute_error(y_test, y_pred)
    }

def save_model(model, version: str, algorithm: str, metrics: dict) -> MLModel:
    """Saves serialized model and creates DB record."""
    model_dir = os.path.join(settings.BASE_DIR, 'ml_models')
    if not os.path.exists(model_dir):
        os.makedirs(model_dir)
        
    file_name = f"{version}.pkl"
    file_path = os.path.join(model_dir, file_name)
    
    # Save to file
    joblib.dump(model, file_path)
    
    # Create DB record
    ml_model = MLModel.objects.create(
        version=version,
        algorithm=algorithm,
        trained_at=datetime.now(),
        accuracy_score=metrics.get('r2_score', 0),
        file_path=file_path,
        is_active=False # Should be activated explicitly
    )
    
    return ml_model

def load_active_model():
    """Fetches and loads the active MLModel."""
    ml_model_rec = MLModel.objects.filter(is_active=True).first()
    if not ml_model_rec:
        raise ModelNotAvailableError("No active ML model found in database.")
        
    if not os.path.exists(ml_model_rec.file_path):
        # FIXED: Added logging and granular error handling for missing artifacts
        import logging
        logging.error(f"Model file missing: {ml_model_rec.file_path}")
        raise ModelNotAvailableError(f"Model file not found at {ml_model_rec.file_path}")
        
    try:
        return joblib.load(ml_model_rec.file_path)
    except Exception as e:
        logging.error(f"Failed to load model file: {str(e)}")
        raise ModelNotAvailableError(f"Corrupt or incompatible model file: {str(e)}")
