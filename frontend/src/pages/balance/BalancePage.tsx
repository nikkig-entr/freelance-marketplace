import { useState, useEffect, useCallback } from 'react';
import { Link } from '@tanstack/react-router';
import { useAuth } from '@/contexts/AuthContext';
import { balanceService } from '@/services/api';
import { Transaction, TransactionType, formatCurrency, formatDate } from '@/types';
import {
  ArrowLeftIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import toast from 'react-hot-toast';

interface TransactionFilters {
  transaction_type?: TransactionType;
  page?: number;
  page_size?: number;
}

const BADGE_VARIANTS: Record<TransactionType, 'primary' | 'secondary' | 'outline' | 'danger'> = {
  deposit: 'primary',
  project_refund: 'primary',
  bid_bonus: 'primary',
  referral_bonus: 'primary',
  withdrawal: 'secondary',
  project_payment: 'secondary',
  platform_fee: 'secondary',
  subscription_payment: 'secondary',
};

export function BalancePage() {
  useAuth(); // Ensure authentication
  const [balance, setBalance] = useState<{ balance_cents: number; pending_balance_cents: number } | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(20);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);

  const fetchBalance = useCallback(async () => {
    try {
      const data = await balanceService.get() as BalanceResponse;
      setBalance(data);
    } catch {
      console.error('Failed to fetch balance');
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    setIsLoadingTransactions(true);
    try {
      const params = { ...filters, page, page_size: pageSize };
      const data = await balanceService.transactions(params) as PaginatedTransactions;
      setTransactions(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.total_pages || 0);
    } catch {
      console.error('Failed to fetch transactions');
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [filters, page, pageSize]);

  interface BalanceResponse {
    balance_cents: number;
    pending_balance_cents: number;
  }

  interface PaginatedTransactions {
    items: Transaction[];
    total: number;
    total_pages: number;
  }

  interface DepositResponse {
    checkout_url?: string;
  }

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
  }, [page, filters, fetchBalance, fetchTransactions]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(depositAmount);
    if (!amount || amount < 1) {
      toast.error('Please enter a valid amount');
      return;
    }
    setIsDepositing(true);
    try {
      const data = await balanceService.deposit({ amount_cents: Math.round(amount * 100) }) as DepositResponse;
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
      setShowDepositModal(false);
      setDepositAmount('');
    } catch {
      toast.error('Failed to create deposit');
    } finally {
      setIsDepositing(false);
    }
  };

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownTrayIcon className="w-5 h-5 text-[var(--color-success)]" />;
      case 'withdrawal':
        return <ArrowUpTrayIcon className="w-5 h-5 text-[var(--color-error)]" />;
      case 'project_payment':
        return <CurrencyDollarIcon className="w-5 h-5 text-[var(--color-accent)]" />;
      case 'project_refund':
        return <ArrowDownTrayIcon className="w-5 h-5 text-[var(--color-accent)]" />;
      case 'platform_fee':
        return <DocumentTextIcon className="w-5 h-5 text-[var(--color-warning)]" />;
      case 'subscription_payment':
        return <CurrencyDollarIcon className="w-5 h-5 text-[var(--color-accent)]" />;
      case 'bid_bonus':
        return <CurrencyDollarIcon className="w-5 h-5 text-[var(--color-success)]" />;
      case 'referral_bonus':
        return <CurrencyDollarIcon className="w-5 h-5 text-[var(--color-success)]" />;
      default:
        return <CurrencyDollarIcon className="w-5 h-5 text-[var(--color-text-subtle)]" />;
    }
  };

  const getTransactionColor = (type: TransactionType) => {
    switch (type) {
      case 'deposit':
      case 'project_refund':
      case 'bid_bonus':
      case 'referral_bonus':
        return 'text-[var(--color-success)]';
      case 'withdrawal':
      case 'project_payment':
      case 'platform_fee':
      case 'subscription_payment':
        return 'text-[var(--color-error)]';
      default:
        return 'text-[var(--color-text-muted)]';
    }
  };

  const getTransactionBadgeVariant = (type: TransactionType): 'primary' | 'secondary' | 'outline' | 'danger' => {
    return BADGE_VARIANTS[type] || 'secondary';
  };

  const availableCents = (balance?.balance_cents || 0) - (balance?.pending_balance_cents || 0);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-[var(--color-text-subtle)] hover:text-[var(--color-text)]">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-[var(--color-text)]">Balance</h1>
              <p className="mt-1 text-[var(--color-text-muted)]">Manage your funds and transactions</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link to="/withdrawal">
                <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
                Withdraw
              </Link>
            </Button>
            <Button variant="primary" onClick={() => setShowDepositModal(true)}>
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Funds
            </Button>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">Available Balance</p>
                <p className="text-3xl font-bold text-[var(--color-text)] mt-1">
                  {formatCurrency(availableCents)}
                </p>
              </div>
              <div className="w-12 h-12 bg-[var(--color-success-muted)] rounded-xl flex items-center justify-center">
                <CurrencyDollarIcon className="w-6 h-6 text-[var(--color-success)]" />
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">Pending</p>
                <p className="text-3xl font-bold text-[var(--color-text)] mt-1">
                  {formatCurrency(balance?.pending_balance_cents || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-[var(--color-warning-muted)] rounded-xl flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-[var(--color-warning)]" />
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">Total Balance</p>
                <p className="text-3xl font-bold text-[var(--color-text)] mt-1">
                  {formatCurrency(balance?.balance_cents || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-[var(--color-accent-muted)] rounded-xl flex items-center justify-center">
                <CurrencyDollarIcon className="w-6 h-6 text-[var(--color-accent)]" />
              </div>
            </div>
          </Card>
        </div>

        {/* Transactions */}
        <Card>
          <div className="p-4 border-b border-[var(--color-border)] flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">Transaction History</h2>
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 max-w-xs">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-subtle)]" />
                <Input
                  type="search"
                  placeholder="Search transactions..."
                  className="pl-10"
                />
              </div>
              <select
                value={filters.transaction_type || ''}
                onChange={(e) => setFilters({ ...filters, transaction_type: (e.target.value as TransactionType) || undefined, page: 1 })}
                className="w-auto"
              >
                <option value="">All Types</option>
                <option value="deposit">Deposits</option>
                <option value="withdrawal">Withdrawals</option>
                <option value="project_payment">Project Payments</option>
                <option value="project_refund">Project Refunds</option>
                <option value="platform_fee">Platform Fees</option>
                <option value="subscription_payment">Subscriptions</option>
                <option value="bid_bonus">Bid Bonuses</option>
                <option value="referral_bonus">Referral Bonuses</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoadingTransactions ? (
              <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center gap-4 px-6 py-4">
                    <div className="w-10 h-10 bg-[var(--color-border)] rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-[var(--color-border)] rounded w-1/3" />
                      <div className="h-3 bg-[var(--color-border)] rounded w-1/4" />
                    </div>
                    <div className="h-6 bg-[var(--color-border)] rounded w-24" />
                    <div className="h-6 bg-[var(--color-border)] rounded w-20" />
                  </div>
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-12 text-center">
                <DocumentTextIcon className="w-16 h-16 text-[var(--color-text-subtle)] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[var(--color-text)]">No transactions found</h3>
                <p className="mt-1 text-[var(--color-text-muted)]">Your transaction history will appear here</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-[var(--color-surface-muted)] border-b border-[var(--color-border)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider">Transaction</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider">Balance After</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[var(--color-surface-muted)]">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[var(--color-surface-muted)] flex items-center justify-center">
                            {getTransactionIcon(tx.type)}
                          </div>
                          <div>
                            <p className="font-medium text-[var(--color-text)]">
                              {tx.type.replace('_', ' ')}
                            </p>
                            {tx.project_id && (
                              <p className="text-sm text-[var(--color-text-muted)]">Project #{tx.project_id}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getTransactionBadgeVariant(tx.type)} size="sm">
                          {tx.type.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-medium ${getTransactionColor(tx.type)}`}>
                          {tx.amount_cents > 0 ? '+' : ''}{formatCurrency(tx.amount_cents)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[var(--color-text)]">
                        {formatCurrency(tx.balance_after_cents)}
                      </td>
                      <td className="px-6 py-4 text-[var(--color-text-muted)]">{formatDate(tx.created_at)}</td>
                      <td className="px-6 py-4 text-[var(--color-text-muted)] max-w-xs truncate">{tx.description || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="px-6 py-4 border-t border-[var(--color-border)] flex items-center justify-between">
              <p className="text-sm text-[var(--color-text-muted)]">
                Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} transactions
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </nav>
          )}
        </Card>

        {/* Deposit Modal */}
        <Modal
          isOpen={showDepositModal}
          onClose={() => setShowDepositModal(false)}
          title="Add Funds"
          size="md"
        >
          <form onSubmit={handleDeposit} className="space-y-4">
            <div>
              <label htmlFor="deposit-amount" className="label">Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-subtle)]">$</span>
                <Input
                  id="deposit-amount"
                  type="number"
                  min="1"
                  max="10000"
                  step="1"
                  placeholder="50"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  required
                />
              </div>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">Minimum $1, Maximum $10,000</p>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="secondary" fullWidth onClick={() => setShowDepositModal(false)} disabled={isDepositing}>
                Cancel
              </Button>
              <Button variant="primary" fullWidth type="submit" loading={isDepositing}>
                Continue to Payment
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}