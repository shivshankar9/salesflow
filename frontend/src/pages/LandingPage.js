import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Users, TrendingUp, Zap, MessageSquare, Mail, Phone, Sparkles, BarChart3, Shield } from 'lucide-react';

export default function LandingPage() {
  const features = [
    { icon: Users, title: 'Contact Management', description: 'Organize and track all your customer relationships in one place' },
    { icon: TrendingUp, title: 'Lead Pipeline', description: 'Visual kanban board to manage leads through every stage' },
    { icon: BarChart3, title: 'Smart Analytics', description: 'Real-time insights and metrics to drive better decisions' },
    { icon: Sparkles, title: 'AI-Powered', description: 'Intelligent lead scoring, email drafts, and sentiment analysis' },
    { icon: MessageSquare, title: 'Multi-Channel', description: 'Email, SMS, and WhatsApp integration for seamless communication' },
    { icon: Shield, title: 'Role Management', description: 'Hierarchical user permissions for teams of any size' },
  ];

  const plans = [
    { name: 'Free', price: 0, features: ['5 contacts', '2 leads', 'Basic dashboard', 'Email support'] },
    { name: 'Basic', price: 19, features: ['100 contacts', '50 leads', 'Email integration', 'Basic AI features', 'Priority support'], popular: false },
    { name: 'Professional', price: 49, features: ['Unlimited contacts', 'Unlimited leads', 'All integrations', 'Advanced AI', 'WhatsApp & SMS', 'API access'], popular: true },
    { name: 'Enterprise', price: 149, features: ['Everything in Pro', 'Custom integrations', 'Dedicated support', 'SLA guarantee', 'On-premise option'], popular: false },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <h1 className="text-2xl font-heading font-semibold">SalesFlow</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/login">
              <Button className="bg-orange-500 hover:bg-orange-600">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-white"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block mb-6">
                <span className="bg-orange-100 text-orange-700 px-4 py-1 rounded-full text-sm font-medium">
                  AI-Powered CRM Platform
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-heading font-bold tracking-tight leading-tight">
                Supercharge Your Sales with Intelligent CRM
              </h1>
              <p className="text-xl text-muted-foreground mt-6 leading-relaxed">
                Built for modern sales teams. Manage contacts, track leads, and close deals faster with AI assistance.
              </p>
              <div className="flex items-center gap-4 mt-8">
                <Link to="/login">
                  <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-lg px-8 py-6">
                    Start Free Trial
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  Watch Demo
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                No credit card required • 14-day free trial • Cancel anytime
              </p>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl p-8 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"
                  alt="Dashboard"
                  className="rounded-lg shadow-lg"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sales Increased</p>
                    <p className="text-2xl font-bold text-green-600">+43%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold tracking-tight">Everything you need to grow</h2>
            <p className="text-xl text-muted-foreground mt-4">Powerful features designed for sales success</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="p-6 border border-gray-200 hover:border-orange-500/50 transition-all hover:shadow-lg">
                <div className="bg-orange-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-heading font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold tracking-tight">Integrates with your favorite tools</h2>
            <p className="text-xl text-muted-foreground mt-4">Connect seamlessly with the platforms you already use</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {[Mail, Phone, MessageSquare, Sparkles, Zap, BarChart3].map((Icon, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-lg hover:border-orange-500/50 transition-colors">
                <Icon className="w-8 h-8 text-gray-600 mb-2" />
                <p className="text-sm text-muted-foreground text-center">
                  {['Email', 'SMS', 'WhatsApp', 'AI', 'Payments', 'Analytics'][idx]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold tracking-tight">Simple, transparent pricing</h2>
            <p className="text-xl text-muted-foreground mt-4">Choose the perfect plan for your business</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`p-6 border-2 relative ${
                  plan.popular ? 'border-orange-500 shadow-xl' : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-heading font-semibold mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-heading font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/login">
                  <Button
                    className={`w-full ${
                      plan.popular ? 'bg-orange-500 hover:bg-orange-600' : ''
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    Get Started
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            Ready to transform your sales process?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of teams already using SalesFlow to close more deals
          </p>
          <Link to="/login">
            <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-12 py-6">
              Start Your Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-heading font-semibold mb-4">SalesFlow</h3>
              <p className="text-sm">Modern CRM for modern sales teams</p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
            <p>© 2024 SalesFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}