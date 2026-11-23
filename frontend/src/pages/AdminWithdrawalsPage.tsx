import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  UserIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner, ListLoader } from '@/components/ui/LoadingSpinner';
import { adminService } from '@/services/api';
import { Withdrawal, WithdrawalStatus } from '@/types';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'failed', label: 'Failed' },
];

const sortOptions = [
  { value: 'created_at:desc', label: 'Newest First' },
  { value: 'created_at:asc', label: 'Oldest First' },
  { value: 'amount_cents:desc', label: 'Amount High-Low' },
  { value: 'amount_cents:asc', label: 'Amount Low-High' },
];

export function AdminWithdrawalsPage() {
  const { user } = useAuth();
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
    queryFn: () => adminService.listWithdrawals(filters),
    enabled: !!user && user.role === 'admin',
  });

  const { mutate: approveWithdrawal } = useMutation({
    mutationFn: (id: number) => adminService.approveWithdrawal(id),
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
    mutationFn: ({ id, reason }: { id: number; reason: string }) => adminService.rejectWithdrawal(id, reason),
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
    mutationFn: (id: number) => adminService.completeWithdrawal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
      toast.success('Withdrawal marked as completed!');
      setSelectedWithdrawal(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to complete withdrawal');
    },
  });

  const handleFilterChange = (key: string, value: any) => {
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

  const hasActiveFilters = ['status'].some(key => filters[key]);

  const openActionModal = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setRejectReason('');
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-secondary-900">Access Denied</h1>
        <p className="mt-2 text-secondary-600">Admin access required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-secondary-900">Withdrawal Management</h1>
          <p className="mt-1 text-secondary-600">
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
          <ListLoader count={10} />
        ) : data?.items.length === 0 ? (
          <div className="text-center py-12">
            <BanknotesIcon className="w-16 h-16 mx-auto mb-4 text-secondary-300" />
            <h3 className="text-lg font-medium text-secondary-900 mb-1">No withdrawals found</h3>
            <p className="text-secondary-600 mb-4">
              {hasActiveFilters ? 'Try adjusting your filters' : 'No withdrawal requests yet'}
            </p>
            {hasActiveFilters && <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Net Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Fees</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Requested</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-200">
                  {data.items.map((withdrawal) => (
                    <tr key={withdrawal.id} className="hover:bg-secondary-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-medium text-secondary-900">{withdrawal.user?.full_name || 'Unknown'}</p>
                            <p className="text-sm text-secondary-500">@{withdrawal.user?.username || ''}</p>
                            <p className="text-xs text-secondary-400">{withdrawal.user?.email || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-secondary-900 font-medium">
                        ${(withdrawal.amount_cents / 100).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" size="sm">
                          {withdrawal.method.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-success-600 font-medium">
                        ${(withdrawal.net_amount_cents / 100).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-secondary-500">
                        ${((withdrawal.platform_fee_cents + withdrawal.processing_fee_cents) / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={withdrawal.status} size="sm" />
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-500">
                        {format(new Date(withdrawal.created_at), 'MMM d, yyyy h:mm a')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {withdrawal.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openActionModal(withdrawal)}
                                className="text-warning-600 hover:bg-warning-50 border-warning-200"
                              >
                                <ClockIcon className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => approveWithdrawal(withdrawal.id)}
                                className="text-success-600 hover:bg-success-50 border-success-200"
                              >
                                <CheckCircleIcon className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {withdrawal.status === 'processing' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => completeWithdrawal(withdrawal.id)}
                              className="text-primary-600 hover:bg-primary-50 border-primary-200"
                            >
                              <CheckCircleIcon className="w-4 h-4" />
                            </Button>
                          )}
                          {['pending', 'processing'].includes(withdrawal.status) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openActionModal(withdrawal)}
                              className="text-danger-600 hover:bg-danger-50 border-danger-200"
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
              <div className="border-t border-secondary-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-secondary-600">
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
          description={`Processing withdrawal for ${selectedWithdrawal.user?.full_name}`}
          size="md"
        >
          <div className="space-y-4">
            <div className="bg-secondary-50 p-4 rounded-xl">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-secondary-500">Amount</p>
                  <p className="font-semibold text-secondary-900">${(selectedWithdrawal.amount_cents / 100).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-secondary-500">Net Amount</p>
                  <p className="font-semibold text-success-600">${(selectedWithdrawal.net_amount_cents / 100).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-secondary-500">Fees</p>
                  <p className="font-medium text-secondary-900">${((selectedWithdrawal.platform_fee_cents + selectedWithdrawal.processing_fee_cents) / 100).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-secondary-500">Method</p>
                  <p className="font-medium text-secondary-900">{selectedWithdrawal.method.replace('_', ' ')}</p>
                </div>
              </div>
            </div>

            {selectedWithdrawal.status === 'pending' && (
              <>
                <div className="flex gap-3">
                  <Button
                    variant="success"
                    fullWidth
                    onClick={() => approveWithdrawal(selectedWithdrawal!.id)}
                    leftIcon={<CheckCircleIcon className="w-4 h-4" />}
                  >
                    Approve & Process
                  </Button>
                  <Button
                    variant="danger"
                    fullWidth
                    onClick={() => setSelectedWithdrawal(selectedWithdrawal!)}
                    leftIcon={<XCircleIcon className="w-4 h-4" />}
                  >
                    Reject
                  </Button>
                </div>

                <div className="pt-4 border-t border-secondary-200">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Rejection Reason (required if rejecting)</label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                  variant="success"
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