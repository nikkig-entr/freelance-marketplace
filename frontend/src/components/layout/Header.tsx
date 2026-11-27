'use client';

import { Link, useLocation } from '@tanstack/react-router';
import { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

const navigation = [
  { name: 'PROJECTS', href: '/projects', index: '01' },
  { name: 'TALENT', href: '/talent', index: '02' },
  { name: 'PRICING', href: '/pricing', index: '03' },
  { name: 'SIGN IN', href: '/login', index: '04' },
];

function DualLayerTextRoll({
  children,
  index,
}: {
  children: React.ReactNode;
  index: string;
}) {
  const [isHovering, setIsHovering] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="relative overflow-hidden inline-block"
      style={{ perspective: '400px' }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Layer 1 - Default text */}
      <div
        className="flex items-center gap-3 transition-transform duration-360 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          transform: isHovering ? 'translateY(-100%) rotateX(-90deg)' : 'translateY(0) rotateX(0)',
          transformOrigin: 'center bottom',
          opacity: isHovering ? 0 : 1,
        }}
      >
        <span className="font-mono text-[var(--color-text-subtle)] text-xs tracking-wider">
          {index}
        </span>
        <span className="font-heading font-medium text-[var(--color-text-muted)] uppercase tracking-[0.1em]">
          {children}
        </span>
      </div>

      {/* Layer 2 - Hover text (same content, comes from top) */}
      <div
        className="absolute left-0 top-full flex items-center gap-3 transition-transform duration-360 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          transform: isHovering ? 'translateY(-100%) rotateX(0)' : 'translateY(0) rotateX(90deg)',
          transformOrigin: 'center top',
          opacity: isHovering ? 1 : 0,
          whiteSpace: 'nowrap',
        }}
      >
        <span className="font-mono text-[var(--color-white)] text-xs tracking-wider">
          {index}
        </span>
        <span className="font-heading font-medium text-[var(--color-white)] uppercase tracking-[0.1em]">
          {children}
        </span>
      </div>
    </div>
  );
}

export function Header() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <header className="h-16 fixed top-0 left-0 right-0 z-40 px-4 md:px-8 flex items-center justify-between border-b border-white/15 bg-[#050505]/90 backdrop-blur-md">
      {/* Left: Logo */}
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2" aria-label="Home">
          <span className="font-mono text-xs tracking-[0.24em] md:tracking-[0.28em] uppercase text-[var(--color-text)]">
            FREELANCEHUB
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                to={item.href}
                className={clsx(
                  'flex items-center gap-3 transition-all duration-200',
                  isActive
                    ? 'text-[var(--color-white)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-white)]'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <DualLayerTextRoll index={item.index}>
                  {item.name}
                </DualLayerTextRoll>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          type="button"
          className="flex md:hidden min-h-[44px] px-3 border border-white/25 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-text-muted)] hover:text-[var(--color-white)] hover:border-white/50 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu-drawer"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? (
            <XMarkIcon className="w-5 h-5" />
          ) : (
            <>
              <span>MENU</span>
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 border border-current rounded-none">
                <PlusIcon className="w-3 h-3" />
              </span>
            </>
          )}
        </button>

        {/* Desktop START PROJECT Button */}
        <Link
          to="/projects/create"
          className="hidden md:inline-flex items-center justify-center gap-2 border border-white px-5 py-2 font-mono text-[11px] uppercase tracking-[0.22em] hover:bg-white hover:text-black transition-colors"
        >
          START PROJECT
        </Link>
      </div>

      {/* Mobile Full-Screen Swiss Architectural Drawer */}
      {mobileMenuOpen && (
        <div
          ref={drawerRef}
          id="mobile-menu-drawer"
          className="fixed inset-0 z-50 h-[100dvh] bg-[#050505] flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          {/* Drawer Header */}
          <div className="h-16 px-4 md:px-8 flex items-center justify-between border-b border-white/15">
            <span className="font-mono text-xs tracking-[0.24em] uppercase text-[var(--color-text-muted)]">
              FREELANCEHUB
            </span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-white)] transition-colors"
              aria-label="Close menu"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links - Large Stacked Rows */}
          <nav className="flex-1 px-4 md:px-8 py-8 md:py-12 flex flex-col justify-center gap-0 overflow-y-auto" aria-label="Main navigation">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={clsx(
                    'relative flex items-center min-h-[80px] px-0 py-4 border-b border-white/15 transition-colors',
                    isActive
                      ? 'text-[var(--color-white)]'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-white)]'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="font-mono text-[var(--color-text-subtle)] text-xs tracking-wider w-10 shrink-0">
                    {item.index}
                  </span>
                  <span className="font-heading font-medium text-2xl md:text-3xl lg:text-4xl uppercase tracking-[0.08em]">
                    {item.name}
                  </span>
                  {isActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-white" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Full-Width START PROJECT CTA at Bottom */}
          {!isAuthenticated && (
            <div className="px-4 md:px-8 pb-8 md:pb-12 border-t border-white/15 pt-6">
              <Link
                to="/projects/create"
                onClick={() => setMobileMenuOpen(false)}
                className="block min-h-[56px] w-full flex items-center justify-center gap-3 border-2 border-white font-mono text-sm uppercase tracking-[0.18em] hover:bg-white hover:text-black transition-all duration-200"
              >
                START PROJECT
              </Link>
              <div className="mt-4 text-center">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-mono text-xs text-[var(--color-text-muted)] hover:text-[var(--color-white)] transition-colors uppercase tracking-wider"
                >
                  Already have an account? Sign in
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export { Header as default };