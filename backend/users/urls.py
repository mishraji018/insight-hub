from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .billing_views import (
    CreateCheckoutSessionView,
    StripeWebhookView,
    CreatePortalSessionView,
    UsageStatsView
)
from .org_views import OrganisationViewSet
from .developer_views import APIKeyViewSet

router = DefaultRouter()
router.register(r'organisations', OrganisationViewSet, basename='organisation')
router.register(r'developer/keys', APIKeyViewSet, basename='api-key')

urlpatterns = [
    # Billing
    path('billing/create-checkout/', CreateCheckoutSessionView.as_view(), name='create-checkout'),
    path('billing/webhook/', StripeWebhookView.as_view(), name='stripe-webhook'),
    path('billing/portal/', CreatePortalSessionView.as_view(), name='billing-portal'),
    path('billing/usage/', UsageStatsView.as_view(), name='billing-usage'),
    path('', include(router.urls)),
]
