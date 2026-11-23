import { Outlet, Link, useNavigate, useLocation } from '@tanstack/react-router';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useState, useEffect } from 'react';
import {
  HomeIcon,
  BriefcaseIcon,
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
  ComputerDesktopIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

export function Layout() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const { isConnected, unreadCount, setUnreadCount } = useWebSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: number; message: string; read: boolean }>>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token' && !e.newValue) {
        navigate('/login');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Projects', href: '/projects', icon: BriefcaseIcon, roles: ['client', 'freelancer', 'admin'] },
    { name: 'My Projects', href: '/projects/my', icon: DocumentTextIcon, roles: ['client', 'admin'] },
    { name: 'My Bids', href: '/my/bids', icon: BriefcaseIcon, roles: ['freelancer'] },
    { name: 'Chat', href: '/chat', icon: ChatBubbleLeftRightIcon, roles: ['client', 'freelancer', 'admin'] },
    { name: 'Balance', href: '/balance', icon: CurrencyDollarIcon, roles: ['freelancer', 'admin'] },
    { name: 'Billing', href: '/billing', icon: CurrencyDollarIcon, roles: ['client', 'freelancer', 'admin'] },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, roles: ['client', 'freelancer', 'admin'] },
  ];

  const adminNavigation = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Users', href: '/admin/users', icon: UserCircleIcon },
    { name: 'Projects', href: '/admin/projects', icon: BriefcaseIcon },
    { name: 'Withdrawals', href: '/admin/withdrawals', icon: CurrencyDollarIcon },
    { name: 'Transactions', href: '/admin/transactions', icon: DocumentTextIcon },
  ];

  const filteredNavigation = navigation.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Desktop Navigation */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <BriefcaseIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">FreelanceHub</span>
              </Link>

              <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
                {filteredNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                      location.pathname === item.href || location.pathname.startsWith(item.href + '/')
                        ? 'text-primary-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                ))}

                {user?.role === 'admin' && (
                  <div className="hidden md:flex items-center gap-2 border-l border-gray-200 pl-6">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin</span>
                    {adminNavigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                          location.pathname === item.href || location.pathname.startsWith(item.href + '/')
                            ? 'text-primary-600'
                            : 'text-gray-600 hover:text-gray-900'
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
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search projects..."
                  className="w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  aria-label="Search projects"
                />
              </div>

              {/* Create Project Button */}
              {user && (user.role === 'client' || user.role === 'admin') && (
                <Link
                  to="/projects/create"
                  className="hidden sm:flex items-center gap-2 btn-primary"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>New Project</span>
                </Link>
              )}

              {/* Connection Status */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                {isConnected ? 'Connected' : 'Disconnected'}
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Notifications"
                >
                  <BellIcon className="w-5 h-5" />
                  {notifications.filter((n) => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                      {notifications.filter((n) => !n.read).length > 9 ? '9+' : notifications.filter((n) => !n.read).length}
                    </span>
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-lg py-2 z-50 animate-in">
                    <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      {notifications.some((n) => !n.read) && (
                        <button className="text-sm text-primary-600 hover:text-primary-700">Mark all read</button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-gray-500">No notifications</div>
                    ) : (
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map((notification) => (
                          <button
                            key={notification.id}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                          >
                            <p className={`text-sm ${!notification.read ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
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
                    className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-expanded={isProfileMenuOpen}
                    aria-haspopup="true"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                      ) : (
                        <UserCircleIcon className="w-5 h-5 text-primary-600" />
                      )}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700">{user.full_name || user.email}</span>
                  </button>

                  {isProfileMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-gray-200 shadow-lg py-2 z-50 animate-in">
                        <div className="px-4 py-3 border-b border-gray-200">
                          <p className="text-sm font-medium text-gray-900">{user.full_name || user.email}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`badge ${user.plan === 'starter' ? 'badge-gray' : user.plan === 'pro' ? 'badge-primary' : 'badge-success'}`}>
                              {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                            </span>
                            <span className="badge badge-gray">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                          </div>
                        </div>
                        <Link
                          to="/settings"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <Cog6ToothIcon className="w-5 h-5" />
                          Settings
                        </Link>
                        <Link
                          to={`/profile/${user.id}`}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <UserCircleIcon className="w-5 h-5" />
                          Profile
                        </Link>
                        <Link
                          to="/billing"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <CurrencyDollarIcon className="w-5 h-5" />
                          Billing
                        </Link>
                        {user.role === 'admin' && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <ShieldCheckIcon className="w-5 h-5" />
                            Admin Panel
                          </Link>
                        )}
                        <hr className="my-2 border-gray-200" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-gray-50"
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
                  <Link to="/login" className="btn-ghost text-sm">
                    Sign in
                  </Link>
                  <Link to="/register" className="btn-primary text-sm">
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
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
            <div id="mobile-menu" className="md:hidden py-4 border-t border-gray-200 animate-in">
              <nav className="flex flex-col gap-2">
                {filteredNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === item.href || location.pathname.startsWith(item.href + '/')
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                ))}

                {user?.role === 'admin' && (
                  <div className="pt-4 border-t border-gray-200">
                    <span className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin</span>
                    {adminNavigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          location.pathname === item.href || location.pathname.startsWith(item.href + '/')
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
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
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Product</h3>
              <ul className="mt-4 space-y-3">
                <li><Link to="/projects" className="text-sm text-gray-500 hover:text-gray-700">Projects</Link></li>
                <li><Link to="/billing" className="text-sm text-gray-500 hover:text-gray-700">Pricing</Link></li>
                <li><Link to="#" className="text-sm text-gray-500 hover:text-gray-700">Features</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Company</h3>
              <ul className="mt-4 space-y-3">
                <li><Link to="#" className="text-sm text-gray-500 hover:text-gray-700">About</Link></li>
                <li><Link to="#" className="text-sm text-gray-500 hover:text-gray-700">Blog</Link></li>
                <li><Link to="#" className="text-sm text-gray-500 hover:text-gray-700">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Support</h3>
              <ul className="mt-4 space-y-3">
                <li><Link to="#" className="text-sm text-gray-500 hover:text-gray-700">Help Center</Link></li>
                <li><Link to="#" className="text-sm text-gray-500 hover:text-gray-700">Contact Us</Link></li>
                <li><Link to="#" className="text-sm text-gray-500 hover:text-gray-700">Status</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Legal</h3>
              <ul className="mt-4 space-y-3">
                <li><Link to="#" className="text-sm text-gray-500 hover:text-gray-700">Privacy Policy</Link></li>
                <li><Link to="#" className="text-sm text-gray-500 hover:text-gray-700">Terms of Service</Link></li>
                <li><Link to="#" className="text-sm text-gray-500 hover:text-gray-700">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
            <p>&copy; 2024 FreelanceHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}