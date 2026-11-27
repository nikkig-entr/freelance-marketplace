'use client';

import { Link, useLocation } from '@tanstack/react-router';
import { clsx } from 'clsx';

const footerNav = [
  { name: 'PROJECTS', href: '/projects' },
  { name: 'TALENT', href: '/talent' },
  { name: 'PRICING', href: '/pricing' },
  { name: 'SIGN IN', href: '/login' },
];

export function Footer() {
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/15 bg-[#050505]" data-lenis-prevent>
      <div className="container py-16 lg:py-24">
        {/* CTA Section */}
        <div className="max-w-3xl mb-16 lg:mb-24">
          <p className="font-[Instrument_Serif] italic font-light text-[var(--color-text-muted)] leading-relaxed tracking-[0.01em] text-[clamp(1.125rem,2vw,1.5rem)] mb-8">
            Ready to build something exceptional? The archive is open. Your next project starts here.
          </p>
          <Link
            to="/projects/create"
            className="inline-flex items-center justify-center gap-2 border border-white px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors rounded-none"
          >
            START PROJECT →
          </Link>
        </div>

        {/* Monumental FREELANCEHUB wordmark */}
        <div className="mb-12 lg:mb-16">
          <span className="font-['Syne'] font-bold uppercase leading-[0.85] border-b border-white/15 pb-6 block text-[clamp(4rem,11.2vw,14rem)] tracking-[-0.04em] text-[var(--color-text)]">
            FREELANCEHUB
          </span>
        </div>

        {/* Bottom Navigation Row */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pt-8 border-t border-white/15">
          {/* Navigation Links */}
          <nav className="flex flex-wrap items-center justify-center lg:justify-start gap-6 lg:gap-8" aria-label="Footer navigation">
            {footerNav.map((item) => {
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    'font-mono text-xs uppercase tracking-wider transition-colors',
                    isActive ? 'text-[var(--color-white)]' : 'text-[var(--color-text-subtle)] hover:text-[var(--color-white)]'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Copyright */}
          <div className="text-center lg:text-right">
            <p className="font-mono text-xs text-[var(--color-text-subtle)] tracking-wider">
              © {currentYear} FreelanceHub. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export { Footer as default };