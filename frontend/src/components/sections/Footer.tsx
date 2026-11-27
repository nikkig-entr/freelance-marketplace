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
      <div className="container py-16 md:py-20 lg:py-24">
        {/* Top CTA Band */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16 lg:mb-20">
          <p className="font-[Instrument_Serif] italic font-light text-[var(--color-text-muted)] leading-relaxed tracking-[0.01em] text-[clamp(1.125rem,2vw,1.5rem)] max-w-md">
            Commission an independent team.
          </p>
          <Link
            to="/projects/create"
            className="inline-flex items-center justify-center gap-2 border border-white px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors min-h-[48px] w-full sm:w-auto"
          >
            POST A BRIEF
          </Link>
        </div>

        {/* Monumental FREELANCEHUB wordmark - edge-to-edge, responsive */}
        <div className="mb-12 lg:mb-16 overflow-hidden">
          <span className="font-['Syne'] font-bold uppercase leading-[0.85] border-b border-white/15 pb-6 block text-[clamp(4rem,9vw,14rem)] tracking-[-0.04em] text-[var(--color-text)] whitespace-nowrap overflow-hidden">
            FREELANCEHUB
          </span>
        </div>

        {/* Bottom Navigation Row - Responsive hairline nav */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pt-8 border-t border-white/15">
          {/* Navigation Links */}
          <nav className="flex flex-wrap items-center justify-center lg:justify-start gap-4 lg:gap-8" aria-label="Footer navigation">
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
          <div className="text-center lg:text-right flex-shrink-0">
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