'use client';

import { Link, useLocation } from '@tanstack/react-router';
import { Transition } from '@headlessui/react';
import { clsx } from 'clsx';
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { UserMenu } from '@/components/ui/Dropdown';
import { useAuth } from '@/contexts/AuthContext';
import React, { useState, useRef, useEffect } from 'react';

type NavItem = {
  name: string;
  href: string;
  roles: string[];
  index: string;
};

type UserNavItem = {
  name?: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  divider?: boolean;
  onClick?: () => void;
  danger?: boolean;
};

const navigation: NavItem[] = [
  { name: 'Projects', href: '/projects', roles: ['freelancer', 'client', 'admin'], index: '01' },
  { name: 'Talent', href: '/talent', roles: ['freelancer', 'client', 'admin'], index: '02' },
  { name: 'AI Tools', href: '/ai-tools', roles: ['freelancer', 'client', 'admin'], index: '03' },
  { name: 'Pricing', href: '/pricing', roles: ['freelancer', 'client', 'admin'], index: '04' },
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
        <span className="font-mono text-[var(--color-text-subtle)] text-sm tracking-wider">
          {index}
        </span>
        <span className="font-heading font-medium text-[var(--color-text)]">
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
        <span className="font-mono text-[var(--color-white)] text-sm tracking-wider">
          {index}
        </span>
        <span className="font-heading font-medium text-[var(--color-white)]">
          {children}
        </span>
      </div>
    </div>
  );
}

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const userNavigation: UserNavItem[] = [
    { name: 'Profile', href: '/profile', icon: UserCircleIcon },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
    { divider: true },
    { name: 'Log out', icon: ArrowRightOnRectangleIcon, onClick: logout, danger: true },
  ];

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-[20px]">
      <div className="container">
        <div className="flex h-18 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2" aria-label="Home">
              <span className="font-heading font-extrabold text-xl text-[var(--color-text)] tracking-[-0.02em]">
                FREELANCE
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              {navigation
                .filter((item) => !user || item.roles.includes(user.role))
                .map((item) => {
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

          {/* Right Side - Minimal */}
          <div className="flex items-center gap-3">
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

            {/* User Menu */}
            {isAuthenticated && user && (
              <UserMenu
                user={{
                  name: user.full_name || user.email.split('@')[0],
                  email: user.email,
                  avatar: user.avatar_url ?? undefined,
                  plan: user.plan,
                }}
                onProfileClick={() => window.location.href = '/profile'}
                onSettingsClick={() => window.location.href = '/settings'}
                onLogout={handleLogout}
              />
            )}

            {/* Guest Actions */}
            {!isAuthenticated && (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="btn-ghost btn-sm">
                  Log In
                </Link>
                <Link to="/register" className="btn-primary btn-sm">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <Transition
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 transform -translate-y-2"
          enterTo="opacity-100 transform translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 transform translate-y-0"
          leaveTo="opacity-0 transform -translate-y-2"
        >
          <div id="mobile-menu" className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur-[40px] animate-slide-down">
            <div className="px-4 py-4 space-y-2">
              {navigation
                .filter((item) => !user || item.roles.includes(user.role))
                .map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-3 rounded-none text-base font-medium transition-colors',
                      location.pathname === item.href
                        ? 'text-[var(--color-white)] bg-[var(--glass-bg)]'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-white)] hover:bg-[var(--glass-bg)]'
                    )}
                  >
                    <span className="font-mono text-[var(--color-text-subtle)] text-sm tracking-wider">
                      {item.index}
                    </span>
                    {item.name}
                  </Link>
                ))}
              {!isAuthenticated && (
                <div className="pt-4 space-y-2 border-t border-[var(--color-border)]">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn-secondary btn-lg w-full">
                    Log In
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn-primary btn-lg w-full">
                    Get Started
                  </Link>
                </div>
              )}
              {isAuthenticated && user && (
                <div className="pt-4 border-t border-[var(--color-border)]">
                  <div className="flex items-center gap-3 px-3 py-3">
                    <div className="w-11 h-11 rounded-full glass flex items-center justify-center">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-[var(--color-white)] font-medium">
                          {user.full_name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--color-text)]">{user.full_name || user.email.split('@')[0]}</p>
                      <p className="text-sm text-[var(--color-text-muted)] capitalize">{user.plan} Plan</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-1">
                    {userNavigation
                      .filter((item): item is UserNavItem & { name: string; icon: React.ComponentType<{ className?: string }> } => !item.divider && !!item.icon)
                      .map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => {
                              if (item.onClick) item.onClick();
                              else setMobileMenuOpen(false);
                            }}
                            className={clsx(
                              'w-full flex items-center gap-3 px-3 py-3 rounded-none text-base font-medium transition-colors',
                              item.danger ? 'text-[var(--color-gray-500)] hover:bg-[var(--color-gray-800)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-white)] hover:bg-[var(--glass-bg)]'
                            )}
                          >
                            <Icon className="w-5 h-5" />
                            {item.name}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Transition>
      )}
    </header>
  );
}