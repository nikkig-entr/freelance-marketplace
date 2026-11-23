import { NavLink, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  HomeIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  ChartBarIcon,
  UsersIcon,
  DocumentTextIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import { Briefcase } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/Badge';

const userNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Projects', href: '/projects', icon: Briefcase },
  { name: 'Messages', href: '/messages', icon: ChatBubbleLeftRightIcon, badge: 3 },
  { name: 'Balance', href: '/balance', icon: CurrencyDollarIcon },
];

const adminNavigation = [
  { name: 'Dashboard', href: '/admin', icon: ChartBarIcon },
  { name: 'Users', href: '/admin/users', icon: UsersIcon },
  { name: 'Projects', href: '/admin/projects', icon: DocumentTextIcon },
  { name: 'Withdrawals', href: '/admin/withdrawals', icon: BanknotesIcon },
];

export function Sidebar() {
  const { user, hasRole } = useAuth();
  const location = useLocation();
  const isAdmin = hasRole(['admin']);

  const navigation = isAdmin ? adminNavigation : userNavigation;

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:flex-shrink-0 bg-white border-r border-secondary-200">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-secondary-200">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading font-bold text-xl text-secondary-900">FreelanceHub</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto" aria-label="Main navigation">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
            const href = item.href;
            return (
              <NavLink
                key={item.name}
                to={href}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                    : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <item.icon
                  className={clsx(
                    'w-5 h-5 flex-shrink-0',
                    isActive ? 'text-primary-600' : 'text-secondary-400'
                  )}
                  aria-hidden="true"
                />
                <span className="truncate">{item.name}</span>
                {item.badge && (
                  <Badge variant="danger" size="sm" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Info / Plan */}
        <div className="border-t border-secondary-200 p-4">
          {user && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-primary-700 font-medium">
                      {user.full_name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-secondary-900 truncate">
                    {user.full_name || user.email.split('@')[0]}
                  </p>
                  <p className="text-xs text-secondary-500 capitalize">{user.plan} Plan</p>
                </div>
              </div>
              <div className="flex gap-2">
                <NavLink
                  to="/profile"
                  className="flex-1 btn btn-outline btn-sm justify-center"
                >
                  Profile
                </NavLink>
                <NavLink
                  to="/settings"
                  className="flex-1 btn btn-primary btn-sm justify-center"
                >
                  Settings
                </NavLink>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}