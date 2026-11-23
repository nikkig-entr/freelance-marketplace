import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  UsersIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle, CardGrid } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { LoadingSpinner, CardLoader } from '@/components/ui/LoadingSpinner';
import { adminService } from '@/services/api';
import { AdminStats } from '@/types';
import { useAuth } from '@/context/AuthContext';

const statCards = [
  { key: 'total', label: 'Total Users', icon: UsersIcon, color: 'primary' },
  { key: 'active', label: 'Active Users', icon: CheckCircleIcon, color: 'success' },
  { key: 'freelancers', label: 'Freelancers', icon: BriefcaseIcon, color: 'warning' },
  { key: 'clients', label: 'Clients', icon: UsersIcon, color: 'secondary' },
];

const projectStatCards = [
  { key: 'total', label: 'Total Projects', icon: BriefcaseIcon, color: 'primary' },
  { key: 'open', label: 'Open', icon: ClockIcon, color: 'warning' },
  { key: 'in_progress', label: 'In Progress', icon: ChatBubbleLeftRightIcon, color: 'primary' },
  { key: 'completed', label: 'Completed', icon: CheckCircleIcon, color: 'success' },
];

const financialStatCards = [
  { key: 'total_revenue_cents', label: 'Total Revenue', icon: CurrencyDollarIcon, color: 'success', isCurrency: true },
  { key: 'pending_withdrawals_cents', label: 'Pending Withdrawals', icon: ExclamationTriangleIcon, color: 'warning', isCurrency: true },
  { key: 'mrr_cents', label: 'MRR', icon: ArrowTrendingUpIcon, color: 'primary', isCurrency: true },
  { key: 'active_subscriptions', label: 'Active Subscriptions', icon: UsersIcon, color: 'secondary' },
];

export function AdminDashboardPage() {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminService.getStats(),
    enabled: !!user && user.role === 'admin',
  });

  if (!user || user.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-secondary-900">Access Denied</h1>
        <p className="mt-2 text-secondary-600">Admin access required.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-secondary-900">Admin Dashboard</h1>
            <p className="mt-1 text-secondary-600">Platform overview and analytics</p>
          </div>
        </div>
        <CardGrid columns={4}>
          {[1, 2, 3, 4].map((i) => <CardLoader key={i} />)}
        </CardGrid>
      </div>
    );
  }

  const formatCurrency = (cents: number) => `$${(cents / 100).toLocaleString()}`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-secondary-900">Admin Dashboard</h1>
          <p className="mt-1 text-secondary-600">Platform overview and analytics</p>
        </div>
      </div>

      {/* User Stats */}
      <CardTitle title="Users" />
      <CardGrid columns={4}>
        {statCards.map((stat) => {
          const value = stats?.users[stat.key] || 0;
          return (
            <Card key={stat.key}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-600">{stat.label}</p>
                  <p className="mt-1 text-3xl font-bold text-secondary-900">{value.toLocaleString()}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </Card>
          );
        })}
      </CardGrid>

      {/* User Plan Breakdown */}
      <Card className="mt-6">
        <CardTitle title="Users by Plan" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(stats?.users.by_plan || {}).map(([plan, count]) => (
            <div key={plan} className="p-4 rounded-xl bg-secondary-50 text-center">
              <p className="text-2xl font-bold text-secondary-900">{count}</p>
              <p className="text-sm text-secondary-500 capitalize">{plan}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Project Stats */}
      <CardTitle title="Projects" className="mt-8" />
      <CardGrid columns={4}>
        {projectStatCards.map((stat) => {
          const value = stats?.projects[stat.key] || 0;
          return (
            <Card key={stat.key}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-600">{stat.label}</p>
                  <p className="mt-1 text-3xl font-bold text-secondary-900">{value.toLocaleString()}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </Card>
          );
        })}
      </CardGrid>

      {/* Bid Stats */}
      <CardTitle title="Bids" className="mt-8" />
      <CardGrid columns={3}>
        {[
          { key: 'total', label: 'Total Bids', color: 'primary' },
          { key: 'pending', label: 'Pending', color: 'warning' },
          { key: 'accepted', label: 'Accepted', color: 'success' },
        ].map((stat) => {
          const value = stats?.bids[stat.key] || 0;
          return (
            <Card key={stat.key}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-600">{stat.label}</p>
                  <p className="mt-1 text-3xl font-bold text-secondary-900">{value.toLocaleString()}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}>
                  <ChatBubbleLeftRightIcon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </Card>
          );
        })}
      </CardGrid>

      {/* Financial Stats */}
      <CardTitle title="Financial" className="mt-8" />
      <CardGrid columns={4}>
        {financialStatCards.map((stat) => {
          const value = stats?.financial[stat.key] || 0;
          return (
            <Card key={stat.key}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-600">{stat.label}</p>
                  <p className="mt-1 text-3xl font-bold text-secondary-900">
                    {stat.isCurrency ? formatCurrency(value) : value.toLocaleString()}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </Card>
          );
        })}
      </CardGrid>

      {/* Quick Actions */}
      <CardTitle title="Quick Actions" className="mt-8" />
      <CardGrid columns={4}>
        <Button asChild variant="outline" className="h-full flex flex-col items-center gap-2 p-6">
          <Link to="/admin/users">
            <UsersIcon className="w-8 h-8 text-secondary-500" />
            <span className="font-medium text-secondary-900">Manage Users</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-full flex flex-col items-center gap-2 p-6">
          <Link to="/admin/projects">
            <BriefcaseIcon className="w-8 h-8 text-secondary-500" />
            <span className="font-medium text-secondary-900">Manage Projects</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-full flex flex-col items-center gap-2 p-6">
          <Link to="/admin/withdrawals">
            <CurrencyDollarIcon className="w-8 h-8 text-secondary-500" />
            <span className="font-medium text-secondary-900">Withdrawals</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-full flex flex-col items-center gap-2 p-6">
          <Link to="/admin/transactions">
            <ChatBubbleLeftRightIcon className="w-8 h-8 text-secondary-500" />
            <span className="font-medium text-secondary-900">Transactions</span>
          </Link>
        </Button>
      </CardGrid>

      {/* Recent Activity */}
      <CardTitle title="Recent Activity" className="mt-8" />
      <Card padding="none">
        <div className="divide-y divide-secondary-200">
          <div className="p-4 bg-secondary-50">
            <p className="text-sm text-secondary-500">Recent activity will appear here</p>
          </div>
        </div>
      </Card>
    </div>
  );
}