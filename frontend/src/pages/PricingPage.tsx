'use client';

import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/Button';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    period: '/month',
    description: 'Perfect for getting started',
    features: [
      { text: '5 bids per week', included: true },
      { text: 'Basic project filters', included: true },
      { text: 'Standard support', included: true },
      { text: '5% platform fee', included: true },
      { text: 'AI-powered tools', included: false },
      { text: 'Advanced analytics', included: false },
      { text: 'Priority listing', included: false },
    ],
    cta: 'Start Free',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    period: '/month',
    description: 'For serious freelancers',
    features: [
      { text: '50 bids per week', included: true },
      { text: 'Advanced project filters', included: true },
      { text: 'Priority support', included: true },
      { text: '3% platform fee', included: true },
      { text: 'AI-powered tools', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Priority listing', included: false },
    ],
    cta: 'Get Started',
    popular: true,
  },
  {
    id: 'agency',
    name: 'Agency',
    price: 99,
    period: '/month',
    description: 'For teams and agencies',
    features: [
      { text: 'Unlimited bids', included: true },
      { text: 'Custom filters & alerts', included: true },
      { text: 'Dedicated support', included: true },
      { text: '1% platform fee', included: true },
      { text: 'AI-powered tools', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Priority listing', included: true },
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

function FeatureItem({ text, included }: { text: string; included: boolean }) {
  return (
    <li className="flex items-center gap-3 py-3 border-b border-white/15 last:border-0">
      {included ? (
        <CheckCircleIcon className="w-5 h-5 text-[var(--color-white)] flex-shrink-0" />
      ) : (
        <XMarkIcon className="w-5 h-5 text-[var(--color-text-subtle)] flex-shrink-0" />
      )}
      <span className={included ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'}>
        {text}
      </span>
    </li>
  );
}

function PlanCard({ plan, isCurrentPlan }: { plan: typeof plans[0]; isCurrentPlan?: boolean }) {
  return (
    <div className={`relative flex flex-col h-full border ${plan.popular ? 'border-white' : 'border-white/15'} ${isCurrentPlan ? 'ring-2 ring-white' : ''} transition-all duration-300`}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-white text-black font-mono text-xs uppercase tracking-wider">
          Most Popular
        </div>
      )}
      <div className="p-6 lg:p-8 flex-1 flex flex-col">
        <div className="mb-6">
          <p className="font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase mb-2">{plan.id.toUpperCase()}</p>
          <h3 className="font-heading font-bold text-[var(--color-text)] text-2xl lg:text-3xl uppercase tracking-[-0.02em] mb-2">{plan.name}</h3>
          <p className="font-[Instrument_Serif] italic font-light text-[var(--color-text-muted)] leading-relaxed">{plan.description}</p>
        </div>

        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className="font-heading font-extrabold text-[var(--color-text)] text-5xl lg:text-6xl tabular-nums">${plan.price}</span>
            <span className="font-mono text-[var(--color-text-muted)] text-base">{plan.period}</span>
          </div>
          {plan.price === 0 && (
            <p className="mt-2 font-mono text-xs text-[var(--color-text-subtle)] uppercase tracking-wider">No credit card required</p>
          )}
        </div>

        <ul className="space-y-0 mb-8 flex-1">
          {plan.features.map((feature, index) => (
            <FeatureItem key={index} {...feature} />
          ))}
        </ul>

        <Button
          asChild
          variant={plan.popular ? 'primary' : 'secondary'}
          fullWidth
          size="lg"
          className="min-h-[56px] border border-white px-4 py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black"
        >
          <Link to="/register">{plan.cta}</Link>
        </Button>
      </div>
    </div>
  );
}

export function PricingPage() {
  const [isCurrentPlan] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Hero Header */}
      <header className="relative pt-16 pb-20 lg:pt-24 lg:pb-28 overflow-hidden border-b border-white/15">
        <div className="container relative">
          <div className="max-w-3xl">
            <div className="mb-6">
              <span className="font-mono text-xs text-[var(--color-text-subtle)] tracking-wider uppercase block">
                [ 03 / PRICING ]
              </span>
            </div>

            <h1 className="font-heading font-extrabold text-[var(--color-text)] uppercase tracking-[-0.04em] leading-[0.86] text-[clamp(2.5rem,6.5vw,6rem)] mb-6">
              Simple, transparent
              <br />
              pricing
            </h1>

            <p className="font-[Instrument_Serif] italic font-light text-[var(--color-text-muted)] leading-relaxed tracking-[0.01em] text-[clamp(1.125rem,2vw,1.5rem)] max-w-2xl">
              Choose the plan that fits your practice. No hidden fees. Cancel anytime.
            </p>
          </div>
        </div>
      </header>

      {/* Plans Grid */}
      <main className="container pb-16 lg:pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} isCurrentPlan={isCurrentPlan === plan.id} />
          ))}
        </div>

        {/* FAQ / Details */}
        <section className="mt-16 lg:mt-24 max-w-4xl mx-auto">
          <div className="border border-white/15 overflow-hidden">
            <details className="group border-b border-white/15">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <span className="font-heading font-medium text-[var(--color-text)] text-lg">What payment methods do you accept?</span>
                <svg className="w-5 h-5 text-[var(--color-text-muted)] group-open:rotate-180 transition-transform duration-300 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-[var(--color-text-muted)] leading-relaxed">
                We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for annual Agency plans.
              </div>
            </details>
            <details className="group border-b border-white/15">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <span className="font-heading font-medium text-[var(--color-text)] text-lg">Can I change plans later?</span>
                <svg className="w-5 h-5 text-[var(--color-text-muted)] group-open:rotate-180 transition-transform duration-300 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-[var(--color-text-muted)] leading-relaxed">
                Yes, you can upgrade or downgrade at any time. Upgrades take effect immediately. Downgrades apply at the start of your next billing cycle.
              </div>
            </details>
            <details className="group border-b border-white/15">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <span className="font-heading font-medium text-[var(--color-text)] text-lg">What happens when I exceed my bid limit?</span>
                <svg className="w-5 h-5 text-[var(--color-text-muted)] group-open:rotate-180 transition-transform duration-300 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-[var(--color-text-muted)] leading-relaxed">
                You won't be able to submit new bids until your limit resets (weekly for Starter/Pro). Upgrade to Pro or Agency for higher limits.
              </div>
            </details>
            <details className="group">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <span className="font-heading font-medium text-[var(--color-text)] text-lg">Is there a free trial for Pro?</span>
                <svg className="w-5 h-5 text-[var(--color-text-muted)] group-open:rotate-180 transition-transform duration-300 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-[var(--color-text-muted)] leading-relaxed">
                Yes, new Pro subscribers get a 14-day free trial. No credit card required to start. Cancel anytime during the trial.
              </div>
            </details>
          </div>
        </section>
      </main>
    </div>
  );
}

export { PricingPage as default };