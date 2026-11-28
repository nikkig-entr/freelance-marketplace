'use client';

import { useState, useEffect, useRef } from 'react';
import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';

const tiers = [
  {
    id: 'independent',
    number: '01',
    label: 'INDEPENDENT',
    price: 0,
    period: '/month',
    description: 'For solo practitioners building their reputation.',
    specs: [
      { label: 'Weekly bids', value: '5' },
      { label: 'Project filters', value: 'Standard' },
      { label: 'Platform fee', value: '5%' },
      { label: 'Support tier', value: 'Community' },
      { label: 'AI tools', value: '—' },
      { label: 'Analytics', value: '—' },
      { label: 'Priority listing', value: '—' },
    ],
    cta: 'Start Free',
    accent: false,
  },
  {
    id: 'studio',
    number: '02',
    label: 'STUDIO',
    price: 49,
    period: '/month',
    description: 'For established practices scaling their flow.',
    specs: [
      { label: 'Weekly bids', value: 'Unlimited' },
      { label: 'Project filters', value: 'Advanced' },
      { label: 'Platform fee', value: '3%' },
      { label: 'Support tier', value: 'Priority' },
      { label: 'AI tools', value: 'Full suite' },
      { label: 'Analytics', value: 'Advanced' },
      { label: 'Priority listing', value: 'Included' },
    ],
    cta: 'Activate Studio',
    accent: true,
  },
  {
    id: 'enterprise',
    number: '03',
    label: 'ENTERPRISE',
    price: 199,
    period: '/month',
    description: 'For firms operating at institutional scale.',
    specs: [
      { label: 'Weekly bids', value: 'Unlimited' },
      { label: 'Project filters', value: 'Custom + Alerts' },
      { label: 'Platform fee', value: '1%' },
      { label: 'Support tier', value: 'Dedicated' },
      { label: 'AI tools', value: 'Full suite + API' },
      { label: 'Analytics', value: 'Custom reports' },
      { label: 'Priority listing', value: 'Top placement' },
    ],
    cta: 'Contact Sales',
    accent: false,
  },
];

function SpecRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[var(--color-border)] last:border-0">
      <span className="font-mono text-xs text-[var(--color-text-muted)] tracking-widest uppercase">{label}</span>
      <span className={`font-mono text-sm tabular-nums ${accent ? 'text-[var(--color-white)]' : 'text-[var(--color-text)]'}`}>{value}</span>
    </div>
  );
}

function TierCard({ tier, index }: { tier: typeof tiers[0]; index: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );
    const el = cardRef.current;
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={cardRef}
      id={`tier-${tier.id}`}
      className={`relative flex flex-col h-full border ${tier.accent ? 'border-[var(--color-white)]' : 'border-[var(--color-border)]'} bg-[var(--color-surface)] transition-all duration-500 hover:border-[var(--color-white)]/40 hover:bg-[var(--color-bg)]`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
        transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        transitionDelay: `${index * 0.1}s`,
      }}
    >
      {/* Tier Number Badge */}
      <div className="absolute -top-3 left-6 z-10 px-3 py-1 bg-[var(--color-bg)] border border-[var(--color-border)] font-mono text-xs tracking-wider">
        {tier.number}
      </div>

      <div className="p-6 lg:p-8 flex-1 flex flex-col">
        {/* Tier Label & Description */}
        <div className="mb-8">
          <p className="font-mono text-xs text-[var(--color-text-subtle)] tracking-widest uppercase mb-3">{tier.label}</p>
          <p className="font-editorial italic font-light text-[var(--color-text-muted)] leading-relaxed tracking-[0.01em] text-[clamp(1rem,1.2vw,1.125rem)]">
            {tier.description}
          </p>
        </div>

        {/* Price */}
        <div className="mb-8 border-t border-[var(--color-border)] pt-8">
          <div className="flex items-baseline gap-1">
            <span className="font-heading font-extrabold text-[var(--color-white)] text-[clamp(3rem,5vw,4.5rem)] leading-[0.9] tabular-nums">${tier.price}</span>
            <span className="font-mono text-[var(--color-text-subtle)] text-sm tracking-wider">{tier.period}</span>
          </div>
          {tier.price === 0 && (
            <p className="mt-3 font-mono text-xs text-[var(--color-text-subtle)] uppercase tracking-wider">No credit card required</p>
          )}
        </div>

        {/* Specs Grid - Architectural Hairline Table */}
        <div className="mb-8 flex-1 border-t border-[var(--color-border)] pt-6">
          <div className="space-y-0">
            {tier.specs.map((spec, i) => (
              <SpecRow key={i} label={spec.label} value={spec.value} accent={tier.accent} />
            ))}
          </div>
        </div>

        {/* CTA */}
        <Link
          to="/register"
          className={`inline-flex items-center justify-center gap-2 min-h-[56px] px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] border transition-all duration-300 ${tier.accent ? 'bg-[var(--color-white)] text-[var(--color-bg)] border-[var(--color-white)] hover:bg-[var(--color-white)]/90' : 'text-[var(--color-text)] border-[var(--color-border)] hover:bg-[var(--color-white)] hover:text-[var(--color-bg)]'}`}
        >
          {tier.cta}
        </Link>
      </div>
    </motion.div>
  );
}

export function PricingPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Hero Header - Monochrome Swiss Grid */}
      <header className="relative pt-16 pb-20 lg:pt-24 lg:pb-28 overflow-hidden border-b border-[var(--color-border)]">
        <div className="container relative">
          <div className="relative max-w-3xl">
            {/* Section label */}
            <div
              className="mb-6"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <span className="font-mono text-xs text-[var(--color-text-subtle)] tracking-wider uppercase">
                [ 03 / PRICING ARCHITECTURE ]
              </span>
            </div>

            {/* Monumental Headline - Constrained display, no clipping */}
            <h1
              className="font-heading font-extrabold text-[var(--color-white)] uppercase tracking-[-0.03em] leading-[0.92] text-[clamp(2.2rem,5.8vw,6rem)] break-words max-w-full mb-6"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
              }}
            >
              <span>Architectural</span>
              <br />
              <span>tiers for</span>
              <br />
              <span>every practice</span>
            </h1>

            {/* Editorial subheadline */}
            <p
              className="font-editorial italic font-light text-[var(--color-text-muted)] leading-relaxed tracking-[0.01em] text-[clamp(1.125rem,2vw,1.5rem)] max-w-2xl"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
              }}
            >
              Three precise tiers. Zero hidden fees. Upgrade or downgrade anytime.
            </p>
          </div>
        </div>
      </header>

      {/* Tiers Grid - Swiss Architectural Index */}
      <main className="container pb-16 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {tiers.map((tier, i) => (
            <TierCard key={tier.id} tier={tier} index={i} />
          ))}
        </div>

        {/* Detail Accordion - Architectural FAQ */}
        <section className="mt-16 lg:mt-24 max-w-4xl mx-auto">
          <div
            className="border border-[var(--color-border)] overflow-hidden"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s',
            }}
          >
            <details className="group border-b border-[var(--color-border)]">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <span className="font-heading font-medium text-[var(--color-text)] text-lg">What payment methods are accepted?</span>
                <svg className="w-5 h-5 text-[var(--color-text-subtle)] group-open:rotate-180 transition-transform duration-300 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-[var(--color-text-muted)] leading-relaxed font-editorial italic">
                All major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for annual Enterprise plans.
              </div>
            </details>
            <details className="group border-b border-[var(--color-border)]">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <span className="font-heading font-medium text-[var(--color-text)] text-lg">Can I change tiers later?</span>
                <svg className="w-5 h-5 text-[var(--color-text-subtle)] group-open:rotate-180 transition-transform duration-300 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-[var(--color-text-muted)] leading-relaxed font-editorial italic">
                Yes. Upgrades take effect immediately with prorated billing. Downgrades apply at the start of your next billing cycle.
              </div>
            </details>
            <details className="group border-b border-[var(--color-border)]">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <span className="font-heading font-medium text-[var(--color-text)] text-lg">What happens when I exceed my bid limit?</span>
                <svg className="w-5 h-5 text-[var(--color-text-subtle)] group-open:rotate-180 transition-transform duration-300 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-[var(--color-text-muted)] leading-relaxed font-editorial italic">
                Independent tier: new bids pause until the weekly reset. Studio and Enterprise tiers have unlimited bids.
              </div>
            </details>
            <details className="group">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <span className="font-heading font-medium text-[var(--color-text)] text-lg">Is there a trial for Studio tier?</span>
                <svg className="w-5 h-5 text-[var(--color-text-subtle)] group-open:rotate-180 transition-transform duration-300 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-[var(--color-text-muted)] leading-relaxed font-editorial italic">
                Yes. New Studio subscribers receive a 14-day trial. No credit card required to start. Cancel anytime during the trial.
              </div>
            </details>
          </div>
        </section>
      </main>
    </div>
  );
}

export { PricingPage as default };