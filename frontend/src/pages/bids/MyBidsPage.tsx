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
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
          <div className="flex items-center gap-4">
            <Link to="/projects" className="text-[var(--color-text-subtle)] hover:text-[var(--color-text)] transition-colors">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="font-heading font-bold text-[var(--color-text)] text-[clamp(2rem,4vw,3rem)] tracking-tight">My Bids</h1>
              <p className="mt-1 text-[var(--color-text-muted)] font-[Instrument_Serif] italic">Track and manage your project bids</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="border border-white/15 p-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-subtle)]" />
              <input
                type="search"
                placeholder="Search bids..."
                className="w-full pl-10 pr-4 py-2.5 bg-transparent border border-white/15 text-[var(--color-text)] placeholder-[var(--color-text-subtle)] focus:ring-0 focus:border-white"
                disabled
              />
            </div>
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: (e.target.value as BidStatus) || undefined, page: 1 })}
                className="border border-white/15 bg-transparent px-4 py-2.5 text-[var(--color-text)] appearance-none focus:ring-0 focus:border-white"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
                <option value="shortlisted">Shortlisted</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bids Table */}
        <div className="border border-white/15 overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-4 px-6 py-4 border-b border-white/15">
                  <div className="h-12 w-12 bg-white/10" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/10 w-1/3" />
                    <div className="h-3 bg-white/10 w-1/4" />
                  </div>
                  <div className="h-6 bg-white/10 w-24" />
                  <div className="h-6 bg-white/10 w-20" />
                  <div className="h-6 bg-white/10 w-24" />
                </div>
              ))}
            </div>
          ) : bids.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-white/10 flex items-center justify-center mx-auto mb-4">
                <DocumentTextIcon className="w-8 h-8 text-[var(--color-text-subtle)]" />
              </div>
              <h3 className="font-heading font-medium text-[var(--color-text)] text-xl">No bids yet</h3>
              <p className="mt-1 text-[var(--color-text-muted)]">Start bidding on projects to see them here</p>
              <Link to="/projects" className="inline-flex items-center gap-2 mt-4 border border-white px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors">
                <MagnifyingGlassIcon className="w-5 h-5" />
                Browse Projects
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-white/15">
                    <tr>
                      <th className="px-6 py-4 text-left font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Project</th>
                      <th className="px-6 py-4 text-left font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Your Bid</th>
                      <th className="px-6 py-4 text-left font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Delivery</th>
                      <th className="px-6 py-4 text-left font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Status</th>
                      <th className="px-6 py-4 text-left font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Submitted</th>
                      <th className="px-6 py-4 text-right font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/15">
                    {bids.map((bid) => (
                      <tr key={bid.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <Link
                            to="/projects/$projectId"
                            params={{ projectId: String(bid.project_id) }}
                            search={{ tab: 'details' }}
                            className="font-medium text-[var(--color-text)] hover:text-white transition-colors"
                          >
                            {bid.project?.title || 'Project'}
                          </Link>
                          <p className="text-sm text-[var(--color-text-muted)] truncate max-w-xs mt-1">{bid.project?.description || ''}</p>
                        </td>
                        <td className="px-6 py-4 text-[var(--color-text)] font-mono font-medium tabular-nums">{formatCurrency(bid.amount_cents)}</td>
                        <td className="px-6 py-4 text-[var(--color-text-muted)] font-mono">{bid.proposed_timeline_days} days</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 text-sm font-mono text-[var(--color-text)] border border-white/15">
                            {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[var(--color-text-muted)] font-mono">{formatDate(bid.created_at)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to="/projects/$projectId"
                              params={{ projectId: String(bid.project_id) }}
                              search={{ tab: 'details' }}
                              className="p-2 text-[var(--color-text-muted)] hover:text-white hover:bg-white/5 transition-colors"
                              title="View Project"
                            >
                              <EyeIcon className="w-5 h-5" />
                            </Link>
                            {bid.status === 'pending' && (
                              <button
                                onClick={() => handleWithdraw(bid.id)}
                                disabled={withdrawingId === bid.id}
                                className="p-2 text-[var(--color-gray-500)] hover:text-white hover:bg-white/5 transition-colors"
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
                                className="p-2 text-white hover:bg-white/5 transition-colors"
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
                <nav className="px-6 py-4 border-t border-white/15 flex items-center justify-between">
                  <p className="font-mono text-xs text-[var(--color-text-muted)]">
                    Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} bids
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}