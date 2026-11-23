import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  CurrencyDollarIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  BanknotesIcon,
  CreditCardIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Card, CardTitle, CardGrid } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner, ListLoader } from '@/components/ui/LoadingSpinner';
import { balanceService } from '@/services/api';
import { Transaction, Withdrawal } from '@/types';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const withdrawalMethods = [
  { value: 'stripe', label: 'Stripe Connect', description: 'Fast, secure bank transfers' },
  { value: 'bank_transfer', label: 'Bank Transfer', description: 'Direct to your bank account (2-5 business days)' },
  { value: 'paypal', label: 'PayPal', description: 'Instant to your PayPal account' },
];

export function BalancePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'withdrawals'>('overview');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('stripe');
  const [depositAmount, setDepositAmount] = useState('');
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [withdrawalsPage, setWithdrawalsPage] = useState(1);

  const { data: balance, isLoading: balanceLoading } = useQuery({
    queryKey: ['balance', user?.id],
    queryFn: () => balanceService.get(),
    enabled: !!user,
  });

  const { data: transactions, isLoading: txLoading } = useQuery({
    queryKey: ['transactions', user?.id, transactionsPage],
    queryFn: () => balanceService.transactions({ page: transactionsPage, page_size: 20 }),
    enabled: !!user,
  });

  const { data: withdrawals, isLoading: wdLoading } = useQuery({
    queryKey: ['withdrawals', user?.id, withdrawalsPage],
    queryFn: () => balanceService.withdrawals({ page: withdrawalsPage, page_size: 20 }),
    enabled: !!user,
  });

  const { mutate: withdraw } = useMutation({
    mutationFn: (data: { amount_cents: number; method: string }) => balanceService.withdraw(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
      toast.success('Withdrawal request submitted!');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Withdrawal failed');
    },
  });

  const { mutate: deposit } = useMutation({
    mutationFn: (data: { amount_cents: number }) => balanceService.deposit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Deposit initiated! Complete payment in Stripe.');
      setShowDepositModal(false);
      setDepositAmount('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Deposit failed');
    },
  });

  if (!user) return null;

  const availableBalance = balance?.balance_cents || 0;
  const pendingBalance = balance?.pending_balance_cents || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-secondary-900">Balance</h1>
          <p className="mt-1 text-secondary-600">Manage your earnings and withdrawals</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setShowDepositModal(true)} leftIcon={<ArrowDownTrayIcon className="w-4 h-4" />}>
            Add Funds
          </Button>
          <Button onClick={() => setShowWithdrawModal(true)} leftIcon={<ArrowUpTrayIcon className="w-4 h-4" />}>
            Withdraw
          </Button>
        </div>
      </div>

      {/* Balance Cards */}
      <CardGrid columns={3}>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Available Balance</p>
              <p className="mt-1 text-3xl font-bold text-secondary-900">${(availableBalance / 100).toLocaleString()}</p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-success-50 flex items-center justify-center">
              <CurrencyDollarIcon className="w-7 h-7 text-success-600" />
            </div>
          </div>
          <Button variant="outline" fullWidth className="mt-4" onClick={() => setShowWithdrawModal(true)}>
            Withdraw Funds
          </Button>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Pending Balance</p>
              <p className="mt-1 text-3xl font-bold text-warning-600">${(pendingBalance / 100).toLocaleString()}</p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-warning-50 flex items-center justify-center">
              <ArrowPathIcon className="w-7 h-7 text-warning-600" />
            </div>
          </div>
          <p className="mt-4 text-sm text-secondary-500">Funds pending clearance (14 days after project completion)</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Total Earned</p>
              <p className="mt-1 text-3xl font-bold text-secondary-900">
                ${((availableBalance + pendingBalance) / 100).toLocaleString()}
              </p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center">
              <BanknotesIcon className="w-7 h-7 text-primary-600" />
            </div>
          </div>
          <Button variant="outline" fullWidth className="mt-4" onClick={() => setActiveTab('transactions')}>
            View History
          </Button>
        </Card>
      </CardGrid>

      {/* Tabs */}
      <div className="border-b border-secondary-200">
        <nav className="flex gap-4" aria-label="Balance tabs">
          {[
            { id: 'overview', label: 'Overview', icon: CurrencyDollarIcon },
            { id: 'transactions', label: 'Transactions', icon: DocumentTextIcon },
            { id: 'withdrawals', label: 'Withdrawals', icon: BanknotesIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <Card>
          <CardTitle title="Recent Activity" />
          {balanceLoading ? (
            <ListLoader count={5} />
          ) : (
            <div className="space-y-3">
              {transactions?.items.slice(0, 5).map((tx: Transaction) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary-50">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      tx.amount_cents > 0 ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600'
                    }`}>
                      {tx.amount_cents > 0 ? <ArrowDownTrayIcon className="w-5 h-5" /> : <ArrowUpTrayIcon className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-secondary-900">
                        {tx.description || (tx.amount_cents > 0 ? 'Deposit' : 'Payment')}
                      </p>
                      <p className="text-sm text-secondary-500">{format(new Date(tx.created_at), 'MMM d, yyyy h:mm a')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${tx.amount_cents > 0 ? 'text-success-600' : 'text-danger-600'}`}>
                      {tx.amount_cents > 0 ? '+' : ''}${(tx.amount_cents / 100).toFixed(2)}
                    </p>
                    <p className="text-xs text-secondary-500">Balance: ${(tx.balance_after_cents / 100).toFixed(2)}</p>
                  </div>
                </div>
              ))}
              <Button variant="outline" fullWidth onClick={() => setActiveTab('transactions')}>
                View All Transactions
              </Button>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'transactions' && (
        <Card padding="none">
          <div className="p-4 border-b border-secondary-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Search transactions..."
                leftIcon={<MagnifyingGlassIcon className="w-4 h-4" />}
                className="max-w-xs"
              />
              <Select
                options={[
                  { value: 'all', label: 'All Types' },
                  { value: 'deposit', label: 'Deposits' },
                  { value: 'withdrawal', label: 'Withdrawals' },
                  { value: 'project_payment', label: 'Project Payments' },
                  { value: 'platform_fee', label: 'Platform Fees' },
                ]}
                className="max-w-xs"
              />
            </div>
          </div>
          {txLoading ? (
            <ListLoader count={10} />
          ) : (
            <div className="divide-y divide-secondary-200">
              {transactions?.items.map((tx: Transaction) => (
                <div key={tx.id} className="p-4 hover:bg-secondary-50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        tx.amount_cents > 0 ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600'
                      }`}>
                        {tx.amount_cents > 0 ? <ArrowDownTrayIcon className="w-5 h-5" /> : <ArrowUpTrayIcon className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-medium text-secondary-900">{tx.description || tx.type.replace('_', ' ')}</p>
                        <p className="text-sm text-secondary-500">{format(new Date(tx.created_at), 'MMM d, yyyy h:mm a')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <StatusBadge status={tx.type} size="sm" />
                      <div className="text-right">
                        <p className={`font-semibold ${tx.amount_cents > 0 ? 'text-success-600' : 'text-danger-600'}`}>
                          {tx.amount_cents > 0 ? '+' : ''}${(tx.amount_cents / 100).toFixed(2)}
                        </p>
                        <p className="text-xs text-secondary-500">Balance: ${(tx.balance_after_cents / 100).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {transactions?.items.length === 0 && (
                <div className="text-center py-12 text-secondary-500">No transactions found</div>
              )}
            </div>
          )}
          {transactions && transactions.total_pages > 1 && (
            <div className="p-4 border-t border-secondary-200 flex items-center justify-between">
              <Button variant="outline" size="sm" disabled={transactionsPage === 1} onClick={() => setTransactionsPage(p => p - 1)}>
                <ChevronLeftIcon className="w-4 h-4" /> Previous
              </Button>
              <span className="text-sm text-secondary-600">Page {transactionsPage} of {transactions.total_pages}</span>
              <Button variant="outline" size="sm" disabled={transactionsPage === transactions.total_pages} onClick={() => setTransactionsPage(p => p + 1)}>
                Next <ChevronRightIcon className="w-4 h-4" />
              </Button>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'withdrawals' && (
        <Card padding="none">
          <div className="p-4 border-b border-secondary-200 flex items-center justify-between">
            <h3 className="font-medium text-secondary-900">Withdrawal History</h3>
            <Button size="sm" onClick={() => setShowWithdrawModal(true)} leftIcon={<ArrowUpTrayIcon className="w-4 h-4" />}>
              New Withdrawal
            </Button>
          </div>
          {wdLoading ? (
            <ListLoader count={5} />
          ) : (
            <div className="divide-y divide-secondary-200">
              {withdrawals?.items.map((wd: Withdrawal) => (
                <div key={wd.id} className="p-4 hover:bg-secondary-50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                        <BanknotesIcon className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-secondary-900">
                          {wd.method.replace('_', ' ')} • ${(wd.net_amount_cents / 100).toFixed(2)}
                        </p>
                        <p className="text-sm text-secondary-500">{format(new Date(wd.created_at), 'MMM d, yyyy h:mm a')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <StatusBadge status={wd.status} size="sm" />
                      <div className="text-right">
                        <p className="font-semibold text-secondary-900">${(wd.amount_cents / 100).toFixed(2)}</p>
                        <p className="text-xs text-secondary-500">Fee: ${((wd.platform_fee_cents + wd.processing_fee_cents) / 100).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {withdrawals?.items.length === 0 && (
                <div className="text-center py-12 text-secondary-500">No withdrawals yet</div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Withdraw Modal */}
      <Modal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        title="Withdraw Funds"
        description="Transfer your earnings to your bank account"
        size="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (withdrawAmount) {
              withdraw({ amount_cents: parseFloat(withdrawAmount) * 100, method: withdrawMethod });
            }
          }}
          className="space-y-4"
        >
          <Input
            label="Amount (USD)"
            type="number"
            placeholder="100"
            min="10"
            max={availableBalance / 100}
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            required
          />
          <p className="text-sm text-secondary-500">Available: ${(availableBalance / 100).toLocaleString()}</p>

          <div>
            <label className="label">Withdrawal Method</label>
            <div className="space-y-2">
              {withdrawalMethods.map((method) => (
                <label key={method.value} className="flex items-center gap-3 p-3 rounded-xl border border-secondary-200 hover:border-primary-300 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="withdrawMethod"
                    value={method.value}
                    checked={withdrawMethod === method.value}
                    onChange={(e) => setWithdrawMethod(e.target.value)}
                    className="h-4 w-4 text-primary-600 border-secondary-300 focus:ring-primary-500"
                  />
                  <div>
                    <p className="font-medium text-secondary-900">{method.label}</p>
                    <p className="text-sm text-secondary-500">{method.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-secondary-50 p-4 rounded-xl">
            <div className="flex justify-between text-sm">
              <span className="text-secondary-600">Amount</span>
              <span className="font-medium text-secondary-900">${withdrawAmount || '0.00'}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-secondary-600">Estimated Fee (2.9% + $0.30)</span>
              <span className="font-medium text-secondary-900">
                ${withdrawAmount ? ((parseFloat(withdrawAmount) * 0.029) + 0.30).toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1 border-t border-secondary-200 pt-2">
              <span className="text-secondary-600">You'll Receive</span>
              <span className="font-semibold text-secondary-900">
                ${withdrawAmount ? (parseFloat(withdrawAmount) - ((parseFloat(withdrawAmount) * 0.029) + 0.30)).toFixed(2) : '0.00'}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setShowWithdrawModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={!withdrawAmount}>
              Request Withdrawal
            </Button>
          </div>
        </form>
      </Modal>

      {/* Deposit Modal */}
      <Modal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        title="Add Funds"
        description="Add funds to your account balance"
        size="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (depositAmount) {
              deposit({ amount_cents: parseFloat(depositAmount) * 100 });
            }
          }}
          className="space-y-4"
        >
          <Input
            label="Amount (USD)"
            type="number"
            placeholder="50"
            min="10"
            max="10000"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            required
          />
          <p className="text-sm text-secondary-500">Minimum $10, Maximum $10,000</p>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setShowDepositModal(false)}>
              Cancel
            </Button>
            <Button type="submit" leftIcon={<CreditCardIcon className="w-4 h-4" />} loading={!depositAmount}>
              Pay with Stripe
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}