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
import { Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { api, adminService } from '@/services/api';
import { Withdrawal } from '@/types';
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
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Failed to approve withdrawal');
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
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Failed to reject withdrawal');
    },
  });

  const { mutate: completeWithdrawal } = useMutation({
    mutationFn: (id: number) => api.post(`/admin/withdrawals/${id}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
      toast.success('Withdrawal marked as completed!');
      setSelectedWithdrawal(null);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Failed to complete withdrawal');
    },
  });

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
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
    <div className="min-h-screen bg-[var(--color-bg)] container py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-[var(--color-text)] text-3xl">Withdrawal Management</h1>
          <p className="mt-1 text-[var(--color-text-muted)] font-[Instrument_Serif] italic">
            {data?.total || 0} withdrawal{data?.total !== 1 ? 's' : ''} found
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-colors flex items-center gap-2"
        >
          <FunnelIcon className="w-4 h-4" />
          Filters {hasActiveFilters && <span className="border border-white/15 px-2 py-0.5 font-mono text-xs uppercase tracking-[0.2em]">Active</span>}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="border border-white/15 p-6 animate-slide-down">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <button
                onClick={clearFilters}
                className="border border-white/15 px-4 py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-colors w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawals Table */}
      <div className="border border-white/15 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-4 px-6 py-4 border-b border-white/15">
                <div className="h-4 bg-white/10 rounded w-48" />
                <div className="h-4 bg-white/10 rounded w-32 ml-auto" />
              </div>
            ))}
          </div>
        ) : data?.items.length === 0 ? (
          <div className="text-center py-12">
            <BanknotesIcon className="w-16 h-16 mx-auto mb-4 text-[var(--color-text-subtle)]" />
            <h3 className="font-heading font-medium text-[var(--color-text)] text-xl mb-1">No withdrawals found</h3>
            <p className="text-[var(--color-text-muted)] mb-4">
              {hasActiveFilters ? 'Try adjusting your filters' : 'No withdrawal requests yet'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/15">
                  <tr>
                    <th className="px-6 py-4 text-left font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">User</th>
                    <th className="px-6 py-4 text-left font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Amount</th>
                    <th className="px-6 py-4 text-left font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Method</th>
                    <th className="px-6 py-4 text-left font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Net Amount</th>
                    <th className="px-6 py-4 text-left font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Fees</th>
                    <th className="px-6 py-4 text-left font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Status</th>
                    <th className="px-6 py-4 text-left font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Requested</th>
                    <th className="px-6 py-4 text-right font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/15">
                  {data?.items.map((withdrawal) => (
                    <tr key={withdrawal.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 border border-white/15 flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-[var(--color-text)]">User #{withdrawal.user_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[var(--color-text)] font-mono font-medium tabular-nums">
                        {formatCurrency(withdrawal.amount_cents)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 text-sm font-mono text-[var(--color-text)] border border-white/15">
                          {withdrawal.method.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white font-mono font-medium tabular-nums">
                        {formatCurrency(withdrawal.net_amount_cents)}
                      </td>
                      <td className="px-6 py-4 text-[var(--color-text-muted)] font-mono">
                        {formatCurrency(withdrawal.platform_fee_cents + withdrawal.processing_fee_cents)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 text-sm font-mono text-[var(--color-text)] border border-white/15">
                          {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--color-text-muted)] font-mono">
                        {formatDate(withdrawal.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {withdrawal.status === 'pending' && (
                            <>
                              <button
                                onClick={() => openActionModal(withdrawal)}
                                className="border border-white/15 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-colors"
                              >
                                <ClockIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => approveWithdrawal(withdrawal.id)}
                                className="border border-white px-3 py-1.5 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors"
                              >
                                <CheckCircleIcon className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {withdrawal.status === 'processing' && (
                            <button
                              onClick={() => completeWithdrawal(withdrawal.id)}
                              className="border border-white px-3 py-1.5 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors"
                            >
                              <CheckCircleIcon className="w-4 h-4" />
                            </button>
                          )}
                          {['pending', 'processing'].includes(withdrawal.status) && (
                            <button
                              onClick={() => openActionModal(withdrawal)}
                              className="border border-white/15 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-colors"
                            >
                              <XCircleIcon className="w-4 h-4" />
                            </button>
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
              <div className="border-t border-white/15 px-6 py-4">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-xs text-[var(--color-text-muted)]">
                    Showing {(filters.page - 1) * filters.page_size + 1} to {Math.min(filters.page * filters.page_size, data.total)} of {data.total} withdrawals
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                      disabled={filters.page === 1}
                      className="border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                      disabled={filters.page === data.total_pages}
                      className="border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

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
            <div className="border border-white/15 p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Amount</p>
                  <p className="font-mono text-[var(--color-text)] font-medium">{formatCurrency(selectedWithdrawal.amount_cents)}</p>
                </div>
                <div>
                  <p className="font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Net Amount</p>
                  <p className="font-mono text-white font-medium">{formatCurrency(selectedWithdrawal.net_amount_cents)}</p>
                </div>
                <div>
                  <p className="font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Fees</p>
                  <p className="font-mono text-[var(--color-text)] font-medium">{formatCurrency(selectedWithdrawal.platform_fee_cents + selectedWithdrawal.processing_fee_cents)}</p>
                </div>
                <div>
                  <p className="font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Method</p>
                  <p className="font-mono text-[var(--color-text)] font-medium">{selectedWithdrawal.method.replace('_', ' ')}</p>
                </div>
              </div>
            </div>

            {selectedWithdrawal.status === 'pending' && (
              <>
                <div className="flex gap-3">
                  <button
                    onClick={() => approveWithdrawal(selectedWithdrawal!.id)}
                    className="border border-white px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors flex-1 flex items-center justify-center gap-2"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    Approve & Process
                  </button>
                  <button
                    onClick={() => setSelectedWithdrawal(selectedWithdrawal!)}
                    className="border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-colors flex-1 flex items-center justify-center gap-2"
                  >
                    <XCircleIcon className="w-4 h-4" />
                    Reject
                  </button>
                </div>

                <div className="pt-4 border-t border-white/15">
                  <label className="block font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase mb-2">Rejection Reason (required if rejecting)</label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-transparent border border-white/15 text-white placeholder-[var(--color-text-subtle)] focus:ring-2 focus:ring-white focus:border-transparent resize-none"
                    placeholder="Enter reason for rejection..."
                  />
                </div>

                <button
                  onClick={() => {
                    if (rejectReason.trim()) {
                      rejectWithdrawal({ id: selectedWithdrawal!.id, reason: rejectReason });
                    } else {
                      toast.error('Please enter a rejection reason');
                    }
                  }}
                  className="border border-white w-full py-2 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors"
                >
                  Confirm Rejection
                </button>
              </>
            )}

            {selectedWithdrawal.status === 'processing' && (
              <div className="pt-4">
                <button
                  onClick={() => completeWithdrawal(selectedWithdrawal!.id)}
                  className="border border-white w-full py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  Mark as Completed
                </button>
              </div>
            )}

            <button
              onClick={() => setSelectedWithdrawal(null)}
              className="border border-white/15 w-full py-2 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-colors mt-4"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}