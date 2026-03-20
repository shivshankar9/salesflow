import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Crown, Star } from 'lucide-react';
import { toast } from 'sonner';

export default function Subscriptions() {
  const [plans, setPlans] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState('free');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/subscriptions/plans');
      setPlans(response.data.plans);
    } catch (error) {
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planKey) => {
    try {
      const response = await api.post('/subscriptions/subscribe', null, {
        params: { plan: planKey, payment_provider: 'stripe' }
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
    basic: Zap,
    professional: Crown,
    enterprise: Crown
  };

  const planColors = {
    free: 'bg-gray-50 border-gray-200',
    basic: 'bg-blue-50 border-blue-200',
    professional: 'bg-orange-50 border-orange-300',
    enterprise: 'bg-purple-50 border-purple-200'
  };

  return (
    <div className="space-y-6" data-testid="subscriptions-page">
      <div>
        <h1 className="text-4xl font-heading font-semibold tracking-tight">Subscription Plans</h1>
        <p className="text-sm text-muted-foreground mt-1">Choose the perfect plan for your business</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans && Object.entries(plans).map(([key, plan]) => {
          const Icon = planIcons[key];
          return (
            <Card
              key={key}
              className={`p-6 border-2 ${planColors[key]} ${currentPlan === key ? 'ring-2 ring-orange-500' : ''} hover:border-orange-500/50 transition-all`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Icon className={`w-8 h-8 ${key === 'professional' || key === 'enterprise' ? 'text-orange-600' : 'text-gray-600'}`} />
                  {currentPlan === key && (
                    <Badge className="bg-orange-500">Current</Badge>
                  )}
                </div>
                
                <div>
                  <h3 className="text-2xl font-heading font-semibold">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-4xl font-heading font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
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
                    key === 'professional' || key === 'enterprise'
                      ? 'bg-orange-500 hover:bg-orange-600'
                      : ''
                  }`}
                  variant={key === 'free' ? 'outline' : 'default'}
                  onClick={() => handleSubscribe(key)}
                  disabled={currentPlan === key}
                >
                  {currentPlan === key ? 'Current Plan' : key === 'free' ? 'Get Started' : 'Upgrade'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

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