import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { api } from '../../services/api';
import { Bid, BidStatus, formatCurrency, formatDate, getStatusColor } from '../../types';
import {
  ArrowLeftIcon,
  FilterIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  DocumentTextIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface BidFilters {
  status?: BidStatus;
  page?: number;
  page_size?: number;
}

export function MyBidsPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/my/bids' });
  const [bids, setBids] = useState<Bid[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<BidFilters>({
    status: search.status || undefined,
  });
  const [withdrawingId, setWithdrawingId] = useState<number | null>(null);

  useEffect(() => {
    fetchBids();
  }, [filters, page, pageSize]);

  const fetchBids = async () => {
    setIsLoading(true);
    try {
      const params = { ...filters, page, page_size: pageSize };
      const data = await api.getMyBids(params);
      setBids(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.total_pages || 0);
    } catch (error) {
      toast.error('Failed to load bids');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async (id: number) => {
    if (!confirm('Are you sure you want to withdraw this bid?')) {
      return;
    }
    setWithdrawingId(id);
    try {
      await api.withdrawBid(id);
      toast.success('Bid withdrawn');
      fetchBids();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to withdraw bid');
    } finally {
      setWithdrawingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link to="/projects" className="text-gray-500 hover:text-gray-700">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Bids</h1>
              <p className="mt-1 text-gray-600">Track and manage your project bids</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="search"
                placeholder="Search bids..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg"
                disabled
              />
            </div>
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined, page: 1 })}
                className="input w-auto py-2"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bids Table */}
        <div className="card overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-4 px-6 py-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-24" />
                  <div className="h-6 bg-gray-200 rounded w-20" />
                  <div className="h-6 bg-gray-200 rounded w-24" />
                </div>
              ))}
            </div>
          ) : bids.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DocumentTextIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No bids yet</h3>
              <p className="mt-1 text-gray-500">Start bidding on projects to see them here</p>
              <Link to="/projects" className="btn-primary mt-4 inline-flex items-center gap-2">
                <MagnifyingGlassIcon className="w-5 h-5" />
                Browse Projects
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Your Bid</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {bids.map((bid) => (
                      <tr key={bid.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <Link to={`/projects/${bid.project_id}`} className="font-medium text-gray-900 hover:text-primary-600">
                            {bid.project?.title || 'Project'}
                          </Link>
                          <p className="text-sm text-gray-500 truncate max-w-xs mt-1">{bid.project?.description || ''}</p>
                        </td>
                        <td className="px-6 py-4 text-gray-900 font-medium">{formatCurrency(bid.price_cents)}</td>
                        <td className="px-6 py-4 text-gray-500">{bid.delivery_days} days</td>
                        <td className="px-6 py-4">
                          <span className={`badge ${getStatusColor(bid.status)}`}>
                            {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{formatDate(bid.created_at)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/projects/${bid.project_id}`}
                              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                              title="View Project"
                            >
                              <EyeIcon className="w-5 h-5" />
                            </Link>
                            {bid.status === 'pending' && (
                              <button
                                onClick={() => handleWithdraw(bid.id)}
                                disabled={withdrawingId === bid.id}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
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
                            {bid.status === 'accepted' && (
                              <Link
                                to={`/chat/${bid.project_id}`}
                                className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
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
                <nav className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} bids
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="btn-secondary px-3 py-2 text-sm"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="btn-secondary px-3 py-2 text-sm"
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