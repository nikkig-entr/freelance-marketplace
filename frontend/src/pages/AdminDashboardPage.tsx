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
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-[var(--color-text)]">Admin Dashboard</h1>
            <p className="mt-1 text-[var(--color-text-muted)]">Platform overview and analytics</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-8 bg-[var(--color-surface-muted)] rounded w-3/4 mb-4" />
              <div className="h-12 bg-[var(--color-surface-muted)] rounded w-1/2" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const formatCurrency = (cents: number) => `$${(cents / 100).toLocaleString()}`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[var(--color-text)]">Admin Dashboard</h1>
          <p className="mt-1 text-[var(--color-text-muted)]">Platform overview and analytics</p>
        </div>
      </div>

      {/* User Stats */}
      <h2 className="text-lg font-semibold text-[var(--color-text)]">Users</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
        {statCards.map((stat) => {
          const value = stats?.users[stat.key] || 0;
          return (
            <Card key={stat.key}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-muted)]">{stat.label}</p>
                  <p className="mt-1 text-3xl font-bold text-[var(--color-text)]">{value.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-[var(--color-accent-muted)] rounded-xl flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-[var(--color-accent)]" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* User Plan Breakdown */}
      <Card className="mt-6">
        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">Users by Plan</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(stats?.users.by_plan || {}).map(([plan, count]) => (
            <div key={plan} className="p-4 rounded-xl bg-[var(--color-surface-muted)] text-center">
              <p className="text-2xl font-bold text-[var(--color-text)]">{count}</p>
              <p className="text-sm text-[var(--color-text-muted)] capitalize">{plan}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Project Stats */}
      <h2 className="text-lg font-semibold text-[var(--color-text)] mt-8">Projects</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
        {projectStatCards.map((stat) => {
          const value = stats?.projects[stat.key] || 0;
          return (
            <Card key={stat.key}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-muted)]">{stat.label}</p>
                  <p className="mt-1 text-3xl font-bold text-[var(--color-text)]">{value.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-[var(--color-accent-muted)] rounded-xl flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-[var(--color-accent)]" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Bid Stats */}
      <h2 className="text-lg font-semibold text-[var(--color-text)] mt-8">Bids</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
        {[
          { key: 'total' as const, label: 'Total Bids' },
          { key: 'pending' as const, label: 'Pending' },
          { key: 'accepted' as const, label: 'Accepted' },
        ].map((stat) => {
          const value = stats?.bids[stat.key] || 0;
          return (
            <Card key={stat.key}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-muted)]">{stat.label}</p>
                  <p className="mt-1 text-3xl font-bold text-[var(--color-text)]">{value.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-[var(--color-accent-muted)] rounded-xl flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-[var(--color-accent)]" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Financial Stats */}
      <h2 className="text-lg font-semibold text-[var(--color-text)] mt-8">Financial</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
        {financialStatCards.map((stat) => {
          const value = stats?.financial[stat.key] || 0;
          return (
            <Card key={stat.key}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-muted)]">{stat.label}</p>
                  <p className="mt-1 text-3xl font-bold text-[var(--color-text)]">
                    {stat.isCurrency ? formatCurrency(value) : value.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-[var(--color-accent-muted)] rounded-xl flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-[var(--color-accent)]" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold text-[var(--color-text)] mt-8">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
        <Button asChild variant="outline" className="h-full flex flex-col items-center gap-2 p-6">
          <Link to="/admin/users">
            <UsersIcon className="w-8 h-8 text-[var(--color-text-muted)]" />
            <span className="font-medium text-[var(--color-text)]">Manage Users</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-full flex flex-col items-center gap-2 p-6">
          <Link to="/admin/projects">
            <Briefcase className="w-8 h-8 text-[var(--color-text-muted)]" />
            <span className="font-medium text-[var(--color-text)]">Manage Projects</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-full flex flex-col items-center gap-2 p-6">
          <Link to="/admin/withdrawals">
            <CurrencyDollarIcon className="w-8 h-8 text-[var(--color-text-muted)]" />
            <span className="font-medium text-[var(--color-text)]">Withdrawals</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-full flex flex-col items-center gap-2 p-6">
          <Link to="/admin/transactions">
            <ChatBubbleLeftRightIcon className="w-8 h-8 text-[var(--color-text-muted)]" />
            <span className="font-medium text-[var(--color-text)]">Transactions</span>
          </Link>
        </Button>
      </div>

      {/* Recent Activity */}
      <h2 className="text-lg font-semibold text-[var(--color-text)] mt-8">Recent Activity</h2>
      <Card padding="none">
        <div className="divide-y divide-[var(--color-border)]">
          <div className="p-4 bg-[var(--color-surface-muted)]">
            <p className="text-sm text-[var(--color-text-subtle)]">Recent activity will appear here</p>
          </div>
        </div>
      </Card>
    </div>
  );
}