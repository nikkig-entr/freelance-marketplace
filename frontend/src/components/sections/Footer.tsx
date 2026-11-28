'use client';

import { Link, useLocation } from '@tanstack/react-router';
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
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg)]" data-lenis-prevent>
      <div className="w-full">
        {/* Top CTA Band */}
        <div className="px-4 md:px-8 pt-16 md:pt-24 pb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <p className="font-editorial italic font-light text-[var(--color-text-muted)] leading-relaxed tracking-[0.01em] text-[clamp(1.125rem,2vw,1.5rem)] max-w-md">
            Commission an independent team.
          </p>
          <Link
            to="/projects/create"
            className="inline-flex items-center justify-center gap-2 border border-[var(--color-white)] px-7 py-3.5 font-mono text-xs uppercase tracking-[0.22em] text-[var(--color-text)] hover:bg-[var(--color-white)] hover:text-[var(--color-bg)] transition-all duration-300 min-h-[48px] w-full sm:w-auto"
          >
            POST A BRIEF
          </Link>
        </div>

        {/* Edge-to-edge monumental wordmark with BrandLogo - responsive SVG with zero clipping */}
        <div className="px-4 md:px-8 border-b border-[var(--color-border)] pb-6 flex items-center justify-center gap-4">
          <BrandLogo size={48} strokeWidth={2} className="flex-shrink-0" />
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
                fontFamily: "'Unbounded', 'Syne', sans-serif",
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
        <div className="px-4 md:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-text-subtle)]">
          {/* Copyright */}
          <div className="flex-shrink-0">
            <p className="text-[var(--color-text-subtle)]">
              © {currentYear} FREELANCEHUB ARCHIVE
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-6" aria-label="Footer navigation">
            {footerNav.map((item) => {
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`transition-colors ${isActive ? 'text-[var(--color-white)]' : 'text-[var(--color-text-subtle)] hover:text-[var(--color-white)]'}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="font-mono text-xs uppercase tracking-[0.22em] whitespace-nowrap">
                    {item.name}
                  </span>
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