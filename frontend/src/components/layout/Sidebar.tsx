import { Link, useLocation } from '@tanstack/react-router';
import { clsx } from 'clsx';
import {
  HomeIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  ChartBarIcon,
  UsersIcon,
  DocumentTextIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import { Briefcase } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/Badge';

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
};

const userNavigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Projects', href: '/projects', icon: Briefcase },
  { name: 'Messages', href: '/messages', icon: ChatBubbleLeftRightIcon, badge: 3 },
  { name: 'Balance', href: '/balance', icon: CurrencyDollarIcon },
];

const adminNavigation: NavItem[] = [
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
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:flex-shrink-0 bg-[var(--color-bg-elevated)] border-r border-[var(--color-border)]">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-[var(--color-border)]">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center">
            <SparklesIcon className="w-5 h-5 text-[var(--color-text-inverse)]" />
          </div>
          <span className="font-heading font-bold text-xl text-[var(--color-text)]">FreelanceHub</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto" aria-label="Main navigation">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)]/30'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--glass-bg)]'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  className={clsx(
                    'w-5 h-5 flex-shrink-0',
                    isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-subtle)]'
                  )}
                  aria-hidden="true"
                />
                <span className="truncate">{item.name}</span>
                {item.badge && (
                  <Badge variant="primary" size="sm" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Info / Plan */}
        <div className="border-t border-[var(--color-border)] p-4">
          {user && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-accent-muted)] flex items-center justify-center">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-[var(--color-accent)] font-medium">
                      {user.full_name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text)] truncate">
                    {user.full_name || user.email.split('@')[0]}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] capitalize">{user.plan} Plan</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link to="/profile/$userId" params={{ userId: String(user?.id) }} className="flex-1 btn btn-secondary btn-sm justify-center">
                  Profile
                </Link>
                <Link to="/settings" className="flex-1 btn btn-primary btn-sm justify-center">
                  Settings
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}