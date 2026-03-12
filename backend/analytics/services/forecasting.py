import os
import logging
import joblib
import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn import metrics as sklearn_metrics
try:
    import xgboost as xgb
except ImportError:
    xgb = None

from django.conf import settings
from analytics.models import MLModel
from .exceptions import ModelNotAvailableError

# FIX 2: logging top pe
logger = logging.getLogger(__name__)


def prepare_features(df: pd.DataFrame) -> tuple:
    df_encoded = pd.get_dummies(df, columns=['season'], prefix='season')
    for s in ['spring', 'summer', 'autumn', 'winter']:
        col = f'season_{s}'
        if col not in df_encoded.columns:
            df_encoded[col] = 0
    feature_cols = [
        'day_of_week', 'month', 'marketing_spend',
        'sales_last_week', 'sales_last_month',
        'season_spring', 'season_summer',
        'season_autumn', 'season_winter'
    ]
    X = df_encoded[feature_cols]
    y = df_encoded['sales_amount']
    return X, y


def get_season(month: int) -> str:
    if month in [12, 1, 2]:
        return "winter"
    elif month in [3, 4, 5]:
        return "spring"
    elif month in [6, 7, 8]:
        return "summer"
    else:
        return "autumn"


def train_model(X, y, algorithm="random_forest") -> dict:
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, shuffle=False)

    if algorithm == "linear_regression":
        model = LinearRegression()
    elif algorithm == "xgboost":
        if xgb is None:
            raise ImportError("xgboost not installed.")
        model = xgb.XGBRegressor(n_estimators=100, learning_rate=0.1)
    else:
        model = RandomForestRegressor(n_estimators=100)

    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    return {
        "model": model,
        # FIX 1: sklearn_metrics use karo
        "r2_score": sklearn_metrics.r2_score(y_test, y_pred),
        "rmse": np.sqrt(sklearn_metrics.mean_squared_error(y_test, y_pred)),
        "mae": sklearn_metrics.mean_absolute_error(y_test, y_pred)
    }


def save_model(model, version: str, algorithm: str,
               model_metrics: dict) -> MLModel:  # FIX 1: renamed
    model_dir = os.path.join(settings.BASE_DIR, 'ml_models')
    if not os.path.exists(model_dir):
        os.makedirs(model_dir)

    file_path = os.path.join(model_dir, f"{version}.pkl")
    joblib.dump(model, file_path)

    ml_model = MLModel.objects.create(
        version=version,
        algorithm=algorithm,
        trained_at=datetime.now(),
        accuracy_score=model_metrics.get('r2_score', 0),  # FIX 1
        file_path=file_path,
        is_active=False
    )
    return ml_model


def load_active_model():
    ml_model_rec = MLModel.objects.filter(is_active=True).first()
    if not ml_model_rec:
        raise ModelNotAvailableError(
            "No active ML model found.")

    if not os.path.exists(ml_model_rec.file_path):
        logger.error(f"Model file missing: {ml_model_rec.file_path}")
        raise ModelNotAvailableError(
            f"Model file not found at {ml_model_rec.file_path}")

    try:
        return joblib.load(ml_model_rec.file_path)
    except Exception as e:
        logger.error(f"Failed to load model: {str(e)}")
        raise ModelNotAvailableError(
            f"Corrupt model file: {str(e)}")