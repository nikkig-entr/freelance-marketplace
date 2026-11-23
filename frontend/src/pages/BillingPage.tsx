import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCardIcon, ArrowPathIcon, CheckCircleIcon, XCircleIcon, InformationCircleIcon, CalendarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { billingService } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

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
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'agency'>('pro');
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [showPortalModal, setShowPortalModal] = useState(false);
  const [portalUrl, setPortalUrl] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['billing-plans'],
    queryFn: billingService.getPlans,
  });

  const { data: subscription, isLoading: subLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => billingService.getInvoices(), // Using invoices endpoint as fallback
    enabled: !!user,
  });

  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: billingService.getInvoices,
    enabled: !!user,
  });

  const subscribeMutation = useMutation({
    mutationFn: ({ plan, interval }: { plan: string; interval: string }) => billingService.subscribe(plan, interval),
    onSuccess: (data) => {
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        toast.success('Subscription created successfully!');
        queryClient.invalidateQueries({ queryKey: ['subscription'] });
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create subscription');
    },
  });

  const portalMutation = useMutation({
    mutationFn: billingService.getPortalUrl,
    onSuccess: (data) => {
      if (data.portal_url) {
        setPortalUrl(data.portal_url);
        setShowPortalModal(true);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to open billing portal');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: billingService.cancelSubscription,
    onSuccess: () => {
      toast.success('Subscription cancelled at period end');
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      setShowCancelModal(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to cancel subscription');
    },
  });

  if (!user) return null;

  const currentPlan = user.plan;
  const isProOrAgency = currentPlan === 'pro' || currentPlan === 'agency';

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-secondary-900">Billing & Subscription</h1>
        <p className="mt-1 text-secondary-600">Manage your plan, payment methods, and billing history</p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardTitle title="Current Plan" subtitle={`You're on the ${currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} plan`} />
        <div className="flex items-center justify-between p-6 rounded-xl bg-secondary-50">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
              currentPlan === 'starter' ? 'bg-gray-100' : currentPlan === 'pro' ? 'bg-primary-100' : 'bg-purple-100'
            }`}>
              <CurrencyDollarIcon className={`w-8 h-8 ${currentPlan === 'starter' ? 'text-gray-500' : currentPlan === 'pro' ? 'text-primary-600' : 'text-purple-600'}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900 capitalize">{currentPlan}</p>
              <p className="text-secondary-500">
                {currentPlan === 'starter' ? 'Free forever' : billingInterval === 'year' ? 'Billed yearly' : 'Billed monthly'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isProOrAgency && (
              <Button variant="outline" onClick={() => portalMutation.mutate()}>
                Manage in Portal
              </Button>
            )}
            {currentPlan === 'starter' && (
              <Button variant="primary" onClick={() => setSelectedPlan('pro')}>
                Upgrade to Pro
              </Button>
            )}
            {currentPlan === 'pro' && (
              <Button variant="outline" onClick={() => setSelectedPlan('agency')}>
                Upgrade to Agency
              </Button>
            )}
          </div>
        </div>

        {/* Subscription Status */}
        {isProOrAgency && !subLoading && (
          <div className="mt-4 p-4 rounded-xl bg-secondary-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-success-100 flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5 text-success-600" />
                </div>
                <div>
                  <p className="font-medium text-secondary-900">Active Subscription</p>
                  <p className="text-sm text-secondary-500">Renews on {new Date().toLocaleDateString()}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowCancelModal(true)}>
                Cancel Plan
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Plans Comparison */}
      <Card>
        <CardTitle title="Available Plans" subtitle="Choose the plan that fits your needs" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(['starter', 'pro', 'agency'] as const).map((plan) => {
            const price = PLAN_PRICES[plan];
            const features = PLAN_FEATURES[plan];
            const isCurrent = plan === currentPlan;
            const isUpgrade = (plan === 'pro' && currentPlan === 'starter') || (plan === 'agency' && currentPlan === 'pro');

            return (
              <div
                key={plan}
                className={`relative rounded-2xl p-6 border-2 transition-all ${
                  isCurrent
                    ? 'border-primary-500 bg-primary-50 shadow-lg'
                    : 'border-secondary-200 bg-white hover:border-primary-300 hover:shadow-md'
                }`}
              >
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="primary" size="sm">Current Plan</Badge>
                  </div>
                )}
                <div className="text-center mb-6">
                  <p className="text-lg font-medium text-secondary-600 capitalize">{plan}</p>
                  <div className="mt-2 flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-secondary-900">
                      {price.monthly === 0 ? 'Free' : `$${(billingInterval === 'year' ? price.yearly : price.monthly) / 100}`}
                    </span>
                    <span className="text-secondary-500">/{billingInterval === 'year' ? 'year' : 'month'}</span>
                  </div>
                  {price.yearly > 0 && (
                    <p className="text-sm text-success-600 mt-1">
                      {billingInterval === 'month' ? `Save ${Math.round((1 - price.yearly / (price.monthly * 12)) * 100)}% yearly` : 'Best value'}
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircleIcon className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                      <span className="text-secondary-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={isCurrent ? 'outline' : isUpgrade ? 'primary' : 'outline'}
                  fullWidth
                  loading={subscribeMutation.isPending}
                  onClick={() => isCurrent ? null : subscribeMutation.mutate({ plan, interval: billingInterval })}
                  disabled={isCurrent}
                >
                  {isCurrent ? 'Current Plan' : isUpgrade ? 'Upgrade' : 'Downgrade'}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Billing Interval Toggle */}
        <div className="mt-8 pt-6 border-t border-secondary-200">
          <div className="flex items-center justify-center gap-4">
            <span className={`font-medium ${billingInterval === 'month' ? 'text-secondary-900' : 'text-secondary-500'}`}>
              Monthly
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={billingInterval === 'year'}
                onChange={(e) => setBillingInterval(e.target.checked ? 'year' : 'month')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
            <span className={`font-medium ${billingInterval === 'year' ? 'text-secondary-900' : 'text-secondary-500'}`}>
              Yearly
              {PLAN_PRICES.pro.yearly > 0 && <Badge variant="success" size="xs" className="ml-1">Save 20%</Badge>}
            </span>
          </div>
        </div>
      </Card>

      {/* Billing History */}
      <Card>
        <CardTitle title="Billing History" subtitle="Your invoices and receipts" />
        {invoicesLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-secondary-500">Loading invoices...</p>
          </div>
        ) : invoices && invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-secondary-500 border-b border-secondary-200">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Description</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                  <th className="pb-3 font-medium text-right">Status</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice: any) => (
                  <tr key={invoice.id} className="border-b border-secondary-100 hover:bg-secondary-50">
                    <td className="py-4 text-secondary-900">{new Date(invoice.created_at).toLocaleDateString()}</td>
                    <td className="py-4 text-secondary-700">{invoice.description || `Invoice #${invoice.id}`}</td>
                    <td className="py-4 text-right font-medium text-secondary-900">${(invoice.amount_cents / 100).toFixed(2)}</td>
                    <td className="py-4 text-right">
                      <Badge variant={
                        invoice.status === 'paid' ? 'success' :
                        invoice.status === 'pending' ? 'warning' :
                        invoice.status === 'failed' ? 'danger' : 'default'
                      }>
                        {invoice.status}
                      </Badge>
                    </td>
                    <td className="py-4 text-right">
                      <Button variant="ghost" size="sm">Download</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-secondary-100 flex items-center justify-center mx-auto mb-4">
              <CurrencyDollarIcon className="w-8 h-8 text-secondary-400" />
            </div>
            <p className="text-secondary-600 mb-4">No billing history yet</p>
            <p className="text-sm text-secondary-500">Your invoices will appear here after your first payment</p>
          </div>
        )}
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardTitle title="Payment Methods" subtitle="Manage your saved payment methods" />
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-secondary-100 flex items-center justify-center mx-auto mb-4">
            <CreditCardIcon className="w-8 h-8 text-secondary-400" />
          </div>
          <p className="text-secondary-600 mb-4">Payment methods are managed through Stripe</p>
          <Button variant="outline" leftIcon={<CreditCardIcon className="w-4 h-4" />} onClick={() => portalMutation.mutate()}>
            Manage Payment Methods
          </Button>
        </div>
      </Card>

      {/* Stripe Portal Modal */}
      {showPortalModal && portalUrl && (
        <Modal isOpen={showPortalModal} onClose={() => setShowPortalModal(false)} title="Billing Portal" size="lg">
          <div className="text-center py-4">
            <InformationCircleIcon className="w-12 h-12 text-primary-500 mx-auto mb-4" />
            <p className="text-secondary-700 mb-6">
              You'll be redirected to Stripe's secure billing portal to manage your subscription, payment methods, and billing details.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="primary" onClick={() => window.open(portalUrl, '_blank')}>
                Open Billing Portal
              </Button>
              <Button variant="outline" onClick={() => setShowPortalModal(false)}>
                Close
              </Button>
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