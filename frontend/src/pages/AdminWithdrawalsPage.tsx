import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  BanknotesIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { api, adminService } from '@/services/api';
import { Withdrawal, WithdrawalStatus } from '@/types';
import { formatDate, formatCurrency } from '@/utils/format';
import toast from 'react-hot-toast';

interface PaginatedWithdrawals {
  items: Withdrawal[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const sortOptions = [
  { value: 'created_at:desc', label: 'Newest First' },
  { value: 'created_at:asc', label: 'Oldest First' },
  { value: 'amount_cents:desc', label: 'Amount High-Low' },
  { value: 'amount_cents:asc', label: 'Amount Low-High' },
];

const statusBadgeVariants: Record<WithdrawalStatus, 'primary' | 'secondary' | 'outline' | 'danger'> = {
  pending: 'secondary',
  processing: 'primary',
  completed: 'primary',
  failed: 'danger',
  cancelled: 'secondary',
};

export function AdminWithdrawalsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    page: 1,
    page_size: 20,
    status: '',
    sort: 'created_at:desc',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-withdrawals', filters],
    queryFn: () => adminService.getWithdrawals(filters) as Promise<PaginatedWithdrawals>,
  });

  const { mutate: approveWithdrawal } = useMutation({
    mutationFn: (id: number) => api.post(`/admin/withdrawals/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
      toast.success('Withdrawal approved!');
      setSelectedWithdrawal(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to approve withdrawal');
    },
  });

  const { mutate: rejectWithdrawal } = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => api.post(`/admin/withdrawals/${id}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
      toast.success('Withdrawal rejected!');
      setSelectedWithdrawal(null);
      setRejectReason('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to reject withdrawal');
    },
  });

  const { mutate: completeWithdrawal } = useMutation({
    mutationFn: (id: number) => api.post(`/admin/withdrawals/${id}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
      toast.success('Withdrawal marked as completed!');
      setSelectedWithdrawal(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to complete withdrawal');
    },
  });

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      page_size: 20,
      status: '',
      sort: 'created_at:desc',
    });
  };

  const hasActiveFilters = (['status'] as const).some(key => filters[key]);

  const openActionModal = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setRejectReason('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[var(--color-text)]">Withdrawal Management</h1>
          <p className="mt-1 text-[var(--color-text-muted)]">
            {data?.total || 0} withdrawal{data?.total !== 1 ? 's' : ''} found
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} leftIcon={<FunnelIcon className="w-4 h-4" />}>
          Filters {hasActiveFilters && <Badge variant="primary" size="sm">Active</Badge>}
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="animate-slide-down">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
            <Select
              label="Status"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              options={statusOptions}
            />
            <Select
              label="Sort By"
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              options={sortOptions}
            />
            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} fullWidth>
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Withdrawals Table */}
      <Card padding="none">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-4 px-6 py-4">
                <div className="h-4 bg-[var(--color-surface-muted)] rounded w-48" />
                <div className="h-4 bg-[var(--color-surface-muted)] rounded w-32 ml-auto" />
              </div>
            ))}
          </div>
        ) : data?.items.length === 0 ? (
          <div className="text-center py-12">
            <BanknotesIcon className="w-16 h-16 mx-auto mb-4 text-[var(--color-text-subtle)]" />
            <h3 className="text-lg font-medium text-[var(--color-text)] mb-1">No withdrawals found</h3>
            <p className="text-[var(--color-text-muted)] mb-4">
              {hasActiveFilters ? 'Try adjusting your filters' : 'No withdrawal requests yet'}
            </p>
            {hasActiveFilters && <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--color-surface-muted)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Net Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Fees</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Requested</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {data?.items.map((withdrawal) => (
                    <tr key={withdrawal.id} className="hover:bg-[var(--color-surface-muted)]">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[var(--color-accent-muted)] flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-[var(--color-accent)]" />
                          </div>
                          <div>
                            <p className="font-medium text-[var(--color-text)]">User #{withdrawal.user_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[var(--color-text)] font-medium">
                        {formatCurrency(withdrawal.amount_cents)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" size="sm">
                          {withdrawal.method.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-[var(--color-accent)] font-medium">
                        {formatCurrency(withdrawal.net_amount_cents)}
                      </td>
                      <td className="px-6 py-4 text-[var(--color-text-muted)]">
                        {formatCurrency(withdrawal.platform_fee_cents + withdrawal.processing_fee_cents)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={statusBadgeVariants[withdrawal.status]} size="sm">
                          {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--color-text-muted)]">
                        {formatDate(withdrawal.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {withdrawal.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openActionModal(withdrawal)}
                                className="text-[var(--color-accent)] hover:bg-[var(--color-accent-muted)] border-[var(--color-accent)]/20"
                              >
                                <ClockIcon className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => approveWithdrawal(withdrawal.id)}
                              >
                                <CheckCircleIcon className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {withdrawal.status === 'processing' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => completeWithdrawal(withdrawal.id)}
                            >
                              <CheckCircleIcon className="w-4 h-4" />
                            </Button>
                          )}
                          {['pending', 'processing'].includes(withdrawal.status) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openActionModal(withdrawal)}
                              className="text-[var(--color-accent)] hover:bg-[var(--color-accent-muted)] border-[var(--color-accent)]/20"
                            >
                              <XCircleIcon className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data && data.total_pages > 1 && (
              <div className="border-t border-[var(--color-border)] px-6 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Showing {(filters.page - 1) * filters.page_size + 1} to {Math.min(filters.page * filters.page_size, data.total)} of {data.total} withdrawals
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={filters.page === 1}
                      onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={filters.page === data.total_pages}
                      onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Action Modal */}
      {selectedWithdrawal && (
        <Modal
          isOpen={!!selectedWithdrawal}
          onClose={() => setSelectedWithdrawal(null)}
          title={selectedWithdrawal.status === 'pending' ? 'Process Withdrawal' : 'Complete Withdrawal'}
          description={`Processing withdrawal for User #${selectedWithdrawal.user_id}`}
          size="md"
        >
          <div className="space-y-4">
            <div className="bg-[var(--color-surface-muted)] p-4 rounded-xl">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[var(--color-text-muted)]">Amount</p>
                  <p className="font-semibold text-[var(--color-text)]">{formatCurrency(selectedWithdrawal.amount_cents)}</p>
                </div>
                <div>
                  <p className="text-[var(--color-text-muted)]">Net Amount</p>
                  <p className="font-semibold text-[var(--color-accent)]">{formatCurrency(selectedWithdrawal.net_amount_cents)}</p>
                </div>
                <div>
                  <p className="text-[var(--color-text-muted)]">Fees</p>
                  <p className="font-medium text-[var(--color-text)]">{formatCurrency(selectedWithdrawal.platform_fee_cents + selectedWithdrawal.processing_fee_cents)}</p>
                </div>
                <div>
                  <p className="text-[var(--color-text-muted)]">Method</p>
                  <p className="font-medium text-[var(--color-text)]">{selectedWithdrawal.method.replace('_', ' ')}</p>
                </div>
              </div>
            </div>

            {selectedWithdrawal.status === 'pending' && (
              <>
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => approveWithdrawal(selectedWithdrawal!.id)}
                    leftIcon={<CheckCircleIcon className="w-4 h-4" />}
                  >
                    Approve & Process
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => setSelectedWithdrawal(selectedWithdrawal!)}
                    leftIcon={<XCircleIcon className="w-4 h-4" />}
                  >
                    Reject
                  </Button>
                </div>

                <div className="pt-4 border-t border-[var(--color-border)]">
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Rejection Reason (required if rejecting)</label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] bg-[var(--color-bg)] text-[var(--color-text)]"
                    placeholder="Enter reason for rejection..."
                  />
                </div>

                <Button
                  variant="danger"
                  fullWidth
                  onClick={() => {
                    if (rejectReason.trim()) {
                      rejectWithdrawal({ id: selectedWithdrawal!.id, reason: rejectReason });
                    } else {
                      toast.error('Please enter a rejection reason');
                    }
                  }}
                >
                  Confirm Rejection
                </Button>
              </>
            )}

            {selectedWithdrawal.status === 'processing' && (
              <div className="pt-4">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => completeWithdrawal(selectedWithdrawal!.id)}
                  leftIcon={<CheckCircleIcon className="w-4 h-4" />}
                >
                  Mark as Completed
                </Button>
              </div>
            )}

            <Button variant="outline" fullWidth onClick={() => setSelectedWithdrawal(null)} className="mt-4">
              Cancel
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}