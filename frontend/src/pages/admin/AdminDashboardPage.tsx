import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import {
  UsersIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { Briefcase } from 'lucide-react';
import { adminService } from '@/services/api';

interface AdminStats {
  users: {
    total: number;
    active: number;
    freelancers: number;
    clients: number;
    by_plan: Record<string, number>;
  };
  projects: {
    total: number;
    open: number;
    in_progress: number;
    completed: number;
  };
  bids: {
    total: number;
    pending: number;
    accepted: number;
  };
  financial: {
    total_revenue_cents: number;
    pending_withdrawals_cents: number;
    mrr_cents: number;
    active_subscriptions: number;
  };
}

const statCards = [
  { key: 'total' as const, label: 'Total Users', icon: UsersIcon },
  { key: 'active' as const, label: 'Active Users', icon: CheckCircleIcon },
  { key: 'freelancers' as const, label: 'Freelancers', icon: Briefcase },
  { key: 'clients' as const, label: 'Clients', icon: UsersIcon },
];

const projectStatCards = [
  { key: 'total' as const, label: 'Total Projects', icon: Briefcase },
  { key: 'open' as const, label: 'Open', icon: ClockIcon },
  { key: 'in_progress' as const, label: 'In Progress', icon: ChatBubbleLeftRightIcon },
  { key: 'completed' as const, label: 'Completed', icon: CheckCircleIcon },
];

const financialStatCards = [
  { key: 'total_revenue_cents' as const, label: 'Total Revenue', icon: CurrencyDollarIcon, isCurrency: true },
  { key: 'pending_withdrawals_cents' as const, label: 'Pending Withdrawals', icon: ExclamationTriangleIcon, isCurrency: true },
  { key: 'mrr_cents' as const, label: 'MRR', icon: ArrowTrendingUpIcon, isCurrency: true },
  { key: 'active_subscriptions' as const, label: 'Active Subscriptions', icon: UsersIcon },
];

export function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminService.getStats() as Promise<AdminStats>,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] container py-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="font-heading font-bold text-[var(--color-text)] text-3xl">Admin Dashboard</h1>
            <p className="mt-1 text-[var(--color-text-muted)] font-[Instrument_Serif] italic">Platform overview and analytics</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border border-white/15 p-6 animate-pulse">
              <div className="h-8 bg-white/10 w-3/4 mb-4" />
              <div className="h-12 bg-white/10 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const formatCurrency = (cents: number) => `$${(cents / 100).toLocaleString()}`;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] container py-8 space-y-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-[var(--color-text)] text-3xl">Admin Dashboard</h1>
          <p className="mt-1 text-[var(--color-text-muted)] font-[Instrument_Serif] italic">Platform overview and analytics</p>
        </div>
      </div>

      {/* User Stats */}
      <div>
        <h2 className="font-heading font-semibold text-[var(--color-text)] text-xl mb-6">Users</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => {
            const value = stats?.users[stat.key] || 0;
            return (
              <div key={stat.key} className="border border-white/15 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">{stat.label}</p>
                    <p className="mt-1 font-heading font-bold text-[var(--color-text)] text-3xl">{value.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 border border-white/15 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* User Plan Breakdown */}
      <div className="border border-white/15 p-6">
        <h3 className="font-heading font-semibold text-[var(--color-text)] text-xl mb-4">Users by Plan</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(stats?.users.by_plan || {}).map(([plan, count]) => (
            <div key={plan} className="border border-white/15 p-4 text-center">
              <p className="font-heading font-bold text-[var(--color-text)] text-2xl">{count}</p>
              <p className="font-mono text-xs text-[var(--color-text-muted)] capitalize">{plan}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Project Stats */}
      <div>
        <h2 className="font-heading font-semibold text-[var(--color-text)] text-xl mb-6">Projects</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {projectStatCards.map((stat) => {
            const value = stats?.projects[stat.key] || 0;
            return (
              <div key={stat.key} className="border border-white/15 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">{stat.label}</p>
                    <p className="mt-1 font-heading font-bold text-[var(--color-text)] text-3xl">{value.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 border border-white/15 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bid Stats */}
      <div>
        <h2 className="font-heading font-semibold text-[var(--color-text)] text-xl mb-6">Bids</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { key: 'total' as const, label: 'Total Bids' },
            { key: 'pending' as const, label: 'Pending' },
            { key: 'accepted' as const, label: 'Accepted' },
          ].map((stat) => {
            const value = stats?.bids[stat.key] || 0;
            return (
              <div key={stat.key} className="border border-white/15 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">{stat.label}</p>
                    <p className="mt-1 font-heading font-bold text-[var(--color-text)] text-3xl">{value.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 border border-white/15 flex items-center justify-center">
                    <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Financial Stats */}
      <div>
        <h2 className="font-heading font-semibold text-[var(--color-text)] text-xl mb-6">Financial</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {financialStatCards.map((stat) => {
            const value = stats?.financial[stat.key] || 0;
            return (
              <div key={stat.key} className="border border-white/15 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">{stat.label}</p>
                    <p className="mt-1 font-heading font-bold text-[var(--color-text)] text-3xl">
                      {stat.isCurrency ? formatCurrency(value) : value.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 border border-white/15 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-heading font-semibold text-[var(--color-text)] text-xl mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            to="/admin/users"
            className="border border-white/15 hover:border-white/30 hover:bg-white/5 transition-all duration-300 h-full flex flex-col items-center gap-2 p-6"
          >
            <UsersIcon className="w-8 h-8 text-[var(--color-text-muted)]" />
            <span className="font-heading font-medium text-[var(--color-text)]">Manage Users</span>
          </Link>
          <Link
            to="/admin/projects"
            className="border border-white/15 hover:border-white/30 hover:bg-white/5 transition-all duration-300 h-full flex flex-col items-center gap-2 p-6"
          >
            <Briefcase className="w-8 h-8 text-[var(--color-text-muted)]" />
            <span className="font-heading font-medium text-[var(--color-text)]">Manage Projects</span>
          </Link>
          <Link
            to="/admin/withdrawals"
            className="border border-white/15 hover:border-white/30 hover:bg-white/5 transition-all duration-300 h-full flex flex-col items-center gap-2 p-6"
          >
            <CurrencyDollarIcon className="w-8 h-8 text-[var(--color-text-muted)]" />
            <span className="font-heading font-medium text-[var(--color-text)]">Withdrawals</span>
          </Link>
          <Link
            to="/admin/transactions"
            className="border border-white/15 hover:border-white/30 hover:bg-white/5 transition-all duration-300 h-full flex flex-col items-center gap-2 p-6"
          >
            <ChatBubbleLeftRightIcon className="w-8 h-8 text-[var(--color-text-muted)]" />
            <span className="font-heading font-medium text-[var(--color-text)]">Transactions</span>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="font-heading font-semibold text-[var(--color-text)] text-xl mb-6">Recent Activity</h2>
        <div className="border border-white/15">
          <div className="p-4 border-b border-white/15">
            <p className="font-mono text-xs text-[var(--color-text-subtle)]">Recent activity will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
}