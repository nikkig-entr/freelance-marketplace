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
import { Modal } from '@/components/ui/Modal';
import toast from 'react-hot-toast';

interface TransactionFilters {
  transaction_type?: TransactionType;
  page?: number;
  page_size?: number;
}

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

const getTransactionIcon = (type: TransactionType) => {
  switch (type) {
    case 'deposit':
      return <ArrowDownTrayIcon className="w-5 h-5 text-white" />;
    case 'withdrawal':
      return <ArrowUpTrayIcon className="w-5 h-5 text-[var(--color-gray-500)]" />;
    case 'project_payment':
      return <CurrencyDollarIcon className="w-5 h-5 text-white" />;
    case 'project_refund':
      return <ArrowDownTrayIcon className="w-5 h-5 text-white" />;
    case 'platform_fee':
      return <DocumentTextIcon className="w-5 h-5 text-[var(--color-gray-500)]" />;
    case 'subscription_payment':
      return <CurrencyDollarIcon className="w-5 h-5 text-white" />;
    case 'bid_bonus':
      return <CurrencyDollarIcon className="w-5 h-5 text-white" />;
    case 'referral_bonus':
      return <CurrencyDollarIcon className="w-5 h-5 text-white" />;
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
      return 'text-white';
    case 'withdrawal':
    case 'project_payment':
    case 'platform_fee':
    case 'subscription_payment':
      return 'text-[var(--color-gray-500)]';
    default:
      return 'text-[var(--color-text-muted)]';
  }
};

export function BalancePage() {
  useAuth();
  const [balance, setBalance] = useState<BalanceResponse | null>(null);
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

  const availableCents = (balance?.balance_cents || 0) - (balance?.pending_balance_cents || 0);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-[var(--color-text-subtle)] hover:text-[var(--color-text)] transition-colors">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="font-heading font-bold text-[var(--color-text)] text-[clamp(2rem,4vw,3rem)] tracking-tight">Balance</h1>
              <p className="mt-1 text-[var(--color-text-muted)] font-[Instrument_Serif] italic">Manage your funds and transactions</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" asChild className="border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white/10">
              <Link to="/withdrawal">
                <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
                Withdraw
              </Link>
            </Button>
            <Button onClick={() => setShowDepositModal(true)} className="border border-white px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black">
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Funds
            </Button>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="border border-white/15 p-6 lg:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Available Balance</p>
                <p className="font-heading font-bold text-[var(--color-text)] text-3xl mt-1">{formatCurrency(availableCents)}</p>
              </div>
              <div className="w-12 h-12 border border-white/15 flex items-center justify-center">
                <CurrencyDollarIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="border border-white/15 p-6 lg:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Pending</p>
                <p className="font-heading font-bold text-[var(--color-text)] text-3xl mt-1">{formatCurrency(balance?.pending_balance_cents || 0)}</p>
              </div>
              <div className="w-12 h-12 border border-white/15 flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-[var(--color-gray-500)]" />
              </div>
            </div>
          </div>

          <div className="border border-white/15 p-6 lg:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Total Balance</p>
                <p className="font-heading font-bold text-[var(--color-text)] text-3xl mt-1">{formatCurrency(balance?.balance_cents || 0)}</p>
              </div>
              <div className="w-12 h-12 border border-white/15 flex items-center justify-center">
                <CurrencyDollarIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="border border-white/15 overflow-hidden">
          <div className="p-6 border-b border-white/15 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <h2 className="font-heading font-semibold text-[var(--color-text)] text-[clamp(1.25rem,2vw,1.5rem)] tracking-tight">Transaction History</h2>
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 max-w-xs">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-subtle)]" />
                <input
                  type="search"
                  placeholder="Search transactions..."
                  className="w-full pl-10 pr-4 py-2.5 bg-transparent border border-white/15 text-[var(--color-text)] placeholder-[var(--color-text-subtle)] focus:ring-0 focus:border-white"
                />
              </div>
              <select
                value={filters.transaction_type || ''}
                onChange={(e) => setFilters({ ...filters, transaction_type: (e.target.value as TransactionType) || undefined, page: 1 })}
                className="w-auto border border-white/15 bg-transparent px-4 py-2.5 text-[var(--color-text)] appearance-none focus:ring-0 focus:border-white"
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
                  <div key={i} className="animate-pulse flex items-center gap-4 px-6 py-4 border-b border-white/15">
                    <div className="w-10 h-10 border border-white/15" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-white/10 w-1/3" />
                      <div className="h-3 bg-white/10 w-1/4" />
                    </div>
                    <div className="h-6 bg-white/10 w-24" />
                    <div className="h-6 bg-white/10 w-20" />
                  </div>
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-12 text-center">
                <DocumentTextIcon className="w-16 h-16 text-[var(--color-text-subtle)] mx-auto mb-4" />
                <h3 className="font-heading font-medium text-[var(--color-text)] text-xl">No transactions found</h3>
                <p className="mt-1 text-[var(--color-text-muted)]">Your transaction history will appear here</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="border-b border-white/15">
                  <tr>
                    <th className="px-6 py-4 text-left font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Transaction</th>
                    <th className="px-6 py-4 text-left font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Type</th>
                    <th className="px-6 py-4 text-left font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Amount</th>
                    <th className="px-6 py-4 text-left font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Balance After</th>
                    <th className="px-6 py-4 text-left font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Date</th>
                    <th className="px-6 py-4 text-left font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/15">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 border border-white/15 flex items-center justify-center">
                            {getTransactionIcon(tx.type)}
                          </div>
                          <div>
                            <p className="font-medium text-[var(--color-text)]">{tx.type.replace('_', ' ')}</p>
                            {tx.project_id && (
                              <p className="text-sm text-[var(--color-text-muted)] font-mono">Project #{tx.project_id}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 text-sm font-mono text-[var(--color-text)] border border-white/15">
                          {tx.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-mono font-medium ${getTransactionColor(tx.type)}`}>
                          {tx.amount_cents > 0 ? '+' : ''}{formatCurrency(tx.amount_cents)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[var(--color-text)] font-mono">{formatCurrency(tx.balance_after_cents)}</td>
                      <td className="px-6 py-4 text-[var(--color-text-muted)] font-mono">{formatDate(tx.created_at)}</td>
                      <td className="px-6 py-4 text-[var(--color-text-muted)] max-w-xs truncate">{tx.description || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="px-6 py-4 border-t border-white/15 flex items-center justify-between">
              <p className="font-mono text-xs text-[var(--color-text-muted)]">
                Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} transactions
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </nav>
          )}
        </div>

        {/* Deposit Modal */}
        <Modal
          isOpen={showDepositModal}
          onClose={() => setShowDepositModal(false)}
          title="Add Funds"
          size="md"
        >
          <form onSubmit={handleDeposit} className="space-y-4">
            <div>
              <label htmlFor="deposit-amount" className="block font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase mb-2">Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-subtle)] font-mono">$</span>
                <input
                  id="deposit-amount"
                  type="number"
                  min="1"
                  max="10000"
                  step="1"
                  placeholder="50"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  required
                  className="w-full border-0 border-b border-white/30 bg-transparent pl-8 py-3 text-lg placeholder-[var(--color-text-subtle)] focus:ring-0 focus:border-white"
                />
              </div>
              <p className="mt-1 font-mono text-xs text-[var(--color-text-muted)]">Minimum $1, Maximum $10,000</p>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="secondary" fullWidth onClick={() => setShowDepositModal(false)} disabled={isDepositing} className="border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white/10">
                Cancel
              </Button>
              <Button variant="primary" fullWidth type="submit" loading={isDepositing} className="border border-white px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black">
                Continue to Payment
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}