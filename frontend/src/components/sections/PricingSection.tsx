import { Link } from 'react-router-dom';
import { useState } from 'react';
import { CheckIcon, XMarkIcon, SparklesIcon, ShieldCheckIcon, BoltIcon, CpuChipIcon, UserGroupIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Briefcase, Zap, Users, Shield, Brain, Crown, Globe, Lock, Infinity } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: { monthly: 0, yearly: 0 },
    description: 'Perfect for exploring the platform and landing your first project.',
    features: [
      { name: 'Apply to 10 projects/month', included: true },
      { name: 'Create 3 project drafts', included: true },
      { name: 'Basic profile visibility', included: true },
      { name: 'Standard support', included: true },
      { name: 'Escrow payment protection', included: true },
      { name: 'AI proposal generator', included: false },
      { name: 'AI talent matching', included: false },
      { name: 'Smart contract templates', included: false },
      { name: 'Priority listing in search', included: false },
      { name: 'Advanced analytics', included: false },
      { name: 'Dedicated success manager', included: false },
      { name: 'Custom branding', included: false },
    ],
    cta: 'Start Free',
    popular: false,
    gradient: 'from-white/[0.02] to-white/[0.01]',
    border: 'border-white/[0.08]',
  },
  {
    name: 'Pro',
    price: { monthly: 29, yearly: 24 },
    description: 'For serious freelancers who want to maximize their earning potential.',
    features: [
      { name: 'Apply to 50 projects/month', included: true },
      { name: 'Unlimited project drafts', included: true },
      { name: 'Enhanced profile visibility', included: true },
      { name: 'Priority support', included: true },
      { name: 'Escrow payment protection', included: true },
      { name: 'AI proposal generator (50/mo)', included: true },
      { name: 'AI talent matching', included: true },
      { name: 'Smart contract templates', included: true },
      { name: 'Priority listing in search', included: true },
      { name: 'Advanced analytics', included: true },
      { name: 'Dedicated success manager', included: false },
      { name: 'Custom branding', included: false },
    ],
    cta: 'Start 14-Day Trial',
    popular: true,
    gradient: 'from-amber/10 to-amber/5',
    border: 'border-amber/30 gradient-border-amber',
  },
  {
    name: 'Agency',
    price: { monthly: 99, yearly: 79 },
    description: 'For teams and agencies managing multiple freelancers and clients.',
    features: [
      { name: 'Unlimited project applications', included: true },
      { name: 'Unlimited project drafts', included: true },
      { name: 'Team profile & management', included: true },
      { name: '24/7 priority support', included: true },
      { name: 'Escrow payment protection', included: true },
      { name: 'AI proposal generator (200/mo)', included: true },
      { name: 'AI talent matching', included: true },
      { name: 'Smart contract templates', included: true },
      { name: 'Top priority in search', included: true },
      { name: 'Advanced team analytics', included: true },
      { name: 'Dedicated success manager', included: true },
      { name: 'Custom branding & white-label', included: true },
    ],
    cta: 'Contact Sales',
    popular: false,
    gradient: 'from-teal/10 to-teal/5',
    border: 'border-teal/30',
  },
];

const billingPeriods = [
  { value: 'monthly', label: 'Monthly', savings: null },
  { value: 'yearly', label: 'Yearly', savings: 'Save 20%' },
];

export function PricingSection() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <section className="section relative">
      {/* Background */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-amber/3 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-teal/3 blur-3xl" />
      </div>

      <div className="container relative">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="primary" size="lg" className="mb-4 inline-flex">
            Simple, Transparent Pricing
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-cream tracking-tight">
            Choose Your <span className="text-gradient">Plan</span>
          </h2>
          <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
            No hidden fees. No long-term contracts. Cancel anytime. All plans include secure escrow payments.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="glass-card p-1 rounded-xl flex items-center gap-1">
            {billingPeriods.map((period) => (
              <button
                key={period.value}
                onClick={() => setBilling(period.value)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  billing === period.value
                    ? 'bg-amber text-obsidian shadow-lg shadow-amber/25'
                    : 'text-muted hover:text-cream hover:bg-white/[0.03]'
                }`}
              >
                {period.label}
                {period.savings && billing === period.value && (
                  <Badge variant="success" size="sm" className="ml-1">{period.savings}</Badge>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <article
              key={plan.name}
              className={`relative glass-card-hover p-6 lg:p-8 flex flex-col h-full ${plan.popular ? 'scale-105 z-10' : ''}`}
              style={{ background: plan.gradient, border: plan.border }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="primary" size="sm" className="px-3 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-8">
                <h3 className="text-xl font-heading font-bold text-cream mb-2">{plan.name}</h3>
                <p className="text-muted text-sm mb-6">{plan.description}</p>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl lg:text-5xl font-bold text-cream">
                    ${billing === 'monthly' ? plan.price.monthly : plan.price.yearly}
                  </span>
                  <span className="text-muted mb-1">/month</span>
                  {billing === 'yearly' && plan.price.yearly > 0 && (
                    <span className="text-xs text-teal ml-2">Billed ${plan.price.yearly * 12}/year</span>
                  )}
                  {plan.price.monthly === 0 && (
                    <span className="text-xs text-teal ml-2">Free forever</span>
                  )}
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 flex-1 mb-8" role="list">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      feature.included
                        ? 'bg-teal/20 text-teal'
                        : 'bg-white/[0.03] text-muted/30 border border-white/[0.06]'
                    }`}>
                      {feature.included ? (
                        <CheckIcon className="w-3.5 h-3.5" />
                      ) : (
                        <XMarkIcon className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <span className={`text-sm ${feature.included ? 'text-cream' : 'text-muted/60'}`}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                variant={plan.popular ? 'primary' : plan.price.monthly === 0 ? 'secondary' : 'outline'}
                className="w-full"
                size="lg"
              >
                {plan.cta}
                <ArrowRightIcon className="w-5 h-5" />
              </Button>
            </article>
          ))}
        </div>

        {/* Enterprise Note */}
        <div className="mt-16 text-center">
          <Card className="glass-card p-6 lg:p-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Crown className="w-6 h-6 text-amber" />
              <h3 className="text-lg font-semibold text-cream">Need a custom solution?</h3>
            </div>
            <p className="text-muted mb-6">
              Enterprise plans with custom limits, SLA guarantees, dedicated infrastructure,
              and white-label options. Perfect for large agencies and platforms.
            </p>
            <Button variant="outline" asChild size="lg">
              <Link to="/contact">Contact Sales</Link>
            </Button>
          </Card>
        </div>
      </div>
    </section>
  );
}