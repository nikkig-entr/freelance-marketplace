'use client';

import { Link } from '@tanstack/react-router';
import { MonumentalHeadline } from '@/components/ui/MonumentalHeadline';

export function CTASection() {
  return (
    <section className="relative py-20 lg:py-32 border-t border-[var(--color-border)]" data-lenis-prevent>
      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 glass px-5 py-2.5 border border-[var(--color-border)]">
              <span className="font-mono text-xs text-[var(--color-text-subtle)] tracking-wider uppercase">Ready to begin</span>
            </span>
          </div>

          {/* Monumental Headline */}
          <MonumentalHeadline
            splitBy="lines"
            delay={0.2}
            stagger={0.1}
            duration={1.2}
            ease={[0.76, 0, 0.24, 1] as const}
            maskAnimation={true}
            className="mb-8"
          >
            Your Next Project<br />Starts Here
          </MonumentalHeadline>

          {/* Editorial subtext */}
          <p className="font-editorial italic font-light text-[var(--color-text-muted)] leading-relaxed tracking-[0.01em] max-w-2xl mx-auto mb-12" style={{ fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)' }}>
            Join 50,000+ freelancers and clients building the future of work. No credit card. No risk. Just results.
          </p>

          {/* Dual CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary btn-lg flex-1 sm:flex-none min-w-[200px]">
              Create Free Account
            </Link>
            <Link to="/projects" className="btn-secondary btn-lg flex-1 sm:flex-none min-w-[200px]">
              Browse Projects
            </Link>
          </div>

          {/* Trust line */}
          <div className="mt-16 pt-8 border-t border-[var(--color-border)]">
            <p className="font-mono text-xs text-[var(--color-text-subtle)] tracking-wider uppercase">
              Trusted by teams at leading companies worldwide
            </p>
            <div className="flex items-center justify-center gap-8 lg:gap-12 mt-8 opacity-40">
              {['Acme Corp', 'Globex', 'Wayne Enterprises', 'Stark Industries', 'Umbrella Corp'].map((name, i) => (
                <span key={i} className="font-mono text-xs text-[var(--color-text-subtle)] tracking-wider">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export { CTASection as default };