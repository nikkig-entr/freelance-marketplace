import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MagnifyingGlassIcon, FunnelIcon, ArrowDownTrayIcon, CalendarIcon, CurrencyDollarIcon, UserCircleIcon, CreditCardIcon, BanknotesIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Dropdown } from '@/components/ui/Dropdown';
import { adminService } from '@/services/api';
import { TransactionType, Transaction } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';

interface PaginatedTransactions {
  items: Transaction[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  deposit: 'Deposit',
  withdrawal: 'Withdrawal',
  project_payment: 'Project Payment',
  project_refund: 'Project Refund',
  platform_fee: 'Platform Fee',
  subscription_payment: 'Subscription',
  bid_bonus: 'Bid Bonus',
  referral_bonus: 'Referral Bonus',
};

const TRANSACTION_TYPE_ICONS: Record<TransactionType, React.ComponentType<{ className?: string }>> = {
  deposit: BanknotesIcon,
  withdrawal: ArrowDownTrayIcon,
  project_payment: CurrencyDollarIcon,
  project_refund: ArrowPathIcon,
  platform_fee: CreditCardIcon,
  subscription_payment: CreditCardIcon,
  bid_bonus: BanknotesIcon,
  referral_bonus: UserCircleIcon,
};

const TYPE_FILTERS = [
  { value: '', label: 'All Types' },
  { value: 'deposit', label: 'Deposits' },
  { value: 'withdrawal', label: 'Withdrawals' },
  { value: 'project_payment', label: 'Project Payments' },
  { value: 'project_refund', label: 'Refunds' },
  { value: 'platform_fee', label: 'Platform Fees' },
  { value: 'subscription_payment', label: 'Subscriptions' },
  { value: 'bid_bonus', label: 'Bid Bonuses' },
  { value: 'referral_bonus', label: 'Referral Bonuses' },
];

const BADGE_VARIANTS: Record<string, 'primary' | 'secondary' | 'outline' | 'danger'> = {
  deposit: 'primary',
  bid_bonus: 'primary',
  referral_bonus: 'primary',
  withdrawal: 'secondary',
  platform_fee: 'secondary',
  project_payment: 'outline',
  project_refund: 'secondary',
  subscription_payment: 'outline',
};

export function AdminTransactionsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'amount_cents'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const params = {
    page,
    page_size: pageSize,
    ...(search && { search }),
    ...(typeFilter && { type: typeFilter }),
    ...(dateFrom && { date_from: dateFrom }),
    ...(dateTo && { date_to: dateTo }),
    sort_by: sortBy,
    sort_order: sortOrder,
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-transactions', params],
    queryFn: () => adminService.getTransactions(params) as Promise<PaginatedTransactions>,
  });

  const transactions: Transaction[] = data?.items || [];
  const total = data?.total || 0;
  const totalPages = data?.total_pages || 0;

  const handleSort = (field: 'created_at' | 'amount_cents') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getTypeBadgeVariant = (type: TransactionType): 'primary' | 'secondary' | 'outline' | 'danger' => {
    return BADGE_VARIANTS[type] || 'outline';
  };

  const handleExport = () => {
    const exportParams = { ...params, page: 1, page_size: 10000 };
    const queryString = new URLSearchParams(exportParams as unknown as Record<string, string>).toString();
    window.open(`/api/v1/admin/transactions/export?${queryString}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-16">
          <div className="w-8 h-8 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-[var(--color-text-muted)]">Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card>
          <div className="text-center py-12">
            <p className="text-[var(--color-accent)]">Failed to load transactions</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[var(--color-text)]">Transactions</h1>
          <p className="text-[var(--color-text-muted)]">View and manage all platform transactions</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" leftIcon={<ArrowDownTrayIcon className="w-5 h-5" />} onClick={handleExport}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-subtle)]" />
            <input
              type="search"
              placeholder="Search by user, description..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              onKeyDown={(e) => e.key === 'Enter' && setPage(1)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent text-[var(--color-text)] placeholder-[var(--color-text-subtle)] bg-[var(--color-bg)]"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Dropdown
              trigger={<Button variant="outline" leftIcon={<FunnelIcon className="w-4 h-4" />}>Type: {typeFilter ? TYPE_FILTERS.find(f => f.value === typeFilter)?.label : 'All'}</Button>}
              items={TYPE_FILTERS.map(f => ({
                label: f.label,
                onClick: () => { setTypeFilter(f.value); setPage(1); },
              }))}
            />

            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              placeholder="From"
              className="w-40"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              placeholder="To"
              className="w-40"
            />

            <Dropdown
              trigger={<Button variant="outline" leftIcon={<CalendarIcon className="w-4 h-4" />}>{sortBy === 'created_at' ? 'Date' : 'Amount'} {sortOrder === 'asc' ? '↑' : '↓'}</Button>}
              items={[
                { label: 'Date ↓', onClick: () => { setSortBy('created_at'); setSortOrder('desc'); } },
                { label: 'Date ↑', onClick: () => { setSortBy('created_at'); setSortOrder('asc'); } },
                { label: 'Amount ↓', onClick: () => { setSortBy('amount_cents'); setSortOrder('desc'); } },
                { label: 'Amount ↑', onClick: () => { setSortBy('amount_cents'); setSortOrder('asc'); } },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                <th className="pb-3 pr-4 font-medium cursor-pointer hover:text-[var(--color-text)]" onClick={() => handleSort('created_at')}>
                  Date {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="pb-3 pr-4 font-medium">User</th>
                <th className="pb-3 pr-4 font-medium">Type</th>
                <th className="pb-3 pr-4 font-medium">Description</th>
                <th className="pb-3 pr-4 font-medium cursor-pointer hover:text-[var(--color-text)] text-right" onClick={() => handleSort('amount_cents')}>
                  Amount {sortBy === 'amount_cents' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="pb-3 pr-4 font-medium">Balance After</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-[var(--color-surface-muted)] flex items-center justify-center mx-auto mb-4">
                      <CurrencyDollarIcon className="w-8 h-8 text-[var(--color-text-subtle)]" />
                    </div>
                    <p className="text-[var(--color-text-muted)]">No transactions found</p>
                    <p className="text-sm text-[var(--color-text-subtle)] mt-1">Try adjusting your filters</p>
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-[var(--color-surface-muted)] transition-colors">
                    <td className="py-4 pr-4 text-[var(--color-text)] whitespace-nowrap">
                      {formatDate(transaction.created_at)}
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-2">
                        <UserCircleIcon className="w-5 h-5 text-[var(--color-text-subtle)]" />
                        <div>
                          <p className="font-medium text-[var(--color-text)]">User #{transaction.user_id}</p>
                          <p className="text-xs text-[var(--color-text-subtle)]">ID: {transaction.uuid.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const Icon = TRANSACTION_TYPE_ICONS[transaction.type];
                          return <Icon className="w-4 h-4 text-[var(--color-text-subtle)]" />;
                        })()}
                        <Badge variant={getTypeBadgeVariant(transaction.type)} size="sm">
                          {TRANSACTION_TYPE_LABELS[transaction.type]}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-[var(--color-text-muted)] max-w-xs truncate" title={transaction.description || ''}>
                      {transaction.description || '—'}
                    </td>
                    <td className="py-4 pr-4 text-right font-medium text-[var(--color-text)]">
                      {formatCurrency(transaction.amount_cents)}
                    </td>
                    <td className="py-4 pr-4 text-right text-[var(--color-text-muted)]">
                      {formatCurrency(transaction.balance_after_cents)}
                    </td>
                    <td className="py-4 pr-4">
                      <Badge variant={transaction.is_completed ? 'primary' : 'secondary'} size="sm">
                        {transaction.is_completed ? 'Completed' : 'Pending'}
                      </Badge>
                    </td>
                    <td className="py-4">
                      <Button variant="ghost" size="sm" onClick={() => window.open(`/admin/transactions/${transaction.id}`, '_blank')}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-[var(--color-text-muted)]">
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} transactions
            </div>
            <div className="flex items-center gap-2">
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="px-3 py-1 rounded-lg border border-[var(--color-border)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent bg-[var(--color-bg)]"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                Previous
              </Button>
              <span className="px-3 text-sm text-[var(--color-text-muted)]">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}