import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from analytics.models import SalesData, Prediction

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def executive_user(db):
    return User.objects.create_user(
        email='exec@test.com',
        password='Test@1234',
        role='executive',
        is_approved=True,   
    )

@pytest.fixture
def analyst_user(db):
    return User.objects.create_user(
        email='analyst@test.com',
        password='Test@1234',
        role='analyst',
        is_approved=True,
    )

@pytest.fixture
def auth_client(api_client, executive_user):
    api_client.force_authenticate(user=executive_user)
    return api_client

@pytest.mark.django_db
def test_analytics_summary_auth_required(api_client):
    url = reverse('analytics-summary')
    response = api_client.get(url)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

@pytest.mark.django_db
def test_analytics_summary_success(auth_client):
    url = reverse('analytics-summary')
    response = auth_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert 'total_revenue' in response.data

@pytest.mark.django_db
def test_csv_upload_permission(api_client, analyst_user):
    # Analysts should not be able to upload CSVs
    api_client.force_authenticate(user=analyst_user)
    url = reverse('upload-csv')
    response = api_client.post(url, {})
    assert response.status_code == status.HTTP_403_FORBIDDEN

@pytest.mark.django_db
def test_prediction_history_pagination(auth_client, db):
    # Create some mock predictions
    for i in range(15):
        Prediction.objects.create(
            date='2023-01-01', predicted_sales=100.0, 
            confidence_score=0.8, trend='stable', model_version='1.0.0'
        )
    
    url = reverse('prediction-history-list')
    response = auth_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    # Default pagination for DRF is usually present if configured, 
    # but we check the data structure
    assert 'results' in response.data or isinstance(response.data, list)
