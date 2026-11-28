'use client';

import { useEffect, useState, useRef } from 'react';
import { Link } from '@tanstack/react-router';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { SplitTextReveal } from '@/components/motion/SplitTextReveal';

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
    <div className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
      <span className="font-mono text-xs text-white/40 tracking-widest uppercase">{label}</span>
      <span className={`font-mono text-sm tabular-nums ${accent ? 'text-white' : 'text-white/60'}`}>{value}</span>
    </div>
  );
}

function TierCard({ tier, index, scrollProgress }: { tier: typeof tiers[0]; index: number; scrollProgress: ReturnType<typeof useScroll>['scrollYProgress'] }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );
    const el = document.getElementById(`tier-${tier.id}`);
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [tier.id]);

  // Subtle parallay on the card based on scroll
  const cardY = useSpring(
    useTransform(scrollProgress, [0, 1], [0, index * 12]),
    { stiffness: 80, damping: 20 }
  );

  return (
    <motion.div
      id={`tier-${tier.id}`}
      ref={(el) => { if (el) el.style.setProperty('--card-index', index.toString()); }}
      className={`relative flex flex-col h-full border border-white/15 ${tier.accent ? 'border-white' : ''} bg-[rgba(255,255,255,0.02)] transition-all duration-500 hover:border-white/40 hover:bg-[rgba(255,255,255,0.03)]`}
      style={{
        y: cardY,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
        transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        transitionDelay: `${index * 0.1}s`,
      }}
    >
      {/* Tier Number Badge */}
      <div className="absolute -top-3 left-6 z-10 px-3 py-1 bg-[var(--color-bg)] border border-white/15 font-mono text-xs tracking-wider">
        {tier.number}
      </div>

      <div className="p-6 lg:p-8 flex-1 flex flex-col">
        {/* Tier Label & Description */}
        <div className="mb-8">
          <p className="font-mono text-xs text-white/30 tracking-widest uppercase mb-3">{tier.label}</p>
          <SplitTextReveal
            splitBy="lines"
            delay={0.1 + index * 0.05}
            stagger={0.08}
            duration={0.9}
            ease="cubic-bezier(0.16, 1, 0.3, 1)"
            as="p"
            className="font-[Instrument_Serif] italic font-light text-white/50 leading-relaxed text-[clamp(1rem,1.2vw,1.125rem)]"
          >
            {tier.description}
          </SplitTextReveal>
        </div>

        {/* Price */}
        <div className="mb-8 border-t border-white/10 pt-8">
          <div className="flex items-baseline gap-1">
            <span className="font-heading font-extrabold text-white text-[clamp(3rem,5vw,4.5rem)] leading-[0.9] tabular-nums">${tier.price}</span>
            <span className="font-mono text-white/30 text-sm tracking-wider">{tier.period}</span>
          </div>
          {tier.price === 0 && (
            <p className="mt-3 font-mono text-xs text-white/25 uppercase tracking-wider">No credit card required</p>
          )}
        </div>

        {/* Specs Grid - Architectural Hairline Table */}
        <div className="mb-8 flex-1 border-t border-white/10 pt-6">
          <div className="space-y-0">
            {tier.specs.map((spec, i) => (
              <SpecRow key={i} label={spec.label} value={spec.value} accent={tier.accent} />
            ))}
          </div>
        </div>

        {/* CTA */}
        <Link
          to="/register"
          className={`inline-flex items-center justify-center gap-2 min-h-[56px] px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] border border-white transition-all duration-300 ${tier.accent ? 'bg-white text-black hover:bg-white/90' : 'text-white hover:bg-white hover:text-black'}`}
        >
          {tier.cta}
        </Link>
      </div>
    </motion.div>
  );
}

export function PricingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  return (
    <div ref={containerRef} className="min-h-screen bg-[var(--color-bg)]">
      {/* Hero Header */}
      <header className="relative pt-16 pb-20 lg:pt-24 lg:pb-28 overflow-hidden border-b border-white/15">
        <div className="container relative">
          {/* Architectural hairline grid background */}
          <div className="absolute inset-0 pointer-events-none -z-10" aria-hidden="true">
            <div className="absolute inset-0 flex justify-between">
              {[...Array(24)].map((_, i) => (
                <div key={i} className="w-px h-full bg-white/5" style={{ left: `${i / 24 * 100}%` }} />
              ))}
            </div>
            <div className="absolute inset-0 flex flex-col justify-between">
              {[...Array(16)].map((_, i) => (
                <div key={i} className="h-px w-full bg-white/5" style={{ top: `${i / 16 * 100}%` }} />
              ))}
            </div>
          </div>

          <div className="relative max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="font-mono text-xs text-white/30 tracking-wider uppercase block mb-6">[ 03 / PRICING ]</span>
            </motion.div>

            <motion.h1
              className="font-heading font-extrabold text-white uppercase tracking-[-0.03em] leading-[0.92] text-[clamp(2.2rem,5.8vw,6rem)] break-words max-w-full mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            >
              <span>Architectural</span>
              <br />
              <span>tiers for</span>
              <br />
              <span>every practice</span>
            </motion.h1>

            <motion.p
              className="font-[Instrument_Serif] italic font-light text-white/50 leading-relaxed tracking-[0.01em] text-[clamp(1.125rem,2vw,1.5rem)] max-w-2xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            >
              Three precise tiers. Zero hidden fees. Upgrade or downgrade anytime.
            </motion.p>
          </div>
        </div>
      </header>

      {/* Tiers Grid - Swiss Architectural Index */}
      <main className="container pb-16 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {tiers.map((tier, i) => (
            <TierCard key={tier.id} tier={tier} index={i} scrollProgress={scrollYProgress} />
          ))}
        </div>

        {/* Detail Accordion */}
        <section className="mt-16 lg:mt-24 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            className="border border-white/15 overflow-hidden"
          >
            <details className="group border-b border-white/10">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <span className="font-heading font-medium text-white text-lg">What payment methods are accepted?</span>
                <svg className="w-5 h-5 text-white/30 group-open:rotate-180 transition-transform duration-300 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-white/50 leading-relaxed font-[Instrument_Serif] italic">
                All major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for annual Enterprise plans.
              </div>
            </details>
            <details className="group border-b border-white/10">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <span className="font-heading font-medium text-white text-lg">Can I change tiers later?</span>
                <svg className="w-5 h-5 text-white/30 group-open:rotate-180 transition-transform duration-300 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-white/50 leading-relaxed font-[Instrument_Serif] italic">
                Yes. Upgrades take effect immediately with prorated billing. Downgrades apply at the start of your next billing cycle.
              </div>
            </details>
            <details className="group border-b border-white/10">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <span className="font-heading font-medium text-white text-lg">What happens when I exceed my bid limit?</span>
                <svg className="w-5 h-5 text-white/30 group-open:rotate-180 transition-transform duration-300 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-white/50 leading-relaxed font-[Instrument_Serif] italic">
                Independent tier: new bids pause until the weekly reset. Studio and Enterprise tiers have unlimited bids.
              </div>
            </details>
            <details className="group">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <span className="font-heading font-medium text-white text-lg">Is there a trial for Studio tier?</span>
                <svg className="w-5 h-5 text-white/30 group-open:rotate-180 transition-transform duration-300 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-white/50 leading-relaxed font-[Instrument_Serif] italic">
                Yes. New Studio subscribers receive a 14-day trial. No credit card required to start. Cancel anytime during the trial.
              </div>
            </details>
          </motion.div>
        </section>
      </main>
    </div>
  );
}

export { PricingPage as default };