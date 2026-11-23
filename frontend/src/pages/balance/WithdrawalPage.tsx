import { useState, useEffect } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { WithdrawalRequest, WithdrawalStatus, WithdrawalMethod, formatCurrency, formatDate, getStatusColor } from '../../types';
import {
  ArrowLeftIcon,
  BanknotesIcon,
  CreditCardIcon,
  CurrencyBitcoinIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface WithdrawalForm {
  amount_cents: string;
  method: WithdrawalMethod;
  bank_account_name: string;
  bank_account_number: string;
  bank_routing_number: string;
  bank_swift_bic: string;
  stripe_email: string;
  crypto_address: string;
  crypto_network: string;
  paypal_email: string;
}

const WITHDRAWAL_METHODS: { value: WithdrawalMethod; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: 'bank_transfer',
    label: 'Bank Transfer',
    icon: <BanknotesIcon className="w-6 h-6" />,
    description: 'Direct transfer to your bank account (2-5 business days)',
  },
  {
    value: 'stripe',
    label: 'Stripe',
    icon: <CreditCardIcon className="w-6 h-6" />,
    description: 'Instant transfer to your connected Stripe account',
  },
  {
    value: 'crypto',
    label: 'Cryptocurrency',
    icon: <CurrencyBitcoinIcon className="w-6 h-6" />,
    description: 'USDC/USDT on Ethereum, Polygon, or BSC (instant)',
  },
  {
    value: 'paypal',
    label: 'PayPal',
    icon: <CurrencyDollarIcon className="w-6 h-6" />,
    description: 'Transfer to your PayPal account (1-2 business days)',
  },
];

// Need to import CurrencyDollarIcon
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';

export function WithdrawalPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<WithdrawalMethod>('bank_transfer');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<WithdrawalForm>({
    defaultValues: {
      method: 'bank_transfer',
    },
  });

  const amount = watch('amount_cents');

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const data = await api.getWithdrawals();
      setWithdrawals(data.items || []);
    } catch (error) {
      toast.error('Failed to load withdrawals');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: WithdrawalForm) => {
    const amountCents = Math.round(parseFloat(data.amount_cents) * 100);
    if (!amountCents || amountCents < 1000) { // $10 minimum
      toast.error('Minimum withdrawal amount is $10.00');
      return;
    }
    if (user && amountCents > user.balance_cents) {
      toast.error('Insufficient balance');
      return;
    }

    const methodDetails: Record<string, unknown> = {};
    switch (data.method) {
      case 'bank_transfer':
        methodDetails.account_name = data.bank_account_name;
        methodDetails.account_number = data.bank_account_number;
        methodDetails.routing_number = data.bank_routing_number;
        methodDetails.swift_bic = data.bank_swift_bic;
        break;
      case 'stripe':
        methodDetails.email = data.stripe_email;
        break;
      case 'crypto':
        methodDetails.address = data.crypto_address;
        methodDetails.network = data.crypto_network;
        break;
      case 'paypal':
        methodDetails.email = data.paypal_email;
        break;
    }

    setIsSubmitting(true);
    try {
      await api.createWithdrawal({
        amount_cents: amountCents,
        method: data.method,
        method_details: methodDetails,
      });
      toast.success('Withdrawal request submitted!');
      setShowSuccessModal(true);
      // Reset form
      setValue('amount_cents', '');
      setValue('bank_account_name', '');
      setValue('bank_account_number', '');
      setValue('bank_routing_number', '');
      setValue('bank_swift_bic', '');
      setValue('stripe_email', '');
      setValue('crypto_address', '');
      setValue('crypto_network', '');
      setValue('paypal_email', '');
      fetchWithdrawals();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to submit withdrawal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMethodFields = (method: WithdrawalMethod) => {
    switch (method) {
      case 'bank_transfer':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="bank_account_name" className="label">Account Holder Name *</label>
              <input
                id="bank_account_name"
                type="text"
                className={`input ${errors.bank_account_name ? 'input-error' : ''}`}
                {...register('bank_account_name', { required: 'Account name is required' })}
              />
              {errors.bank_account_name && <p className="mt-1 text-sm text-red-600">{errors.bank_account_name.message}</p>}
            </div>
            <div>
              <label htmlFor="bank_account_number" className="label">Account Number *</label>
              <input
                id="bank_account_number"
                type="text"
                className={`input ${errors.bank_account_number ? 'input-error' : ''}`}
                {...register('bank_account_number', { required: 'Account number is required' })}
              />
              {errors.bank_account_number && <p className="mt-1 text-sm text-red-600">{errors.bank_account_number.message}</p>}
            </div>
            <div>
              <label htmlFor="bank_routing_number" className="label">Routing Number (ABA) *</label>
              <input
                id="bank_routing_number"
                type="text"
                className={`input ${errors.bank_routing_number ? 'input-error' : ''}`}
                {...register('bank_routing_number', { required: 'Routing number is required' })}
              />
              {errors.bank_routing_number && <p className="mt-1 text-sm text-red-600">{errors.bank_routing_number.message}</p>}
            </div>
            <div>
              <label htmlFor="bank_swift_bic" className="label">SWIFT/BIC (for international)</label>
              <input
                id="bank_swift_bic"
                type="text"
                className="input"
                {...register('bank_swift_bic')}
              />
            </div>
          </div>
        );
      case 'stripe':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="stripe_email" className="label">Stripe Account Email *</label>
              <input
                id="stripe_email"
                type="email"
                className={`input ${errors.stripe_email ? 'input-error' : ''}`}
                {...register('stripe_email', { required: 'Email is required' })}
              />
              {errors.stripe_email && <p className="mt-1 text-sm text-red-600">{errors.stripe_email.message}</p>}
            </div>
            <p className="text-sm text-gray-500">Make sure your Stripe account is connected in Settings</p>
          </div>
        );
      case 'crypto':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="crypto_address" className="label">Wallet Address *</label>
              <input
                id="crypto_address"
                type="text"
                className={`input ${errors.crypto_address ? 'input-error' : ''}`}
                placeholder="0x..."
                {...register('crypto_address', { required: 'Wallet address is required' })}
              />
              {errors.crypto_address && <p className="mt-1 text-sm text-red-600">{errors.crypto_address.message}</p>}
            </div>
            <div>
              <label htmlFor="crypto_network" className="label">Network *</label>
              <select
                id="crypto_network"
                className={`input ${errors.crypto_network ? 'input-error' : ''}`}
                {...register('crypto_network', { required: 'Network is required' })}
              >
                <option value="">Select network</option>
                <option value="ethereum">Ethereum (ERC-20)</option>
                <option value="polygon">Polygon (MATIC)</option>
                <option value="bsc">Binance Smart Chain (BEP-20)</option>
                <option value="arbitrum">Arbitrum</option>
                <option value="optimism">Optimism</option>
              </select>
              {errors.crypto_network && <p className="mt-1 text-sm text-red-600">{errors.crypto_network.message}</p>}
            </div>
            <p className="text-sm text-gray-500">Only USDC/USDT stablecoins supported. Minimum $10.</p>
          </div>
        );
      case 'paypal':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="paypal_email" className="label">PayPal Email *</label>
              <input
                id="paypal_email"
                type="email"
                className={`input ${errors.paypal_email ? 'input-error' : ''}`}
                {...register('paypal_email', { required: 'Email is required' })}
              />
              {errors.paypal_email && <p className="mt-1 text-sm text-red-600">{errors.paypal_email.message}</p>}
            </div>
            <p className="text-sm text-gray-500">Funds will be sent to this PayPal account</p>
          </div>
        );
      default:
        return null;
    }
  };

  const commissionRate = 0.05; // 5%
  const amountCents = amount ? Math.round(parseFloat(amount) * 100) : 0;
  const commissionCents = Math.round(amountCents * commissionRate);
  const netCents = amountCents - commissionCents;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/balance" className="text-gray-500 hover:text-gray-700">
            <ArrowLeftIcon className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Withdraw Funds</h1>
            <p className="mt-1 text-gray-600">Transfer your earnings to your preferred payment method</p>
          </div>
        </div>

        {/* Available Balance */}
        <div className="card p-6 mb-8 bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-700">Available Balance</p>
              <p className="text-3xl font-bold text-primary-900 mt-1">
                {user ? formatCurrency(user.balance_cents) : '$0.00'}
              </p>
            </div>
            <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center">
              <CurrencyDollarIcon className="w-8 h-8 text-primary-600" />
            </div>
          </div>
        </div>

        {/* Withdrawal Form */}
        <div className="card p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">New Withdrawal</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Amount */}
            <div>
              <label htmlFor="amount" className="label">Amount (USD) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  id="amount"
                  type="number"
                  min="10"
                  max={user?.balance_cents / 100 || 10000}
                  step="0.01"
                  className={`input pl-8 ${errors.amount_cents ? 'input-error' : ''}`}
                  placeholder="50.00"
                  {...register('amount_cents', {
                    required: 'Amount is required',
                    min: { value: 10, message: 'Minimum withdrawal is $10.00' },
                    max: { value: user?.balance_cents / 100 || 10000, message: 'Insufficient balance' },
                  })}
                />
              </div>
              {errors.amount_cents && <p className="mt-1 text-sm text-red-600">{errors.amount_cents.message}</p>}
            </div>

            {/* Fee Summary */}
            {amountCents > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Withdrawal Amount</span>
                  <span className="font-medium text-gray-900">{formatCurrency(amountCents)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Platform Fee (5%)</span>
                  <span className="font-medium text-red-600">-{formatCurrency(commissionCents)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between">
                  <span className="font-medium text-gray-900">You Will Receive</span>
                  <span className="font-semibold text-green-600 text-lg">{formatCurrency(netCents)}</span>
                </div>
              </div>
            )}

            {/* Method Selection */}
            <div>
              <label className="label">Withdrawal Method *</label>
              <div className="grid grid-cols-2 gap-3">
                {WITHDRAWAL_METHODS.map((method) => (
                  <label
                    key={method.value}
                    className={`relative cursor-pointer p-4 border-2 rounded-xl transition-all flex flex-col items-center gap-3 ${
                      selectedMethod === method.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      value={method.value}
                      className="sr-only"
                      onChange={() => setSelectedMethod(method.value)}
                      {...register('method')}
                    />
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600">
                      {method.icon}
                    </div>
                    <span className="font-medium text-gray-900 text-center">{method.label}</span>
                    <p className="text-xs text-gray-500 text-center">{method.description}</p>
                    {selectedMethod === method.value && (
                      <div className="absolute inset-0 border-2 border-primary-500 rounded-xl pointer-events-none" />
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Method-specific Fields */}
            <div className="border-t border-gray-200 pt-6">
              {getMethodFields(selectedMethod)}
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-gray-200">
              <button type="submit" disabled={isSubmitting || amountCents === 0} className="w-full btn-primary py-3">
                {isSubmitting ? (
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  'Submit Withdrawal Request'
                )}
              </button>
              <p className="text-center text-sm text-gray-500 mt-3">
                By submitting, you agree to our{' '}
                <Link to="#" className="text-primary-600 hover:text-primary-500">Terms of Service</Link>
              </p>
            </div>
          </form>
        </div>

        {/* Withdrawal History */}
        <div className="card">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Withdrawal History</h2>
          </div>

          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-4 px-6 py-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-24" />
                </div>
              ))}
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="p-12 text-center">
              <BanknotesIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No withdrawals yet</h3>
              <p className="mt-1 text-gray-500">Your withdrawal history will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {withdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`badge ${getStatusColor(withdrawal.status)}`}>
                          {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500">{withdrawal.method.replace('_', ' ')}</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(withdrawal.amount_cents)}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Net: {formatCurrency(withdrawal.net_amount_cents)} · Fee: {formatCurrency(withdrawal.commission_cents)}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">{formatDate(withdrawal.created_at)}</p>
                    </div>
                    <div className="text-right">
                      {withdrawal.status === 'pending' && (
                        <span className="text-sm text-yellow-600 flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          Under Review
                        </span>
                      )}
                      {withdrawal.status === 'approved' && (
                        <span className="text-sm text-blue-600 flex items-center gap-1">
                          <CheckCircleIcon className="w-4 h-4" />
                          Approved
                        </span>
                      )}
                      {withdrawal.status === 'processing' && (
                        <span className="text-sm text-primary-600 flex items-center gap-1">
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Processing
                        </span>
                      )}
                      {withdrawal.status === 'completed' && (
                        <span className="text-sm text-green-600 flex items-center gap-1">
                          <CheckCircleIcon className="w-4 h-4" />
                          Completed
                        </span>
                      )}
                      {withdrawal.status === 'rejected' && (
                        <span className="text-sm text-red-600 flex items-center gap-1">
                          <XCircleIcon className="w-4 h-4" />
                          Rejected
                        </span>
                      )}
                      {withdrawal.status === 'failed' && (
                        <span className="text-sm text-red-600 flex items-center gap-1">
                          <ExclamationCircleIcon className="w-4 h-4" />
                          Failed
                        </span>
                      )}
                    </div>
                  </div>
                  {withdrawal.admin_notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                      <span className="font-medium">Admin Notes:</span> {withdrawal.admin_notes}
                    </div>
                  )}
                  {withdrawal.failure_reason && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg text-sm text-red-600">
                      <span className="font-medium">Reason:</span> {withdrawal.failure_reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Request Submitted!</h2>
            <p className="mt-2 text-gray-600">Your withdrawal request has been submitted for review. You'll be notified once it's processed.</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="mt-6 btn-primary"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}