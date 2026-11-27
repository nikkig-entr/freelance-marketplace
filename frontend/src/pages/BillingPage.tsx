import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCardIcon, CheckCircleIcon, InformationCircleIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { billingService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface Invoice {
  id: string;
  created_at: string;
  description: string | null;
  amount_cents: number;
  status: string;
}

const PLAN_FEATURES: Record<string, string[]> = {
  starter: [
    'Up to 2 bids per week',
    '5% platform commission',
    'Basic project search',
    'Standard support',
    '1 team seat',
  ],
  pro: [
    'Unlimited bids',
    '3% platform commission',
    'AI-powered project matching',
    'Priority support',
    '1 team seat',
    'Advanced analytics',
    'Custom proposals',
  ],
  agency: [
    'Unlimited bids',
    '2% platform commission',
    'AI-powered project matching',
    'Priority support',
    '5 team seats',
    'Advanced analytics',
    'Custom proposals',
    'White-label options',
    'Dedicated account manager',
  ],
};

const PLAN_PRICES: Record<string, { monthly: number; yearly: number }> = {
  starter: { monthly: 0, yearly: 0 },
  pro: { monthly: 2900, yearly: 29000 },
  agency: { monthly: 9900, yearly: 99000 },
};

export function BillingPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [showPortalModal, setShowPortalModal] = useState(false);
  const [portalUrl, setPortalUrl] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  const { data: invoices, isLoading: invoicesLoading } = useQuery<Invoice[]>({
    queryKey: ['invoices'],
    queryFn: () => billingService.getInvoices() as Promise<Invoice[]>,
    enabled: !!user,
  });

  const subscribeMutation = useMutation({
    mutationFn: ({ plan, interval }: { plan: string; interval: string }) => billingService.subscribe(plan, interval) as Promise<{ checkout_url?: string }>,
    onSuccess: (data: { checkout_url?: string }) => {
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        toast.success('Subscription created successfully!');
        queryClient.invalidateQueries({ queryKey: ['subscription'] });
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Failed to create subscription');
    },
  });

  const portalMutation = useMutation({
    mutationFn: billingService.getPortalUrl as () => Promise<{ portal_url?: string }>,
    onSuccess: (data: { portal_url?: string }) => {
      if (data.portal_url) {
        setPortalUrl(data.portal_url);
        setShowPortalModal(true);
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Failed to open billing portal');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: billingService.cancelSubscription,
    onSuccess: () => {
      toast.success('Subscription cancelled at period end');
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      setShowCancelModal(false);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Failed to cancel subscription');
    },
  });

  if (!user) return null;

  const currentPlan = user.plan;
  const isProOrAgency = currentPlan === 'pro' || currentPlan === 'agency';

  const getStatusBorder = (status: string): string => {
    switch (status) {
      case 'paid':
        return 'border-white';
      case 'pending':
        return 'border-white/15';
      case 'failed':
        return 'border-white';
      default:
        return 'border-white/15';
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] container py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading font-bold text-[var(--color-text)] text-[clamp(2rem,4vw,3rem)] tracking-tight">Billing & Subscription</h1>
        <p className="mt-1 text-[var(--color-text-muted)] font-[Instrument_Serif] italic">Manage your plan, payment methods, and billing history</p>
      </div>

      {/* Current Plan */}
      <div className="border border-white/15 p-6">
        <div className="mb-6">
          <p className="font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Current Plan</p>
          <p className="font-heading font-semibold text-[var(--color-text)] text-xl mt-1">You're on the {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} plan</p>
        </div>
        <div className="flex items-center justify-between p-6 border border-white/15">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 border border-white/15 flex items-center justify-center">
              <CurrencyDollarIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="font-heading font-bold text-[var(--color-text)] text-2xl capitalize">{currentPlan}</p>
              <p className="font-mono text-xs text-[var(--color-text-muted)]">
                {currentPlan === 'starter' ? 'Free forever' : billingInterval === 'year' ? 'Billed yearly' : 'Billed monthly'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isProOrAgency && (
              <button
                onClick={() => portalMutation.mutate()}
                className="border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-colors"
              >
                Manage in Portal
              </button>
            )}
          </div>
        </div>

        {/* Subscription Status */}
        {isProOrAgency && (
          <div className="mt-4 p-4 border border-white/15">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 border border-white flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-[var(--color-text)]">Active Subscription</p>
                  <p className="font-mono text-xs text-[var(--color-text-muted)]">
                    Manage your subscription in the billing portal
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCancelModal(true)}
                className="border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-colors"
              >
                Cancel Plan
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Plans Comparison */}
      <div className="border border-white/15 p-6">
        <div className="mb-6">
          <p className="font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Available Plans</p>
          <p className="font-heading font-semibold text-[var(--color-text)] text-xl mt-1">Choose the plan that fits your needs</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {(['starter', 'pro', 'agency'] as const).map((plan) => {
            const price = PLAN_PRICES[plan];
            const features = PLAN_FEATURES[plan];
            const isCurrent = plan === currentPlan;
            const isUpgrade = (plan === 'pro' && currentPlan === 'starter') || (plan === 'agency' && currentPlan === 'pro');

            return (
              <div
                key={plan}
                className={`relative rounded-none p-6 border-2 transition-all ${
                  isCurrent
                    ? 'border-white bg-white/5'
                    : 'border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/5'
                }`}
              >
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="border border-white px-3 py-1 font-mono text-xs uppercase tracking-[0.2em]">Current Plan</span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <p className="font-heading font-medium text-[var(--color-text-muted)] capitalize text-lg">{plan}</p>
                  <div className="mt-2 flex items-baseline justify-center gap-1">
                    <span className="font-heading font-bold text-[var(--color-text)] text-4xl">
                      {price.monthly === 0 ? 'Free' : `$${(billingInterval === 'year' ? price.yearly : price.monthly) / 100}`}
                    </span>
                    <span className="font-mono text-xs text-[var(--color-text-muted)]">/{billingInterval === 'year' ? 'year' : 'month'}</span>
                  </div>
                  {price.yearly > 0 && (
                    <p className="font-mono text-xs text-white mt-1">
                      {billingInterval === 'month' ? `Save ${Math.round((1 - price.yearly / (price.monthly * 12)) * 100)}% yearly` : 'Best value'}
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircleIcon className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                      <span className="text-[var(--color-text-muted)]">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => isCurrent ? null : subscribeMutation.mutate({ plan, interval: billingInterval })}
                  disabled={isCurrent || subscribeMutation.isPending}
                  className={`w-full py-3 font-mono text-xs uppercase tracking-[0.2em] transition-colors ${
                    isCurrent
                      ? 'border border-white/15 hover:bg-white/10'
                      : isUpgrade
                        ? 'border border-white hover:bg-white hover:text-black'
                        : 'border border-white/15 hover:bg-white/10'
                  }`}
                >
                  {subscribeMutation.isPending ? 'Processing...' : isCurrent ? 'Current Plan' : isUpgrade ? 'Upgrade' : 'Downgrade'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Billing Interval Toggle */}
        <div className="pt-6 border-t border-white/15">
          <div className="flex items-center justify-center gap-4">
            <span className={`font-medium ${billingInterval === 'month' ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'}`}>
              Monthly
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={billingInterval === 'year'}
                onChange={(e) => setBillingInterval(e.target.checked ? 'year' : 'month')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 border border-white/15 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-white rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-white/15 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white"></div>
            </label>
            <span className={`font-medium ${billingInterval === 'year' ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'}`}>
              Yearly
              {PLAN_PRICES.pro.yearly > 0 && <span className="border border-white ml-1 px-2 py-0.5 font-mono text-xs uppercase tracking-[0.2em]">Save 20%</span>}
            </span>
          </div>
        </div>
      </div>

      {/* Billing History */}
      <div className="border border-white/15 p-6">
        <div className="mb-6">
          <p className="font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Billing History</p>
          <p className="font-heading font-semibold text-[var(--color-text)] text-xl mt-1">Your invoices and receipts</p>
        </div>
        {invoicesLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-[var(--color-text-muted)]">Loading invoices...</p>
          </div>
        ) : invoices && invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/15 text-left text-sm font-mono text-[var(--color-text-muted)] tracking-wider uppercase">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Description</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                  <th className="pb-3 font-medium text-right">Status</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/15">
                {invoices.map((invoice: Invoice) => (
                  <tr key={invoice.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 font-mono text-[var(--color-text)]">{new Date(invoice.created_at).toLocaleDateString()}</td>
                    <td className="py-4 text-[var(--color-text-muted)]">{invoice.description || `Invoice #${invoice.id}`}</td>
                    <td className="py-4 text-right font-mono font-medium text-[var(--color-text)]">${(invoice.amount_cents / 100).toFixed(2)}</td>
                    <td className="py-4 text-right">
                      <span className={`inline-flex items-center px-3 py-1 text-sm font-mono text-[var(--color-text)] ${getStatusBorder(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button className="border border-white/15 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-colors">
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 border border-white/15 flex items-center justify-center mx-auto mb-4">
              <CurrencyDollarIcon className="w-8 h-8 text-[var(--color-text-subtle)]" />
            </div>
            <p className="text-[var(--color-text-muted)] mb-4">No billing history yet</p>
            <p className="font-mono text-xs text-[var(--color-text-subtle)]">Your invoices will appear here after your first payment</p>
          </div>
        )}
      </div>

      {/* Payment Methods */}
      <div className="border border-white/15 p-6">
        <div className="mb-6">
          <p className="font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Payment Methods</p>
          <p className="font-heading font-semibold text-[var(--color-text)] text-xl mt-1">Manage your saved payment methods</p>
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 border border-white/15 flex items-center justify-center mx-auto mb-4">
            <CreditCardIcon className="w-8 h-8 text-[var(--color-text-subtle)]" />
          </div>
          <p className="text-[var(--color-text-muted)] mb-4">Payment methods are managed through Stripe</p>
          <button
            onClick={() => portalMutation.mutate()}
            className="border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-colors flex items-center gap-2 mx-auto"
          >
            <CreditCardIcon className="w-4 h-4" />
            Manage Payment Methods
          </button>
        </div>
      </div>

      {/* Stripe Portal Modal */}
      {showPortalModal && portalUrl && (
        <Modal isOpen={showPortalModal} onClose={() => setShowPortalModal(false)} title="Billing Portal" size="lg">
          <div className="text-center py-4">
            <InformationCircleIcon className="w-12 h-12 text-white mx-auto mb-4" />
            <p className="text-[var(--color-text-muted)] mb-6">
              You'll be redirected to Stripe's secure billing portal to manage your subscription, payment methods, and billing details.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.open(portalUrl, '_blank')}
                className="border border-white px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors"
              >
                Open Billing Portal
              </button>
              <button
                onClick={() => setShowPortalModal(false)}
                className="border border-white/15 px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={() => cancelMutation.mutate()}
        title="Cancel Subscription"
        message="Your subscription will remain active until the end of the current billing period. You won't be charged again, and you'll lose access to Pro/Agency features after that."
        confirmText="Cancel at Period End"
        variant="danger"
      />
    </div>
  );
}