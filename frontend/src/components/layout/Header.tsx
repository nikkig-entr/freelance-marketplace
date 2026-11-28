import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useState, useEffect } from 'react';
import { ArrowRightOnRectangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { DualLayerTextRoll } from '@/components/motion/DualLayerTextRoll';

const navigation = [
  { index: '01', name: 'PROJECTS', href: '/projects', roles: ['client', 'freelancer', 'admin'] },
  { index: '02', name: 'TALENT', href: '/talent', roles: ['client', 'freelancer', 'admin'] },
  { index: '03', name: 'PRICING', href: '/pricing', roles: ['client', 'freelancer', 'admin'] },
  { index: '04', name: 'SIGN IN', href: '/login', roles: ['client', 'freelancer', 'admin'] },
];

const adminNavigation = [
  { name: 'Dashboard', href: '/admin', icon: Briefcase },
  { name: 'Users', href: '/admin/users', icon: Briefcase },
  { name: 'Projects', href: '/admin/projects', icon: Briefcase },
  { name: 'Withdrawals', href: '/admin/withdrawals', icon: Briefcase },
  { name: 'Transactions', href: '/admin/transactions', icon: Briefcase },
];

export function Header() {
  const { user, logout, isLoading } = useAuth();
  useWebSocket(); // Keep connection alive
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const filteredNavigation = navigation.filter((item) =>
    user ? item.roles.includes(user.role) : true
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
      <header className="h-16 border-b border-white/15 bg-[#050505]/90 backdrop-blur-md fixed top-0 left-0 right-0 z-40">
        <div className="container h-full flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/15 border-t-white rounded-none animate-spin" />
        </div>
      </header>
    );
  }

  return (
    <header className="h-16 border-b border-white/15 bg-[#050505]/90 backdrop-blur-md fixed top-0 left-0 right-0 z-40">
      <div className="container h-full">
        <div className="flex items-center justify-between h-full">
          {/* Left: uppercase FREELANCEHUB */}
          <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="FREELANCEHUB Home">
            <div className="w-8 h-8 bg-white rounded-none flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-black" aria-hidden="true" />
            </div>
            <span className="font-mono text-xs font-bold tracking-[0.28em] uppercase text-white">
              FREELANCEHUB
            </span>
          </Link>

          {/* Desktop Right Navigation */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-mono uppercase tracking-[0.22em] transition-colors ${
                    isActive
                      ? 'text-white'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <DualLayerTextRoll index={item.index} className="whitespace-nowrap">
                    {item.name}
                  </DualLayerTextRoll>
                </Link>
              );
            })}

            {user?.role === 'admin' && (
              <div className="flex items-center gap-1 border-l border-white/15 pl-4 ml-2">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-2">Admin</span>
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

            {/* Start Project CTA - Sharp rectangular button */}
            {(user && (user.role === 'client' || user.role === 'admin')) || !user ? (
              <Link
                to={user ? '/projects/create' : '/register'}
                className="border border-white px-5 py-2 font-mono text-[11px] uppercase tracking-[0.22em] hover:bg-white hover:text-black transition-colors"
              >
                START PROJECT
              </Link>
            ) : null}
          </nav>

          {/* Right Side Actions - User Menu / Mobile Toggle */}
          <div className="flex items-center gap-3">
            {/* User Menu - Desktop */}
            {user ? (
              <Dropdown
                trigger={
                  <button
                    className="flex items-center gap-2 p-1.5 hover:bg-[var(--glass-bg)] rounded-none transition-colors min-h-[44px]"
                    aria-label="User menu"
                  >
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                      ) : (
                        <Briefcase className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-white">{user.full_name || user.email}</span>
                  </button>
                }
                items={[
                  {
                    label: 'Profile',
                    icon: <Briefcase className="w-5 h-5" />,
                    onClick: () => navigate({ to: `/profile/$userId`, params: { userId: String(user.id) } }),
                  },
                  {
                    label: 'Settings',
                    icon: <Briefcase className="w-5 h-5" />,
                    onClick: () => navigate({ to: '/settings' }),
                  },
                  ...(user.role === 'admin'
                    ? [
                        {
                          label: 'Admin Panel',
                          icon: <Briefcase className="w-5 h-5" />,
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
              <Link to="/register">
                <Button variant="primary" size="sm" className="min-h-[44px]">Get Started</Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-none transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-drawer"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] flex items-center gap-1.5 border border-white/25 px-3 min-h-[44px]">
                  MENU
                  <span className="text-neutral-500">[</span>
                  <span className="text-white">+</span>
                  <span className="text-neutral-500">]</span>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Fullscreen Swiss Drawer */}
      {isMobileMenuOpen && (
        <div
          id="mobile-drawer"
          className="md:hidden fixed inset-0 z-50 bg-[#050505] animate-in"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div className="flex flex-col h-full">
            {/* Drawer Header */}
            <div className="flex items-center justify-between h-16 px-6 border-b border-white/15">
              <Link to="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="w-8 h-8 bg-white rounded-none flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-black" aria-hidden="true" />
                </div>
                <span className="font-mono text-xs font-bold tracking-[0.28em] uppercase text-white">FREELANCEHUB</span>
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-none transition-colors min-h-[44px] min-w-[44px]"
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
                    className={`flex items-center gap-3 px-4 py-4 rounded-none text-base font-mono uppercase tracking-[0.22em] transition-colors ${
                      isActive
                        ? 'text-white bg-white/10'
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="text-neutral-500 w-8 text-right">{item.index}</span>
                    <DualLayerTextRoll index=" " className="whitespace-nowrap">
                      {item.name}
                    </DualLayerTextRoll>
                  </Link>
                );
              })}

              {user?.role === 'admin' && (
                <div className="pt-4 border-t border-white/15">
                  <span className="px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-3">Admin</span>
                  {adminNavigation.map((item) => {
                    const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-none text-base font-medium transition-colors ${
                          isActive
                            ? 'text-white bg-white/10'
                            : 'text-neutral-400 hover:text-white hover:bg-white/5'
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
                <div className="pt-6 border-t border-white/15">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-none text-base font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition-colors min-h-[44px]"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    Sign out
                  </button>
                </div>
              )}
            </nav>

            {/* Drawer Footer - CTA for non-authenticated */}
            {!user && (
              <div className="p-6 border-t border-white/15 space-y-3">
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="primary" size="lg" className="w-full min-h-[48px]">
                    Get Started
                  </Button>
                </Link>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" size="lg" className="w-full min-h-[48px] border-white/30 text-white hover:bg-white hover:text-black">
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

export { Header as default };