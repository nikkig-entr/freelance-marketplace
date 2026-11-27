import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useState, useEffect } from 'react';
import {
  HomeIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  PlusIcon,
  Bars3Icon,
  XMarkIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';

const navigation = [
  { name: 'Projects', href: '/projects', icon: Briefcase, roles: ['client', 'freelancer', 'admin'] },
  { name: 'My Projects', href: '/projects/my', icon: DocumentTextIcon, roles: ['client', 'admin'] },
  { name: 'My Bids', href: '/my/bids', icon: Briefcase, roles: ['freelancer'] },
  { name: 'Chat', href: '/chat', icon: ChatBubbleLeftRightIcon, roles: ['client', 'freelancer', 'admin'] },
  { name: 'Balance', href: '/balance', icon: CurrencyDollarIcon, roles: ['freelancer', 'admin'] },
  { name: 'Billing', href: '/billing', icon: CurrencyDollarIcon, roles: ['client', 'freelancer', 'admin'] },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, roles: ['client', 'freelancer', 'admin'] },
];

const adminNavigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Users', href: '/admin/users', icon: UserCircleIcon },
  { name: 'Projects', href: '/admin/projects', icon: Briefcase },
  { name: 'Withdrawals', href: '/admin/withdrawals', icon: CurrencyDollarIcon },
  { name: 'Transactions', href: '/admin/transactions', icon: DocumentTextIcon },
];

export function Header() {
  const { user, logout, isLoading } = useAuth();
  useWebSocket(); // Keep connection alive
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const filteredNavigation = navigation.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token' && !e.newValue) {
        navigate({ to: '/login' });
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
    navigate({ to: '/login' });
  };

  if (isLoading) {
    return (
      <header className="h-16 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-[var(--glass-blur-strong)] sticky top-0 z-40">
        <div className="container h-full flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[var(--color-border)] border-t-[var(--color-white)] rounded-full animate-spin" />
        </div>
      </header>
    );
  }

  return (
    <header className="h-16 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-[var(--glass-blur-strong)] sticky top-0 z-40">
      <div className="container h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="FreelanceHub Home">
            <div className="w-8 h-8 bg-[var(--color-white)] rounded-none flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-[var(--color-text-inverse)]" aria-hidden="true" />
            </div>
            <span className="text-xl font-heading font-bold text-[var(--color-text)]">FreelanceHub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors rounded-none ${
                    isActive
                      ? 'text-[var(--color-text)] bg-[var(--color-white)]/10'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--glass-bg)]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon className="w-4 h-4" aria-hidden="true" />
                  {item.name}
                </Link>
              );
            })}

            {user?.role === 'admin' && (
              <div className="flex items-center gap-1 border-l border-[var(--color-border)] pl-4 ml-2">
                <span className="text-xs font-semibold text-[var(--color-text-subtle)] uppercase tracking-wider px-2">Admin</span>
                {adminNavigation.map((item) => {
                  const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors rounded-none ${
                        isActive
                          ? 'text-[var(--color-text)] bg-[var(--color-white)]/10'
                          : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--glass-bg)]'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <item.icon className="w-4 h-4" aria-hidden="true" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Create Project Button */}
            {user && (user.role === 'client' || user.role === 'admin') && (
              <Link to="/projects/create" className="hidden sm:flex items-center gap-2">
                <Button variant="primary" size="sm" leftIcon={<PlusIcon className="w-4 h-4" />}>
                  New Project
                </Button>
              </Link>
            )}

            {/* User Menu */}
            {user ? (
              <Dropdown
                trigger={
                  <button
                    className="flex items-center gap-2 p-1.5 hover:bg-[var(--glass-bg)] rounded-none transition-colors"
                    aria-label="User menu"
                  >
                    <div className="w-8 h-8 rounded-full glass-strong flex items-center justify-center">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                      ) : (
                        <UserCircleIcon className="w-5 h-5 text-[var(--color-white)]" />
                      )}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-[var(--color-text)]">{user.full_name || user.email}</span>
                  </button>
                }
                items={[
                  {
                    label: 'Profile',
                    icon: <UserCircleIcon className="w-5 h-5" />,
                    onClick: () => navigate({ to: `/profile/$userId`, params: { userId: String(user.id) } }),
                  },
                  {
                    label: 'Settings',
                    icon: <Cog6ToothIcon className="w-5 h-5" />,
                    onClick: () => navigate({ to: '/settings' }),
                  },
                  {
                    label: 'Billing',
                    icon: <CurrencyDollarIcon className="w-5 h-5" />,
                    onClick: () => navigate({ to: '/billing' }),
                  },
                  ...(user.role === 'admin'
                    ? [
                        {
                          label: 'Admin Panel',
                          icon: <ShieldCheckIcon className="w-5 h-5" />,
                          onClick: () => navigate({ to: '/admin' }),
                        },
                        { divider: true } as any,
                      ]
                    : []),
                  { divider: true } as any,
                  {
                    label: 'Sign out',
                    icon: <ArrowRightOnRectangleIcon className="w-5 h-5" />,
                    onClick: handleLogout,
                  },
                ]}
                align="right"
              />
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="hidden sm:block">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">Get Started</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--glass-bg)] rounded-none transition-colors"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-drawer"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Fullscreen Swiss Drawer */}
      {isMobileMenuOpen && (
        <div
          id="mobile-drawer"
          className="lg:hidden fixed inset-0 z-50 bg-[var(--color-bg)] animate-in"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div className="flex flex-col h-full">
            {/* Drawer Header */}
            <div className="flex items-center justify-between h-16 px-6 border-b border-[var(--color-border)]">
              <Link to="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="w-8 h-8 bg-[var(--color-white)] rounded-none flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-[var(--color-text-inverse)]" aria-hidden="true" />
                </div>
                <span className="text-xl font-heading font-bold text-[var(--color-text)]">FreelanceHub</span>
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--glass-bg)] rounded-none transition-colors"
                aria-label="Close menu"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Drawer Navigation */}
            <nav className="flex-1 overflow-y-auto px-6 py-6 space-y-1" aria-label="Mobile navigation">
              {filteredNavigation.map((item) => {
                const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-none text-base font-medium transition-colors ${
                      isActive
                        ? 'text-[var(--color-text)] bg-[var(--color-white)]/10'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--glass-bg)]'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <item.icon className="w-5 h-5" aria-hidden="true" />
                    {item.name}
                  </Link>
                );
              })}

              {user?.role === 'admin' && (
                <div className="pt-4 border-t border-[var(--color-border)]">
                  <span className="px-4 text-xs font-semibold text-[var(--color-text-subtle)] uppercase tracking-wider block mb-3">Admin</span>
                  {adminNavigation.map((item) => {
                    const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-none text-base font-medium transition-colors ${
                          isActive
                            ? 'text-[var(--color-text)] bg-[var(--color-white)]/10'
                            : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--glass-bg)]'
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <item.icon className="w-5 h-5" aria-hidden="true" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}

              {user && (
                <div className="pt-6 border-t border-[var(--color-border)]">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-none text-base font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--glass-bg)] transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    Sign out
                  </button>
                </div>
              )}
            </nav>

            {/* Drawer Footer - CTA for non-authenticated */}
            {!user && (
              <div className="p-6 border-t border-[var(--color-border)] space-y-3">
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full" size="lg">
                    Get Started
                  </Button>
                </Link>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full" size="lg">
                    Sign in
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}