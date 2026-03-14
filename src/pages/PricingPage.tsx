import React, { useState } from 'react';
import { Check, Sparkles, Zap, Shield, Rocket } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-hot-toast';
import api from '@/api/endpoints';

const plans = [
  {
    id: 1,
    name: 'Free',
    price: '$0',
    description: 'Perfect for exploring the platform features.',
    icon: <Zap className="h-6 w-6 text-blue-400" />,
    features: [
      '100 queries per month',
      'Basic analytics dashboard',
      'Community support',
      'Self-service onboarding'
    ],
    buttonText: 'Current Plan',
    highlight: false,
  },
  {
    id: 2,
    name: 'Pro',
    price: '$29',
    description: 'Best for power users and growing teams.',
    icon: <Sparkles className="h-6 w-6 text-purple-400" />,
    features: [
      'Unlimited queries',
      'Advanced predictive models',
      'Priority email support',
      'Full data export (CSV/PDF)',
      'Custom theme options'
    ],
    buttonText: 'Upgrade to Pro',
    highlight: true,
  },
  {
    id: 3,
    name: 'Enterprise',
    price: 'Custom',
    description: 'Dedicated resources for large organisations.',
    icon: <Rocket className="h-6 w-6 text-amber-400" />,
    features: [
      'Multi-user team accounts',
      'Custom domain & branding',
      'Dedicated account manager',
      'SLA & enhanced security',
      'Audit log retention (365 days)'
    ],
    buttonText: 'Contact Sales',
    highlight: false,
  }
];

const PricingPage: React.FC = () => {
  const user = useAuthStore(s => s.user);
  const [loading, setLoading] = useState<number | null>(null);

  const handleUpgrade = async (planId: number, name: string) => {
    if (name === 'Free') return;
    if (name === 'Enterprise') {
      toast.success('Our sales team will contact you shortly!');
      return;
    }

    setLoading(planId);
    try {
      const response = await api.billing.createCheckout(planId);
      if (response.url) {
        window.location.href = response.url;
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to initiate checkout');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto text-center mb-20">
        <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-6">
          INSIGHT <span className="text-primary not-italic">PLANS</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium">
          Choose the perfect tier for your data needs. Scale your intelligence with our premium features.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`relative group rounded-[2rem] p-8 transition-all duration-500 hover:-translate-y-2 ${
              plan.highlight 
                ? 'bg-gradient-to-b from-primary/20 to-primary/5 border-2 border-primary/30' 
                : 'bg-white/5 border border-white/5 hover:bg-white/[0.07]'
            }`}
          >
            {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-black text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-2xl shadow-primary/50">
                    Most Popular
                </div>
            )}

            <div className="mb-8">
              <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-transform duration-500">
                {plan.icon}
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-black">{plan.price}</span>
                {plan.price !== 'Custom' && <span className="text-gray-500 font-bold">/mo</span>}
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                {plan.description}
              </p>
            </div>

            <ul className="space-y-4 mb-10">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm font-medium text-gray-300">
                  <div className="mt-1 h-5 w-5 rounded-full bg-white/5 flex items-center justify-center border border-white/5 shrink-0">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleUpgrade(plan.id, plan.name)}
              disabled={loading !== null || (user?.subscription_plan?.id === plan.id)}
              className={`w-full h-14 rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 ${
                user?.subscription_plan?.id === plan.id
                  ? 'bg-white/10 text-gray-400 cursor-default'
                  : plan.highlight
                    ? 'bg-primary text-black hover:bg-primary/90 shadow-xl shadow-primary/20'
                    : 'bg-white text-black hover:bg-gray-200'
              }`}
            >
              {loading === plan.id ? (
                <div className="h-5 w-5 border-2 border-black/30 border-t-black rounded-full animate-spin mx-auto" />
              ) : (
                user?.subscription_plan?.id === plan.id ? 'Active Plan' : plan.buttonText
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-20 max-w-4xl mx-auto rounded-[2.5rem] bg-indigo-500/10 border border-indigo-500/20 p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
            <Shield className="h-5 w-5 text-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Enterprise Security</span>
          </div>
          <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">Need a custom enterprise solution?</h2>
          <p className="text-gray-400 font-medium">
            Contact us for dedicated support, custom integrations, and volume-based pricing tailored for your organization's specific intelligence requirements.
          </p>
        </div>
        <button className="h-14 px-10 rounded-2xl bg-indigo-500 text-white font-black uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 whitespace-nowrap">
          Schedule Demo
        </button>
      </div>
    </div>
  );
};

export default PricingPage;
