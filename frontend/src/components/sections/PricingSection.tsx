import { useState } from 'react';
import { CheckIcon, XMarkIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Link } from '@tanstack/react-router';
import { Crown } from 'lucide-react';
import { AmbientBackground } from '@/components/ui/AmbientBackground';

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
  },
];

type BillingPeriod = 'monthly' | 'yearly';

const billingPeriods: { value: BillingPeriod; label: string; savings: string | null }[] = [
  { value: 'monthly', label: 'Monthly', savings: null },
  { value: 'yearly', label: 'Yearly', savings: 'Save 20%' },
];

export function PricingSection() {
  const [billing, setBilling] = useState<BillingPeriod>('monthly');

  return (
    <section className="section">
      <AmbientBackground size="lg" opacity="default">
        <div className="container">
        {/* Header - Centered, Typography Focused */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="primary" size="md" className="mb-4 inline-flex">
            Simple, Transparent Pricing
          </Badge>
          <h2 className="text-headline-1 text-[var(--color-text)]">
            Choose Your Plan
          </h2>
          <p className="mt-4 text-body text-[var(--color-text-muted)] max-w-2xl mx-auto">
            No hidden fees. No long-term contracts. Cancel anytime. All plans include secure escrow payments.
          </p>
        </div>

        {/* Billing Toggle - Clean */}
        <div className="flex justify-center mb-12">
          <div className="glass-card p-1 rounded-none flex items-center gap-1">
            {billingPeriods.map((period) => (
              <button
                key={period.value}
                onClick={() => setBilling(period.value)}
                className={`px-5 py-2.5 rounded-none text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  billing === period.value
                    ? 'bg-[var(--color-white)] text-[var(--color-text-inverse)] shadow-lg shadow-[var(--color-white)]/25'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--glass-bg)]'
                }`}
              >
                {period.label}
                {period.savings && billing === period.value && (
                  <Badge variant="primary" size="sm" className="ml-1">{period.savings}</Badge>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Cards - Clean, Minimal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <article
              key={plan.name}
              className={`relative glass-card-hover p-6 lg:p-8 flex flex-col h-full ${plan.popular ? 'ring-1 ring-[var(--color-white)]/20' : ''}`}
              style={{ animationDelay: `${index * 80}ms` }}
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
                <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">{plan.name}</h3>
                <p className="text-[var(--color-text-muted)] text-sm mb-6">{plan.description}</p>

                <div className="flex items-baseline gap-1">
                  <span className="text-5xl lg:text-6xl font-extrabold text-[var(--color-text)] tracking-tight">
                    ${billing === 'monthly' ? plan.price.monthly : plan.price.yearly}
                  </span>
                  <span className="text-[var(--color-text-muted)] mb-1">/month</span>
                  {billing === 'yearly' && plan.price.yearly > 0 && (
                    <span className="text-xs text-[var(--color-text-muted)] ml-2">Billed ${plan.price.yearly * 12}/year</span>
                  )}
                  {plan.price.monthly === 0 && (
                    <span className="text-xs text-[var(--color-text-muted)] ml-2">Free forever</span>
                  )}
                </div>
              </div>

              {/* Features - Clean List */}
              <ul className="space-y-3 flex-1 mb-8" role="list">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-none flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      feature.included
                        ? 'bg-[var(--color-white)]/20 text-[var(--color-white)]'
                        : 'glass text-[var(--color-text-subtle)]'
                    }`}>
                      {feature.included ? (
                        <CheckIcon className="w-3.5 h-3.5" />
                      ) : (
                        <XMarkIcon className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <span className={`text-sm ${feature.included ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'}`}>
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

        {/* Enterprise Note - Minimal */}
        <div className="mt-16 text-center">
          <div className="glass-card p-6 lg:p-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Crown className="w-6 h-6 text-[var(--color-white)]" />
              <h3 className="text-lg font-semibold text-[var(--color-text)]">Need a custom solution?</h3>
            </div>
            <p className="text-[var(--color-text-muted)] mb-6">
              Enterprise plans with custom limits, SLA guarantees, dedicated infrastructure,
              and white-label options. Perfect for large agencies and platforms.
            </p>
            <Button variant="outline" asChild size="lg">
              <Link to="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </div>
      </AmbientBackground>
    </section>
  );
}