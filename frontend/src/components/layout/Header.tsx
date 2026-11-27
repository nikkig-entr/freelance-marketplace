'use client';

import { Link, useLocation } from '@tanstack/react-router';
import { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { XMarkIcon, Bars3Icon } from '@heroicons/react/24/outline';
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
        className="flex items-center gap-3 transition-transform duration-300 ease-[cubic-bezier(0.76,0,0.24,1)]"
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
        className="absolute left-0 top-full flex items-center gap-3 transition-transform duration-300 ease-[cubic-bezier(0.76,0,0.24,1)]"
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

  return (
    <header className="h-16 fixed top-0 w-full z-50 border-b border-white/15 bg-[#050505]/90 backdrop-blur-md">
      <div className="container h-full">
        <div className="flex h-full items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2" aria-label="Home">
              <span className="font-mono text-xs tracking-[0.25em] uppercase text-[var(--color-text)]">
                FREELANCEHUB
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={clsx(
                      'flex items-center gap-3 px-4 py-2.5 rounded-none text-sm font-medium transition-all duration-200',
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

          {/* Right Side - START PROJECT button */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              type="button"
              className="md:hidden p-2.5 rounded-none text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--glass-bg)] transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>

            {/* START PROJECT Button */}
            <Link
              to="/projects/create"
              className="hidden sm:inline-flex items-center justify-center gap-2 border border-white px-5 py-2 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors rounded-none"
            >
              START PROJECT
            </Link>

            {/* Mobile START PROJECT */}
            <Link
              to="/projects/create"
              className="sm:hidden inline-flex items-center justify-center gap-2 border border-white px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors rounded-none"
            >
              START PROJECT
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/15 bg-[#050505]/95 backdrop-blur-[40px] animate-slide-down">
          <div className="px-4 py-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={clsx(
                  'flex items-center gap-3 px-3 py-3 rounded-none text-base font-medium transition-colors uppercase tracking-[0.1em]',
                  location.pathname === item.href
                    ? 'text-[var(--color-white)] bg-[var(--glass-bg)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-white)] hover:bg-[var(--glass-bg)]'
                )}
              >
                <span className="font-mono text-[var(--color-text-subtle)] text-xs tracking-wider w-8 shrink-0">
                  {item.index}
                </span>
                {item.name}
              </Link>
            ))}
            {!isAuthenticated && (
              <div className="pt-4 space-y-2 border-t border-white/15">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn-secondary btn-lg w-full">
                  SIGN IN
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn-primary btn-lg w-full">
                  START PROJECT
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export { Header as default };