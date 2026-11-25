import { Outlet, Link, useNavigate, useLocation } from '@tanstack/react-router';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useState, useEffect, useMemo } from 'react';
import {
  HomeIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { Briefcase } from 'lucide-react';

export function Layout() {
  const { user, logout, isLoading } = useAuth();
  const { isConnected } = useWebSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [notifications] = useState<Array<{ id: number; message: string; read: boolean }>>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const unreadNotificationsCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
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

  const filteredNavigation = navigation.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="w-12 h-12 border-4 border-[var(--color-border)] border-t-[var(--color-accent)] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--color-border)] sticky top-0 z-40 bg-[var(--color-bg)]/80 backdrop-blur-[var(--glass-blur-strong)]">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Desktop Navigation */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[var(--color-accent)] rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-[var(--color-text-inverse)]" />
                </div>
                <span className="text-xl font-heading font-bold text-[var(--color-text)]">FreelanceHub</span>
              </Link>

              <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
                {filteredNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                      location.pathname === item.href || location.pathname.startsWith(item.href + '/')
                        ? 'text-[var(--color-accent)]'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                ))}

                {user?.role === 'admin' && (
                  <div className="hidden md:flex items-center gap-2 border-l border-[var(--color-border)] pl-6">
                    <span className="text-xs font-semibold text-[var(--color-text-subtle)] uppercase tracking-wider">Admin</span>
                    {adminNavigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                          location.pathname === item.href || location.pathname.startsWith(item.href + '/')
                            ? 'text-[var(--color-accent)]'
                            : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </nav>
            </div>

            {/* Right side: Search, Notifications, User Menu */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="hidden lg:block relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-subtle)]" />
                <input
                  type="search"
                  placeholder="Search projects..."
                  className="w-64 pl-10 pr-4 py-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg text-sm text-[var(--color-text)] placeholder-[var(--color-text-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] focus:bg-[var(--glass-bg-strong)]"
                  aria-label="Search projects"
                />
              </div>

              {/* Create Project Button */}
              {user && (user.role === 'client' || user.role === 'admin') && (
                <Link
                  to="/projects/create"
                  className="hidden sm:flex items-center gap-2 btn btn-primary"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>New Project</span>
                </Link>
              )}

              {/* Connection Status */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)]/30">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-gray-500)]'}`} />
                {isConnected ? 'Connected' : 'Disconnected'}
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--glass-bg)] rounded-lg transition-colors"
                  aria-label="Notifications"
                >
                  <BellIcon className="w-5 h-5" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--color-accent)] text-[var(--color-text-inverse)] text-xs font-medium rounded-full flex items-center justify-center">
                      {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                    </span>
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-xl)] py-2 z-50 animate-in">
                    <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
                      <h3 className="font-semibold text-[var(--color-text)]">Notifications</h3>
                      {unreadNotificationsCount > 0 && (
                        <button className="text-sm text-[var(--color-accent)] hover:underline">Mark all read</button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-[var(--color-text-muted)]">No notifications</div>
                    ) : (
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map((notification) => (
                          <button
                            key={notification.id}
                            className={`w-full px-4 py-3 text-left hover:bg-[var(--color-surface-hover)] transition-colors ${
                              !notification.read ? 'bg-[var(--color-accent-muted)]/50' : ''
                            }`}
                          >
                            <p className={`text-sm ${!notification.read ? 'font-medium text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'}`}>
                              {notification.message}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Menu */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 p-1.5 hover:bg-[var(--glass-bg)] rounded-lg transition-colors"
                    aria-expanded={isProfileMenuOpen}
                    aria-haspopup="true"
                  >
                    <div className="w-8 h-8 rounded-full bg-[var(--color-accent-muted)] flex items-center justify-center">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                      ) : (
                        <UserCircleIcon className="w-5 h-5 text-[var(--color-accent)]" />
                      )}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-[var(--color-text)]">{user.full_name || user.email}</span>
                  </button>

                  {isProfileMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-xl)] py-2 z-50 animate-in">
                        <div className="px-4 py-3 border-b border-[var(--color-border)]">
                          <p className="text-sm font-medium text-[var(--color-text)]">{user.full_name || user.email}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">{user.email}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`badge ${user.plan === 'starter' ? 'badge-secondary' : user.plan === 'pro' ? 'badge-primary' : 'badge-primary'}`}>
                              {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                            </span>
                            <span className="badge badge-secondary">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                          </div>
                        </div>
                        <Link
                          to="/settings"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--glass-bg)]"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <Cog6ToothIcon className="w-5 h-5" />
                          Settings
                        </Link>
                        <Link
                          to="/profile/$userId"
                          params={{ userId: String(user.id) }}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--glass-bg)]"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <UserCircleIcon className="w-5 h-5" />
                          Profile
                        </Link>
                        <Link
                          to="/billing"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--glass-bg)]"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <CurrencyDollarIcon className="w-5 h-5" />
                          Billing
                        </Link>
                        {user.role === 'admin' && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--glass-bg)]"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <ShieldCheckIcon className="w-5 h-5" />
                            Admin Panel
                          </Link>
                        )}
                        <hr className="my-2 border-[var(--color-border)]" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-gray-500)] hover:text-[var(--color-gray-400)] hover:bg-[var(--color-gray-800)/50]"
                        >
                          <ArrowRightOnRectangleIcon className="w-5 h-5" />
                          Sign out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login" className="btn-ghost btn-sm">
                    Sign in
                  </Link>
                  <Link to="/register" className="btn-primary btn-sm">
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--glass-bg)] rounded-lg"
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div id="mobile-menu" className="md:hidden py-4 border-t border-[var(--color-border)] animate-in">
              <nav className="flex flex-col gap-2">
                {filteredNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === item.href || location.pathname.startsWith(item.href + '/')
                        ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--glass-bg)]'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                ))}

                {user?.role === 'admin' && (
                  <div className="pt-4 border-t border-[var(--color-border)]">
                    <span className="px-3 text-xs font-semibold text-[var(--color-text-subtle)] uppercase tracking-wider">Admin</span>
                    {adminNavigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          location.pathname === item.href || location.pathname.startsWith(item.href + '/')
                            ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
                            : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--glass-bg)]'
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}

                {user && (
                  <div className="pt-4 border-t border-[var(--color-border)]">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--color-gray-500)] hover:text-[var(--color-gray-400)] hover:bg-[var(--color-gray-800)/50]"
                    >
                      <ArrowRightOnRectangleIcon className="w-5 h-5" />
                      Sign out
                    </button>
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] py-8 bg-[var(--color-bg-elevated)]/50">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text)]">Product</h3>
              <ul className="mt-4 space-y-3">
                <li><Link to="/projects" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)]">Projects</Link></li>
                <li><Link to="/billing" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)]">Pricing</Link></li>
                <li><a href="/projects" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)]">Features</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text)]">Company</h3>
              <ul className="mt-4 space-y-3">
                <li><a href="#" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)]">About</a></li>
                <li><a href="#" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)]">Blog</a></li>
                <li><a href="#" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)]">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text)]">Support</h3>
              <ul className="mt-4 space-y-3">
                <li><a href="#" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)]">Help Center</a></li>
                <li><a href="#" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)]">Contact Us</a></li>
                <li><a href="#" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)]">Status</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text)]">Legal</h3>
              <ul className="mt-4 space-y-3">
                <li><a href="#" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)]">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)]">Terms of Service</a></li>
                <li><a href="#" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)]">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-[var(--color-border)] pt-8 text-center text-sm text-[var(--color-text-muted)]">
            <p>&copy; {new Date().getFullYear()} FreelanceHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}