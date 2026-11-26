import { useState, useEffect, useCallback } from 'react';
import { Link, useSearch } from '@tanstack/react-router';
import { bidService } from '@/services/api';
import { Bid, BidStatus, formatCurrency, formatDate } from '@/types';
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  DocumentTextIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';

interface PaginatedBids {
  items: Bid[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

interface BidFilters {
  status?: BidStatus;
  page?: number;
  page_size?: number;
}

const getStatusBadgeVariant = (status: BidStatus): 'primary' | 'secondary' | 'outline' | 'danger' => {
  switch (status) {
    case 'pending':
      return 'secondary';
    case 'accepted':
      return 'primary';
    case 'rejected':
      return 'danger';
    case 'withdrawn':
      return 'outline';
    case 'shortlisted':
      return 'secondary';
    default:
      return 'secondary';
  }
};

export function MyBidsPage() {
  const search = useSearch({ strict: false }) as { status?: string };
  const [bids, setBids] = useState<Bid[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<BidFilters>({
    status: search.status as BidStatus | undefined,
  });
  const [withdrawingId, setWithdrawingId] = useState<number | null>(null);

  const fetchBids = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = { ...filters, page, page_size: pageSize };
      const data = await bidService.list('', params) as PaginatedBids;
      setBids(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.total_pages || 0);
    } catch {
      toast.error('Failed to load bids');
    } finally {
      setIsLoading(false);
    }
  }, [filters, page, pageSize]);

  useEffect(() => {
    fetchBids();
  }, [fetchBids]);

  const handleWithdraw = async (id: number) => {
    if (!confirm('Are you sure you want to withdraw this bid?')) {
      return;
    }
    setWithdrawingId(id);
    try {
      await bidService.withdraw(String(id));
      toast.success('Bid withdrawn');
      fetchBids();
    } catch {
      toast.error('Failed to withdraw bid');
    } finally {
      setWithdrawingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link to="/projects" className="text-[var(--color-text-subtle)] hover:text-[var(--color-text)]">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-[var(--color-text)]">My Bids</h1>
              <p className="mt-1 text-[var(--color-text-muted)]">Track and manage your project bids</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card padding="md" className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-subtle)]" />
              <Input
                type="search"
                placeholder="Search bids..."
                className="pl-10"
                disabled
              />
            </div>
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <Select
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: (e.target.value as BidStatus) || undefined, page: 1 })}
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'accepted', label: 'Accepted' },
                  { value: 'rejected', label: 'Rejected' },
                  { value: 'withdrawn', label: 'Withdrawn' },
                  { value: 'shortlisted', label: 'Shortlisted' },
                ]}
              />
            </div>
          </div>
        </Card>

        {/* Bids Table */}
        <Card padding="none">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-4 px-6 py-4">
                  <div className="h-12 w-12 bg-[var(--color-border)] rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[var(--color-border)] rounded w-1/3" />
                    <div className="h-3 bg-[var(--color-border)] rounded w-1/4" />
                  </div>
                  <div className="h-6 bg-[var(--color-border)] rounded w-24" />
                  <div className="h-6 bg-[var(--color-border)] rounded w-20" />
                  <div className="h-6 bg-[var(--color-border)] rounded w-24" />
                </div>
              ))}
            </div>
          ) : bids.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-[var(--color-surface-muted)] rounded-full flex items-center justify-center mx-auto mb-4">
                <DocumentTextIcon className="w-8 h-8 text-[var(--color-text-subtle)]" />
              </div>
              <h3 className="text-lg font-medium text-[var(--color-text)]">No bids yet</h3>
              <p className="mt-1 text-[var(--color-text-muted)]">Start bidding on projects to see them here</p>
              <Link to="/projects" className="inline-flex items-center gap-2 mt-4">
                <Button variant="primary" asChild>
                  <MagnifyingGlassIcon className="w-5 h-5" />
                  Browse Projects
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[var(--color-surface-muted)] border-b border-[var(--color-border)]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider">Project</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider">Your Bid</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider">Delivery</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider">Submitted</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {bids.map((bid) => (
                      <tr key={bid.id} className="hover:bg-[var(--color-surface-muted)]">
                        <td className="px-6 py-4">
                          <Link to="/projects/$projectId" params={{ projectId: String(bid.project_id) }} search={{ tab: 'details' }} className="font-medium text-[var(--color-text)] hover:text-[var(--color-accent)]">
                            {bid.project?.title || 'Project'}
                          </Link>
                          <p className="text-sm text-[var(--color-text-muted)] truncate max-w-xs mt-1">{bid.project?.description || ''}</p>
                        </td>
                        <td className="px-6 py-4 text-[var(--color-text)] font-medium">{formatCurrency(bid.amount_cents)}</td>
                        <td className="px-6 py-4 text-[var(--color-text-muted)]">{bid.proposed_timeline_days} days</td>
                        <td className="px-6 py-4">
                          <Badge variant={getStatusBadgeVariant(bid.status)} size="sm">
                            {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-[var(--color-text-muted)]">{formatDate(bid.created_at)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to="/projects/$projectId"
                              params={{ projectId: String(bid.project_id) }}
                              search={{ tab: 'details' }}
                              className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-muted)] rounded-lg"
                              title="View Project"
                            >
                              <EyeIcon className="w-5 h-5" />
                            </Link>
                            {bid.status === 'pending' && (
                              <button
                                onClick={() => handleWithdraw(bid.id)}
                                disabled={withdrawingId === bid.id}
                                className="p-2 text-[var(--color-error)] hover:bg-[var(--color-error-muted)] rounded-lg"
                                title="Withdraw Bid"
                              >
                                {withdrawingId === bid.id ? (
                                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                  </svg>
                                ) : (
                                  <XMarkIcon className="w-5 h-5" />
                                )}
                              </button>
                            )}
                            {bid.status === 'accepted' && bid.project?.id && (
                              <Link
                                to="/chat/$projectId"
                                params={{ projectId: String(bid.project.id) }}
                                className="p-2 text-[var(--color-accent)] hover:bg-[var(--color-accent-muted)] rounded-lg"
                                title="Chat with Client"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="px-6 py-4 border-t border-[var(--color-border)] flex items-center justify-between">
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} bids
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </nav>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}