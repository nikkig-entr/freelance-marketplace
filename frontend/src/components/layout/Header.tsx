import { Link, useLocation } from '@tanstack/react-router';
import { Transition } from '@headlessui/react';
import { clsx } from 'clsx';
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { Briefcase, Cpu, Layers } from 'lucide-react';
import { UserMenu } from '@/components/ui/Dropdown';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/contexts/AuthContext';
import React from 'react';

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
  badge?: string;
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
  { name: 'Projects', href: '/projects', icon: Briefcase, roles: ['freelancer', 'client', 'admin'] },
  { name: 'Talent', href: '/talent', icon: UserCircleIcon, roles: ['freelancer', 'client', 'admin'] },
  { name: 'AI Tools', href: '/ai-tools', icon: Cpu, roles: ['freelancer', 'client', 'admin'] },
  { name: 'Pricing', href: '/pricing', icon: Layers, roles: ['freelancer', 'client', 'admin'] },
];

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
            <Link to="/" className="flex items-center gap-2" aria-label="FreelanceHub Home">
              <div className="w-9 h-9 rounded-xl bg-[var(--color-accent)] flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-[var(--color-text-inverse)]" />
              </div>
              <span className="font-heading font-bold text-xl text-[var(--color-text)] hidden sm:block">
                FreelanceHub
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              {navigation
                .filter((item) => !user || item.roles.includes(user.role))
                .map((item) => {
                  const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={clsx(
                        'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)]/30'
                          : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--glass-bg)]'
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon className="w-5 h-5" aria-hidden="true" />
                      {item.name}
                      {item.badge && (
                        <Badge variant="danger" size="sm">{item.badge}</Badge>
                      )}
                    </Link>
                  );
                })}
            </nav>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="hidden lg:block relative">
              <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-subtle)]" />
              <input
                type="search"
                placeholder="Search projects, skills..."
                className="w-72 pl-11 pr-4 py-2.5 rounded-xl glass text-[var(--color-text)] placeholder-[var(--color-text-subtle)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] transition-all duration-200"
                aria-label="Search"
              />
            </div>

            {/* Notifications */}
            <button
              type="button"
              className="p-2.5 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--glass-bg)] transition-colors"
              aria-label="Notifications"
            >
              <BellIcon className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--color-accent)] rounded-full" />
            </button>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="md:hidden p-2.5 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--glass-bg)] transition-colors"
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
              <div className="flex items-center gap-3 px-3 py-2">
                <MagnifyingGlassIcon className="w-5 h-5 text-[var(--color-text-subtle)]" />
                <input
                  type="search"
                  placeholder="Search projects, skills..."
                  className="flex-1 py-2.5 rounded-xl glass text-[var(--color-text)] placeholder-[var(--color-text-subtle)] text-sm border-0 focus:outline-none"
                />
              </div>
              {navigation
                .filter((item) => !user || item.roles.includes(user.role))
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={clsx(
                        'flex items-center gap-3 px-3 py-3 rounded-xl text-base font-medium transition-colors',
                        location.pathname === item.href
                          ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)]/30'
                          : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--glass-bg)]'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  );
                })}
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
                        <span className="text-[var(--color-accent)] font-medium">
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
                              'w-full flex items-center gap-3 px-3 py-3 rounded-xl text-base font-medium transition-colors',
                              item.danger ? 'text-[var(--color-gray-500)] hover:bg-[var(--color-gray-800)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--glass-bg)]'
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