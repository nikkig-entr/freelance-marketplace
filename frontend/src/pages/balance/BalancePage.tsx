import { useState, useEffect } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { Transaction, TransactionType, formatCurrency, formatDate, getStatusColor } from '../../types';
import {
  ArrowLeftIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface TransactionFilters {
  transaction_type?: TransactionType;
  page?: number;
  page_size?: number;
}

export function BalancePage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [balance, setBalance] = useState<{ balance_cents: number; pending_cents: number; available_cents: number } | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
  }, [page, pageSize, filters]);

  const fetchBalance = async () => {
    try {
      const data = await api.getBalance();
      setBalance(data);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

  const fetchTransactions = async () => {
    setIsLoadingTransactions(true);
    try {
      const params = { ...filters, page, page_size: pageSize };
      const data = await api.getTransactions(params);
      setTransactions(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.total_pages || 0);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setIsLoadingTransactions(false);
      setIsLoading(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(depositAmount);
    if (!amount || amount < 1) {
      toast.error('Please enter a valid amount');
      return;
    }
    setIsDepositing(true);
    try {
      const data = await api.createDeposit(Math.round(amount * 100));
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
      setShowDepositModal(false);
      setDepositAmount('');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to create deposit');
    } finally {
      setIsDepositing(false);
    }
  };

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownTrayIcon className="w-5 h-5 text-green-600" />;
      case 'withdrawal':
        return <ArrowUpTrayIcon className="w-5 h-5 text-red-600" />;
      case 'project_payment':
      case 'project_release':
        return <CurrencyDollarIcon className="w-5 h-5 text-blue-600" />;
      case 'commission':
        return <DocumentTextIcon className="w-5 h-5 text-yellow-600" />;
      case 'refund':
        return <ArrowDownTrayIcon className="w-5 h-5 text-purple-600" />;
      case 'bonus':
        return <CurrencyDollarIcon className="w-5 h-5 text-green-600" />;
      default:
        return <CurrencyDollarIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: TransactionType) => {
    switch (type) {
      case 'deposit':
      case 'project_release':
      case 'bonus':
        return 'text-green-600';
      case 'withdrawal':
      case 'project_payment':
      case 'commission':
        return 'text-red-600';
      case 'refund':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link to="/projects" className="text-gray-500 hover:text-gray-700">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Balance</h1>
              <p className="mt-1 text-gray-600">Manage your funds and transactions</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/withdrawal" className="btn-secondary flex items-center gap-2">
              <ArrowUpTrayIcon className="w-5 h-5" />
              Withdraw
            </Link>
            <button onClick={() => setShowDepositModal(true)} className="btn-primary flex items-center gap-2">
              <PlusIcon className="w-5 h-5" />
              Add Funds
            </button>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Available Balance</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {balance ? formatCurrency(balance.available_cents) : '$0.00'}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {balance ? formatCurrency(balance.pending_cents) : '$0.00'}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Balance</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {balance ? formatCurrency(balance.balance_cents) : '$0.00'}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <CurrencyDollarIcon className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="card">
          <div className="p-4 border-b border-gray-200 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 max-w-xs">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search transactions..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <select
                value={filters.transaction_type || ''}
                onChange={(e) => setFilters({ ...filters, transaction_type: e.target.value || undefined, page: 1 })}
                className="input w-auto py-2"
              >
                <option value="">All Types</option>
                <option value="deposit">Deposits</option>
                <option value="withdrawal">Withdrawals</option>
                <option value="project_payment">Project Payments</option>
                <option value="project_release">Project Releases</option>
                <option value="commission">Commissions</option>
                <option value="refund">Refunds</option>
                <option value="bonus">Bonuses</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoadingTransactions ? (
              <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center gap-4 px-6 py-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                      <div className="h-3 bg-gray-200 rounded w-1/4" />
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-24" />
                    <div className="h-6 bg-gray-200 rounded w-20" />
                  </div>
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-12 text-center">
                <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No transactions found</h3>
                <p className="mt-1 text-gray-500">Your transaction history will appear here</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance After</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                            {getTransactionIcon(tx.transaction_type)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {tx.transaction_type.replace('_', ' ')}
                            </p>
                            {tx.project_id && (
                              <p className="text-sm text-gray-500">Project #{tx.project_id}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${getStatusColor(tx.transaction_type as any)}`}>
                          {tx.transaction_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-medium ${getTransactionColor(tx.transaction_type)}`}>
                          {tx.amount_cents > 0 ? '+' : ''}{formatCurrency(tx.amount_cents)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {formatCurrency(tx.balance_after_cents)}
                      </td>
                      <td className="px-6 py-4 text-gray-500">{formatDate(tx.created_at)}</td>
                      <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{tx.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} transactions
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-secondary px-3 py-2 text-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn-secondary px-3 py-2 text-sm"
                >
                  Next
                </button>
              </div>
            </nav>
          )}
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Add Funds</h2>
              <button onClick={() => setShowDepositModal(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleDeposit} className="p-6 space-y-4">
              <div>
                <label htmlFor="deposit-amount" className="label">Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    id="deposit-amount"
                    type="number"
                    min="1"
                    max="10000"
                    step="1"
                    className="input pl-8"
                    placeholder="50"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    required
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">Minimum $1, Maximum $10,000</p>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowDepositModal(false)} className="flex-1 btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isDepositing} className="flex-1 btn-primary">
                  {isDepositing ? 'Processing...' : 'Continue to Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Need to import Link, ClockIcon
import { Link } from '@tanstack/react-router';
import { ClockIcon } from '@heroicons/react/24/outline';