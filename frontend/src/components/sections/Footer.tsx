'use client';

import { Link, useLocation } from '@tanstack/react-router';
import { clsx } from 'clsx';
import { DualLayerTextRoll } from '@/components/motion/DualLayerTextRoll';
import { BrandLogo } from '@/components/ui/BrandLogo';

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
      <div className="w-full">
        {/* Top CTA Band */}
        <div className="px-4 md:px-8 pt-16 md:pt-24 pb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <p className="font-[Instrument_Serif] italic font-light text-[var(--color-text-muted)] leading-relaxed tracking-[0.01em] text-[clamp(1.125rem,2vw,1.5rem)] max-w-md">
            Commission an independent team.
          </p>
          <Link
            to="/projects/create"
            className="inline-flex items-center justify-center gap-2 border border-white px-7 py-3.5 font-mono text-xs uppercase tracking-[0.22em] hover:bg-white hover:text-black transition-colors min-h-[48px] w-full sm:w-auto"
          >
            POST A BRIEF
          </Link>
        </div>

        {/* Edge-to-edge monumental wordmark with BrandLogo - responsive SVG with zero clipping */}
        <div className="px-4 md:px-8 border-b border-white/15 pb-6 flex items-center justify-center gap-4">
          <BrandLogo size={48} showWordmark={false} className="flex-shrink-0" />
          <svg
            viewBox="0 0 1400 150"
            className="w-full h-auto block select-none flex-1"
            aria-label="FREELANCEHUB"
            role="img"
          >
            <text
              x="50%"
              y="84%"
              textAnchor="middle"
              textLength="1392"
              lengthAdjust="spacingAndGlyphs"
              fill="#FFFFFF"
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: '146px',
                letterSpacing: '-0.03em',
              }}
            >
              FREELANCEHUB
            </text>
          </svg>
        </div>

        {/* Bottom hairline bar */}
        <div className="px-4 md:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
          {/* Copyright */}
          <div className="flex-shrink-0">
            <p className="text-neutral-500">
              © {currentYear} FREELANCEHUB ARCHIVE
            </p>
          </div>

          {/* Navigation Links with DualLayerTextRoll */}
          <nav className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-6" aria-label="Footer navigation">
            {footerNav.map((item) => {
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    'transition-colors',
                    isActive ? 'text-white' : 'text-neutral-500 hover:text-white'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <DualLayerTextRoll index=" " className="whitespace-nowrap">
                    {item.name}
                  </DualLayerTextRoll>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </footer>
  );
}

export { Footer as default };