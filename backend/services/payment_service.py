import os
import stripe
import razorpay
from fastapi import HTTPException

# Stripe setup
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY', 'sk_test_demo')

# Razorpay setup
razorpay_key = os.environ.get('RAZORPAY_KEY_ID', 'rzp_test_demo')
razorpay_secret = os.environ.get('RAZORPAY_KEY_SECRET', 'demo')

razorpay_client = None
if razorpay_key != 'rzp_test_demo':
    razorpay_client = razorpay.Client(auth=(razorpay_key, razorpay_secret))

# Subscription plans
SUBSCRIPTION_PLANS = {
    'free': {'name': 'Free', 'price': 0, 'features': ['5 contacts', '2 leads', 'Basic dashboard']},
    'basic': {'name': 'Basic', 'price': 19, 'features': ['100 contacts', '50 leads', 'Email integration', 'Basic AI']},
    'professional': {'name': 'Professional', 'price': 49, 'features': ['Unlimited contacts', 'Unlimited leads', 'All integrations', 'Advanced AI', 'WhatsApp/SMS']},
    'enterprise': {'name': 'Enterprise', 'price': 149, 'features': ['Everything in Professional', 'Custom integrations', 'Priority support', 'API access']}
}

def get_plans():
    return SUBSCRIPTION_PLANS

def create_stripe_customer(email: str):
    if stripe.api_key == 'sk_test_demo':
        return {'id': 'cus_demo', 'email': email, 'status': 'test_mode'}
    try:
        customer = stripe.Customer.create(email=email)
        return {'id': customer.id, 'email': customer.email}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

def create_stripe_subscription(customer_id: str, plan: str):
    if stripe.api_key == 'sk_test_demo':
        return {'subscription_id': 'sub_demo', 'status': 'active', 'plan': plan, 'test_mode': True}
    try:
        price = SUBSCRIPTION_PLANS[plan]['price'] * 100
        subscription = stripe.Subscription.create(
            customer=customer_id,
            items=[{'price_data': {
                'currency': 'usd',
                'product_data': {'name': SUBSCRIPTION_PLANS[plan]['name']},
                'recurring': {'interval': 'month'},
                'unit_amount': price
            }}]
        )
        return {'subscription_id': subscription.id, 'status': subscription.status, 'plan': plan}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

def create_razorpay_order(amount: int, currency: str = 'INR'):
    if not razorpay_client:
        return {'order_id': 'order_demo', 'amount': amount, 'currency': currency, 'status': 'test_mode'}
    try:
        order = razorpay_client.order.create({
            'amount': amount * 100,
            'currency': currency,
            'receipt': f'order_{amount}'
        })
        return {'order_id': order['id'], 'amount': order['amount'], 'currency': order['currency'], 'status': order['status']}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))