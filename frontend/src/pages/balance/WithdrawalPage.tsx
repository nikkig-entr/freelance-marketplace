import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { balanceService } from '@/services/api';
import { Withdrawal, formatCurrency, formatDate } from '@/types';
import {
  ArrowLeftIcon,
  BanknotesIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import toast from 'react-hot-toast';

type WithdrawalMethod = 'bank_transfer' | 'stripe' | 'crypto' | 'paypal';

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
    icon: <CurrencyDollarIcon className="w-6 h-6" />,
    description: 'USDC/USDT on Ethereum, Polygon, or BSC (instant)',
  },
  {
    value: 'paypal',
    label: 'PayPal',
    icon: <CurrencyDollarIcon className="w-6 h-6" />,
    description: 'Transfer to your PayPal account (1-2 business days)',
  },
];

export function WithdrawalPage() {
  const { user } = useAuth();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
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
      const data = await balanceService.withdrawals() as { items: Withdrawal[] };
      setWithdrawals(data.items || []);
    } catch {
      toast.error('Failed to load withdrawals');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: WithdrawalForm) => {
    const amountCents = Math.round(parseFloat(data.amount_cents) * 100);
    if (!amountCents || amountCents < 1000) {
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
      await balanceService.withdraw({
        amount_cents: amountCents,
        method: data.method,
        method_details: methodDetails,
      });
      toast.success('Withdrawal request submitted!');
      setShowSuccessModal(true);
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
    } catch {
      toast.error('Failed to submit withdrawal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMethodFields = (method: WithdrawalMethod) => {
    switch (method) {
      case 'bank_transfer':
        return (
          <div className="space-y-4">
            <Input
              label="Account Holder Name *"
              id="bank_account_name"
              type="text"
              error={errors.bank_account_name?.message}
              className="border-0 border-b border-white/30 bg-transparent px-0 py-3 text-lg placeholder-[var(--color-text-subtle)] focus:ring-0 focus:border-white"
              {...register('bank_account_name', { required: 'Account name is required' })}
            />
            <Input
              label="Account Number *"
              id="bank_account_number"
              type="text"
              error={errors.bank_account_number?.message}
              className="border-0 border-b border-white/30 bg-transparent px-0 py-3 text-lg placeholder-[var(--color-text-subtle)] focus:ring-0 focus:border-white"
              {...register('bank_account_number', { required: 'Account number is required' })}
            />
            <Input
              label="Routing Number (ABA) *"
              id="bank_routing_number"
              type="text"
              error={errors.bank_routing_number?.message}
              className="border-0 border-b border-white/30 bg-transparent px-0 py-3 text-lg placeholder-[var(--color-text-subtle)] focus:ring-0 focus:border-white"
              {...register('bank_routing_number', { required: 'Routing number is required' })}
            />
            <Input
              label="SWIFT/BIC (for international)"
              id="bank_swift_bic"
              type="text"
              className="border-0 border-b border-white/30 bg-transparent px-0 py-3 text-lg placeholder-[var(--color-text-subtle)] focus:ring-0 focus:border-white"
              {...register('bank_swift_bic')}
            />
          </div>
        );
      case 'stripe':
        return (
          <div className="space-y-4">
            <Input
              label="Stripe Account Email *"
              id="stripe_email"
              type="email"
              error={errors.stripe_email?.message}
              className="border-0 border-b border-white/30 bg-transparent px-0 py-3 text-lg placeholder-[var(--color-text-subtle)] focus:ring-0 focus:border-white"
              {...register('stripe_email', { required: 'Email is required' })}
            />
            <p className="font-mono text-xs text-[var(--color-text-muted)]">Make sure your Stripe account is connected in Settings</p>
          </div>
        );
      case 'crypto':
        return (
          <div className="space-y-4">
            <Input
              label="Wallet Address *"
              id="crypto_address"
              type="text"
              placeholder="0x..."
              error={errors.crypto_address?.message}
              className="border-0 border-b border-white/30 bg-transparent px-0 py-3 text-lg placeholder-[var(--color-text-subtle)] focus:ring-0 focus:border-white"
              {...register('crypto_address', { required: 'Wallet address is required' })}
            />
            <div>
              <label htmlFor="crypto_network" className="block font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase mb-2">Network *</label>
              <select
                id="crypto_network"
                className="w-full border-0 border-b border-white/30 bg-transparent px-0 py-3 text-lg appearance-none text-[var(--color-text)] focus:ring-0 focus:border-white"
                {...register('crypto_network', { required: 'Network is required' })}
              >
                <option value="">Select network</option>
                <option value="ethereum">Ethereum (ERC-20)</option>
                <option value="polygon">Polygon (MATIC)</option>
                <option value="bsc">Binance Smart Chain (BEP-20)</option>
                <option value="arbitrum">Arbitrum</option>
                <option value="optimism">Optimism</option>
              </select>
              {errors.crypto_network && <p className="mt-1 font-mono text-xs text-[var(--color-gray-500)]">{errors.crypto_network.message}</p>}
            </div>
            <p className="font-mono text-xs text-[var(--color-text-muted)]">Only USDC/USDT stablecoins supported. Minimum $10.</p>
          </div>
        );
      case 'paypal':
        return (
          <div className="space-y-4">
            <Input
              label="PayPal Email *"
              id="paypal_email"
              type="email"
              error={errors.paypal_email?.message}
              className="border-0 border-b border-white/30 bg-transparent px-0 py-3 text-lg placeholder-[var(--color-text-subtle)] focus:ring-0 focus:border-white"
              {...register('paypal_email', { required: 'Email is required' })}
            />
            <p className="font-mono text-xs text-[var(--color-text-muted)]">Funds will be sent to this PayPal account</p>
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (status: Withdrawal['status']) => {
    return (
      <span className="inline-flex items-center px-3 py-1 text-sm font-mono text-[var(--color-text)] border border-white/15">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const commissionRate = 0.05;
  const amountCents = amount ? Math.round(parseFloat(amount) * 100) : 0;
  const commissionCents = Math.round(amountCents * commissionRate);
  const netCents = amountCents - commissionCents;
  const userBalance = user?.balance_cents ?? 0;

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="container py-8 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <Link to="/balance" className="text-[var(--color-text-subtle)] hover:text-[var(--color-text)] transition-colors">
            <ArrowLeftIcon className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="font-heading font-bold text-[var(--color-text)] text-[clamp(2rem,4vw,3rem)] tracking-tight">Withdraw Funds</h1>
            <p className="mt-1 text-[var(--color-text-muted)] font-[Instrument_Serif] italic">Transfer your earnings to your preferred payment method</p>
          </div>
        </div>

        {/* Available Balance */}
        <div className="border border-white/15 p-6 lg:p-8 mb-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Available Balance</p>
              <p className="font-heading font-bold text-[var(--color-text)] text-3xl mt-1">{formatCurrency(userBalance)}</p>
            </div>
            <div className="w-16 h-16 border border-white/15 flex items-center justify-center">
              <CurrencyDollarIcon className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Withdrawal Form */}
        <div className="border border-white/15 p-6 lg:p-8 mb-10">
          <h2 className="font-heading font-semibold text-[var(--color-text)] text-[clamp(1.25rem,2vw,1.5rem)] tracking-tight mb-8 border-b border-white/15 pb-4">New Withdrawal</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase mb-2">Amount (USD) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-subtle)] font-mono">$</span>
                <input
                  id="amount"
                  type="number"
                  min="10"
                  max={userBalance / 100 || 10000}
                  step="0.01"
                  placeholder="50.00"
                  className={`w-full border-0 border-b border-white/30 bg-transparent pl-8 py-3 text-lg placeholder-[var(--color-text-subtle)] focus:ring-0 focus:border-white ${errors.amount_cents ? 'border-[var(--color-gray-500)]' : ''}`}
                  {...register('amount_cents', {
                    required: 'Amount is required',
                    min: { value: 10, message: 'Minimum withdrawal is $10.00' },
                    max: { value: userBalance / 100 || 10000, message: 'Insufficient balance' },
                  })}
                />
              </div>
              {errors.amount_cents && <p className="mt-1 font-mono text-xs text-[var(--color-gray-500)]">{errors.amount_cents.message}</p>}
            </div>

            {/* Fee Summary */}
            {amountCents > 0 && (
              <div className="bg-white/5 border border-white/15 p-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-muted)] font-mono">Withdrawal Amount</span>
                  <span className="font-mono font-medium text-[var(--color-text)]">{formatCurrency(amountCents)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-muted)] font-mono">Platform Fee (5%)</span>
                  <span className="font-mono font-medium text-[var(--color-gray-500)]">-{formatCurrency(commissionCents)}</span>
                </div>
                <div className="border-t border-white/15 pt-2 flex justify-between">
                  <span className="font-mono font-medium text-[var(--color-text)]">You Will Receive</span>
                  <span className="font-heading font-semibold text-white text-lg">{formatCurrency(netCents)}</span>
                </div>
              </div>
            )}

            {/* Method Selection */}
            <div>
              <label className="block font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase mb-4">Withdrawal Method *</label>
              <div className="grid grid-cols-2 gap-3">
                {WITHDRAWAL_METHODS.map((method) => (
                  <label
                    key={method.value}
                    className={`relative cursor-pointer p-4 border-2 transition-all flex flex-col items-center gap-3 ${
                      selectedMethod === method.value
                        ? 'border-white bg-white/5'
                        : 'border-white/15 hover:border-white/30'
                    }`}
                  >
                    <input
                      type="radio"
                      value={method.value}
                      className="sr-only"
                      {...register('method', { onChange: () => setSelectedMethod(method.value) })}
                    />
                    <div className="w-12 h-12 border border-white/15 flex items-center justify-center text-[var(--color-text-muted)]">
                      {method.icon}
                    </div>
                    <span className="font-medium text-[var(--color-text)] text-center text-sm">{method.label}</span>
                    <p className="font-mono text-xs text-[var(--color-text-muted)] text-center">{method.description}</p>
                    {selectedMethod === method.value && (
                      <div className="absolute inset-0 border-2 border-white pointer-events-none" />
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Method-specific Fields */}
            <div className="border-t border-white/15 pt-8">
              {getMethodFields(selectedMethod)}
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-white/15">
              <Button type="submit" fullWidth size="lg" loading={isSubmitting} disabled={amountCents === 0} className="border border-white px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed">
                Submit Withdrawal Request
              </Button>
              <p className="text-center font-mono text-xs text-[var(--color-text-muted)] mt-3">
                By submitting, you agree to our{' '}
                <Link to="/terms" className="text-white hover:underline">Terms of Service</Link>
              </p>
            </div>
          </form>
        </div>

        {/* Withdrawal History */}
        <div className="border border-white/15 overflow-hidden">
          <div className="p-6 border-b border-white/15">
            <h2 className="font-heading font-semibold text-[var(--color-text)] text-[clamp(1.25rem,2vw,1.5rem)] tracking-tight">Withdrawal History</h2>
          </div>

          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-4 px-6 py-4 border-b border-white/15">
                  <div className="w-10 h-10 border border-white/15" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/10 w-1/3" />
                    <div className="h-3 bg-white/10 w-1/4" />
                  </div>
                  <div className="h-6 bg-white/10 w-24" />
                </div>
              ))}
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="p-12 text-center">
              <BanknotesIcon className="w-16 h-16 text-[var(--color-text-subtle)] mx-auto mb-4" />
              <h3 className="font-heading font-medium text-[var(--color-text)] text-xl">No withdrawals yet</h3>
              <p className="mt-1 text-[var(--color-text-muted)]">Your withdrawal history will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-white/15">
              {withdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="p-6 hover:bg-white/5 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusBadge(withdrawal.status)}
                        <span className="font-mono text-xs text-[var(--color-text-muted)]">{withdrawal.method.replace('_', ' ')}</span>
                      </div>
                      <p className="font-heading font-bold text-[var(--color-text)] text-2xl">{formatCurrency(withdrawal.amount_cents)}</p>
                      <p className="font-mono text-sm text-[var(--color-text-muted)] mt-1">
                        Net: {formatCurrency(withdrawal.net_amount_cents)} · Fee: {formatCurrency(withdrawal.platform_fee_cents + withdrawal.processing_fee_cents)}
                      </p>
                      <p className="font-mono text-sm text-[var(--color-text-muted)] mt-1">{formatDate(withdrawal.created_at)}</p>
                    </div>
                    <div className="text-right">
                      {withdrawal.status === 'pending' && (
                        <span className="font-mono text-xs text-[var(--color-gray-500)] flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          Under Review
                        </span>
                      )}
                      {withdrawal.status === 'completed' && (
                        <span className="font-mono text-xs text-white flex items-center gap-1">
                          <CheckCircleIcon className="w-4 h-4" />
                          Completed
                        </span>
                      )}
                      {withdrawal.status === 'failed' && (
                        <span className="font-mono text-xs text-[var(--color-gray-500)] flex items-center gap-1">
                          <ExclamationCircleIcon className="w-4 h-4" />
                          Failed
                        </span>
                      )}
                      {withdrawal.status === 'cancelled' && (
                        <span className="font-mono text-xs text-[var(--color-gray-500)] flex items-center gap-1">
                          <XCircleIcon className="w-4 h-4" />
                          Cancelled
                        </span>
                      )}
                    </div>
                  </div>
                  {withdrawal.rejection_reason && (
                    <div className="mt-3 p-3 border border-white/15 bg-white/5 font-mono text-sm text-[var(--color-gray-500)]">
                      <span className="font-medium">Reason:</span> {withdrawal.rejection_reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Success Modal */}
        <Modal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title="Request Submitted!"
          size="sm"
        >
          <div className="text-center">
            <div className="w-16 h-16 border border-white/15 flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-8 h-8 text-white" />
            </div>
            <p className="text-[var(--color-text-muted)]">Your withdrawal request has been submitted for review. You'll be notified once it's processed.</p>
            <Button variant="primary" fullWidth onClick={() => setShowSuccessModal(false)} className="mt-6 border border-white px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black">
              Done
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
}