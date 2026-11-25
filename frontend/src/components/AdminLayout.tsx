import { Outlet, Link, useLocation } from '@tanstack/react-router';
import { clsx } from 'clsx';
import {
  ChartBarIcon,
  UsersIcon,
  DocumentTextIcon,
  BanknotesIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { Header } from '@/components/layout/Header';

const adminNavigation = [
  { name: 'Dashboard', href: '/admin', icon: ChartBarIcon },
  { name: 'Users', href: '/admin/users', icon: UsersIcon },
  { name: 'Projects', href: '/admin/projects', icon: DocumentTextIcon },
  { name: 'Withdrawals', href: '/admin/withdrawals', icon: BanknotesIcon },
];

export function AdminLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-secondary-50 flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:flex-shrink-0 bg-white border-r border-secondary-200">
          <div className="flex flex-col h-full">
            {/* Admin Brand */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-secondary-200">
              <div className="w-8 h-8 rounded-lg bg-danger-500 flex items-center justify-center">
                <ShieldCheckIcon className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading font-bold text-xl text-secondary-900">Admin Panel</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto" aria-label="Admin navigation">
              {adminNavigation.map((item) => {
                const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-danger-50 text-danger-700 shadow-sm'
                        : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <item.icon
                      className={clsx(
                        'w-5 h-5 flex-shrink-0',
                        isActive ? 'text-danger-600' : 'text-secondary-400'
                      )}
                      aria-hidden="true"
                    />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Back to Site */}
            <div className="border-t border-secondary-200 p-4">
              <a
                href="/dashboard"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                Back to Site
              </a>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto lg:ml-64">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}