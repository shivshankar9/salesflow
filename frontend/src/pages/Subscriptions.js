import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Crown, Star, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';

export default function Subscriptions() {
  const [plans, setPlans] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [showIndianPricing, setShowIndianPricing] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = showIndianPricing 
        ? await api.get('/subscriptions/plans/indian')
        : await api.get('/subscriptions/plans');
      setPlans(response.data.plans);
    } catch (error) {
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [showIndianPricing]);

  const handleSubscribe = async (planKey) => {
    try {
      const provider = showIndianPricing ? 'razorpay' : 'stripe';
      const response = await api.post('/subscriptions/subscribe', null, {
        params: { plan: planKey, payment_provider: provider }
      });
      toast.success(`Successfully subscribed to ${planKey} plan!`);
      setCurrentPlan(planKey);
    } catch (error) {
      toast.error('Subscription failed. Please try again.');
    }
  };

  if (loading) return <div>Loading...</div>;

  const planIcons = {
    free: Star,
    startup: Zap,
    basic: Zap,
    business: Crown,
    professional: Crown,
    enterprise: Crown
  };

  const planColors = {
    free: 'bg-gray-50 border-gray-200',
    startup: 'bg-blue-50 border-blue-200',
    basic: 'bg-blue-50 border-blue-200',
    business: 'bg-orange-50 border-orange-300',
    professional: 'bg-orange-50 border-orange-300',
    enterprise: 'bg-purple-50 border-purple-200'
  };

  return (
    <div className="space-y-6" data-testid="subscriptions-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-heading font-semibold tracking-tight">Subscription Plans</h1>
          <p className="text-sm text-muted-foreground mt-1">Choose the perfect plan for your business</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showIndianPricing ? 'default' : 'outline'}
            onClick={() => setShowIndianPricing(true)}
            className={showIndianPricing ? 'bg-orange-500 hover:bg-orange-600' : ''}
          >
            <IndianRupee className="w-4 h-4 mr-1" />
            India (INR)
          </Button>
          <Button
            variant={!showIndianPricing ? 'default' : 'outline'}
            onClick={() => setShowIndianPricing(false)}
          >
            Global (USD)
          </Button>
        </div>
      </div>

      {showIndianPricing && (
        <div className="bg-gradient-to-r from-orange-50 to-green-50 border-l-4 border-orange-500 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <IndianRupee className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <p className="font-medium text-orange-900">Special Indian Pricing 🇮🇳</p>
              <p className="text-sm text-orange-700 mt-1">
                Affordable plans designed for Indian businesses. Pay in INR via UPI, Cards, or Net Banking.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans && Object.entries(plans).map(([key, plan]) => {
          const Icon = planIcons[key] || Zap;
          const price = showIndianPricing ? plan.price_inr : plan.price;
          const currency = showIndianPricing ? '₹' : '$';
          
          return (
            <Card
              key={key}
              className={`p-6 border-2 ${planColors[key] || planColors.basic} ${currentPlan === key ? 'ring-2 ring-orange-500' : ''} hover:border-orange-500/50 transition-all`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Icon className={`w-8 h-8 ${key === 'business' || key === 'professional' || key === 'enterprise' ? 'text-orange-600' : 'text-gray-600'}`} />
                  {currentPlan === key && (
                    <Badge className="bg-orange-500">Current</Badge>
                  )}
                </div>
                
                <div>
                  <h3 className="text-2xl font-heading font-semibold">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-4xl font-heading font-bold">{currency}{price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  {showIndianPricing && price > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      ~${plan.price_usd || Math.round(price / 83)}/mo USD
                    </p>
                  )}
                </div>

                <ul className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  data-testid={`subscribe-${key}`}
                  className={`w-full ${
                    key === 'business' || key === 'professional' || key === 'enterprise'
                      ? 'bg-orange-500 hover:bg-orange-600'
                      : ''
                  }`}
                  variant={key === 'free' ? 'outline' : 'default'}
                  onClick={() => handleSubscribe(key)}
                  disabled={currentPlan === key}
                >
                  {currentPlan === key ? 'Current Plan' : key === 'free' ? 'Get Started' : 'Subscribe Now'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {showIndianPricing && (
        <Card className="p-6 border border-gray-200 bg-gradient-to-r from-green-50 to-orange-50">
          <div className="flex items-start gap-4">
            <div className="bg-white p-3 rounded-full">
              <IndianRupee className="w-8 h-8 text-orange-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-heading font-semibold">Payment Options for India</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Pay securely via UPI, Credit/Debit Cards, Net Banking, or Wallets through Razorpay.
              </p>
              <div className="flex gap-4 mt-4">
                <Badge variant="outline" className="bg-white">UPI</Badge>
                <Badge variant="outline" className="bg-white">Cards</Badge>
                <Badge variant="outline" className="bg-white">Net Banking</Badge>
                <Badge variant="outline" className="bg-white">Wallets</Badge>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6 border border-gray-200 bg-gradient-to-r from-orange-50 to-white">
        <div className="flex items-start gap-4">
          <Crown className="w-12 h-12 text-orange-500" />
          <div className="flex-1">
            <h3 className="text-xl font-heading font-semibold">Need a custom plan?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Contact our sales team for enterprise solutions tailored to your organization's needs.
            </p>
            <Button className="mt-4 bg-orange-500 hover:bg-orange-600">
              Contact Sales
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}