import stripe
from django.conf import settings
from django.utils import timezone
from rest_framework import status, views, permissions
from rest_framework.response import Response
from django.shortcuts import redirect
from .models import Plan, User
import logging

logger = logging.getLogger(__name__)
stripe.api_key = settings.STRIPE_SECRET_KEY

class CreateCheckoutSessionView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        plan_id = request.data.get('plan_id')
        try:
            plan = Plan.objects.get(id=plan_id)
            if not plan.stripe_price_id:
                return Response({"error": "This plan is not available for purchase (missing price ID)"}, status=status.HTTP_400_BAD_REQUEST)

            # Create Stripe Customer if not exists
            if not request.user.stripe_customer_id:
                customer = stripe.Customer.create(
                    email=request.user.email,
                    name=f"{request.user.first_name} {request.user.last_name}",
                    metadata={'user_id': request.user.id}
                )
                request.user.stripe_customer_id = customer.id
                request.user.save()

            checkout_session = stripe.checkout.Session.create(
                customer=request.user.stripe_customer_id,
                payment_method_types=['card'],
                line_items=[{
                    'price': plan.stripe_price_id,
                    'quantity': 1,
                }],
                mode='subscription',
                success_url=settings.CORS_ALLOWED_ORIGINS[0] + '/profile?session_id={CHECKOUT_SESSION_ID}&status=success',
                cancel_url=settings.CORS_ALLOWED_ORIGINS[0] + '/pricing?status=cancel',
                metadata={
                    'user_id': request.user.id,
                    'plan_id': plan.id
                }
            )
            return Response({'url': checkout_session.url})
        except Plan.DoesNotExist:
            return Response({"error": "Invalid plan selected"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Stripe Checkout Error: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class StripeWebhookView(views.APIView):
    permission_classes = [permissions.AllowAny] # Stripe webhooks are public

    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        event = None

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.SignatureVerificationError as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        # Handle the event
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            user_id = session['metadata'].get('user_id')
            plan_id = session['metadata'].get('plan_id')
            
            if user_id and plan_id:
                try:
                    user = User.objects.get(id=user_id)
                    plan = Plan.objects.get(id=plan_id)
                    user.subscription_plan = plan
                    user.save()
                    logger.info(f"User {user_id} subscribed to plan {plan_id}")
                except Exception as e:
                    logger.error(f"Webhook update error: {str(e)}")

        elif event['type'] == 'customer.subscription.deleted':
            subscription = event['data']['object']
            customer_id = subscription['customer']
            try:
                user = User.objects.get(stripe_customer_id=customer_id)
                # Reset to free plan if exists
                free_plan = Plan.objects.filter(name='free').first()
                user.subscription_plan = free_plan
                user.save()
                logger.info(f"Subscription deleted for user {user.id}")
            except Exception as e:
                logger.error(f"Webhook delete error: {str(e)}")

        return Response(status=status.HTTP_200_OK)

class CreatePortalSessionView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if not request.user.stripe_customer_id:
            return Response({"error": "No stripe customer found"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            portal_session = stripe.billing_portal.Session.create(
                customer=request.user.stripe_customer_id,
                return_url=settings.CORS_ALLOWED_ORIGINS[0] + '/profile',
            )
            return Response({'url': portal_session.url})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UsageStatsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        plan = user.subscription_plan
        
        limit = plan.max_queries if plan else 100
        usage = user.query_usage_count
        
        return Response({
            "plan_name": plan.name if plan else "Free",
            "usage": usage,
            "limit": limit,
            "can_export": plan.can_export if plan else False,
            "remaining": max(0, limit - usage)
        })
