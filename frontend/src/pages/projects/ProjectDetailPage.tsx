import { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate, useSearch } from '@tanstack/react-router';
import { useAuth } from '../../contexts/AuthContext';
import { projectService, bidService } from '../../services/api';
import { Project, Bid, ProjectStatus, formatCurrency, formatDate } from '../../types';
import {
  ArrowLeftIcon,
  UserCircleIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  ShareIcon,
  FlagIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface ProjectDetailSearch {
  tab?: string;
}

export function ProjectDetailPage() {
  const params = useParams({ from: '/projects/$projectId' });
  const search = useSearch({ strict: false }) as ProjectDetailSearch;
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(search.tab || 'details');
  const [showBidModal, setShowBidModal] = useState(false);
  const [bidForm, setBidForm] = useState({ price_cents: '', delivery_days: '', cover_letter: '', portfolio_urls: '' });
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);

  const projectId = parseInt(params.projectId);

  const fetchProject = useCallback(async () => {
    try {
      const data = await projectService.get(String(projectId));
      setProject(data as Project);
    } catch {
      toast.error('Failed to load project');
      navigate({ to: '/projects' });
    } finally {
      setIsLoading(false);
    }
  }, [projectId, navigate]);

  const fetchBids = useCallback(async () => {
    try {
      const data = await bidService.list(String(projectId));
      setBids((data as { items: Bid[] }).items || []);
    } catch {
      console.error('Failed to fetch bids:');
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
    fetchBids();
  }, [fetchProject, fetchBids]);

  useEffect(() => {
    setActiveTab(search.tab || 'details');
  }, [search.tab]);

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate({ to: '/login', search: { redirect: `/projects/${projectId}` } });
      return;
    }
    if (user.role !== 'freelancer' && user.role !== 'admin') {
      toast.error('Only freelancers can bid on projects');
      return;
    }
    setIsSubmittingBid(true);
    try {
      await bidService.create(String(projectId), {
        price_cents: parseInt(bidForm.price_cents) * 100,
        delivery_days: parseInt(bidForm.delivery_days),
        cover_letter: bidForm.cover_letter,
        portfolio_urls: bidForm.portfolio_urls.split(',').map((u) => u.trim()).filter(Boolean),
      });
      toast.success('Bid submitted successfully!');
      setShowBidModal(false);
      setBidForm({ price_cents: '', delivery_days: '', cover_letter: '', portfolio_urls: '' });
      fetchBids();
      fetchProject();
    } catch {
      toast.error('Failed to submit bid');
    } finally {
      setIsSubmittingBid(false);
    }
  };

  const handleAcceptBid = async (bidId: number) => {
    try {
      await bidService.accept(String(bidId));
      toast.success('Bid accepted!');
      fetchProject();
      fetchBids();
    } catch {
      toast.error('Failed to accept bid');
    }
  };

  const handleRejectBid = async (bidId: number) => {
    try {
      await bidService.reject(String(bidId));
      toast.success('Bid rejected');
      fetchBids();
    } catch {
      toast.error('Failed to reject bid');
    }
  };

  const handleWithdrawBid = async (bidId: number) => {
    try {
      await bidService.withdraw(String(bidId));
      toast.success('Bid withdrawn');
      fetchBids();
    } catch {
      toast.error('Failed to withdraw bid');
    }
  };

  const userBid = bids.find((b) => b.freelancer_id === user?.id);
  const canBid = user && (user.role === 'freelancer' || user.role === 'admin') && project?.status === 'open' && !userBid;
  const isOwner = user && project?.client_id === user.id;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-8">
          <div className="h-8 bg-[var(--color-border)] rounded w-1/4" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-[var(--color-border)] rounded-xl" />
              <div className="h-32 bg-[var(--color-border)] rounded-xl" />
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-[var(--color-border)] rounded-xl" />
              <div className="h-48 bg-[var(--color-border)] rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[var(--color-text)]">Project not found</h2>
          <Link to="/projects" className="btn-primary mt-4 inline-block">Back to Projects</Link>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'open':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">Open</span>;
      case 'in_progress':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">In Progress</span>;
      case 'completed':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">Completed</span>;
      case 'cancelled':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">Cancelled</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">Draft</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/projects" className="text-[var(--color-text-subtle)] hover:text-[var(--color-text)]">
            <ArrowLeftIcon className="w-6 h-6" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-[var(--color-text)]">{project.title}</h1>
              {getStatusBadge(project.status)}
            </div>
            <p className="mt-2 text-[var(--color-text-muted)]">
              Posted by {project.client?.full_name || 'Unknown'} &middot; {formatDate(project.created_at)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6">
              <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">Description</h2>
              <div className="prose prose-invert max-w-none text-[var(--color-text)]">
                {project.description}
              </div>
              {project.requirements && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-[var(--color-text)] mb-3">Requirements</h3>
                  <div className="prose prose-invert max-w-none text-[var(--color-text-muted)]">
                    {project.requirements}
                  </div>
                </div>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6">
                <h3 className="text-lg font-medium text-[var(--color-text)] mb-4">Budget</h3>
                <div className="space-y-3">
                  {project.is_fixed_price ? (
                    <div>
                      <p className="text-sm text-[var(--color-text-muted)]">Fixed Price</p>
                      <p className="text-2xl font-bold text-[var(--color-text)]">{formatCurrency(project.budget_min ?? 0)}</p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <p className="text-sm text-[var(--color-text-muted)]">Min Budget</p>
                        <p className="text-2xl font-bold text-[var(--color-text)]">{formatCurrency(project.budget_min ?? 0)}</p>
                      </div>
                      {project.budget_max && (
                        <div>
                          <p className="text-sm text-[var(--color-text-muted)]">Max Budget</p>
                          <p className="text-2xl font-bold text-[var(--color-text)]">{formatCurrency(project.budget_max)}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6">
                <h3 className="text-lg font-medium text-[var(--color-text)] mb-4">Timeline</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-[var(--color-text-muted)]">Delivery Time</p>
                    <p className="text-2xl font-bold text-[var(--color-text)]">
                      {project.deadline_days ? `${project.deadline_days} days` : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--color-text-muted)]">Posted</p>
                    <p className="text-2xl font-bold text-[var(--color-text)]">{formatDate(project.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills */}
            {(project.required_skills?.length || 0) > 0 && (
              <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6">
                <h3 className="text-lg font-medium text-[var(--color-text)] mb-4">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {project.required_skills.map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-[var(--color-accent-muted)] text-[var(--color-accent)] rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bids Tab Content */}
            {activeTab === 'bids' && (
              <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-[var(--color-text)]">Bids ({bids.length})</h2>
                  {canBid && (
                    <button
                      onClick={() => setShowBidModal(true)}
                      className="w-full btn-primary flex items-center justify-center gap-2"
                    >
                      <CurrencyDollarIcon className="w-5 h-5" />
                      Place a Bid
                    </button>
                  )}
                </div>
                {bids.length === 0 ? (
                  <div className="text-center py-12">
                    <ChatBubbleLeftRightIcon className="w-12 h-12 text-[var(--color-text-subtle)] mx-auto mb-4" />
                    <p className="text-[var(--color-text-muted)]">No bids yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bids.map((bid) => (
                      <div key={bid.id} className="border border-[var(--color-border)] rounded-xl p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[var(--color-accent-muted)] flex items-center justify-center">
                              <UserCircleIcon className="w-6 h-6 text-[var(--color-accent)]" />
                            </div>
                            <div>
                              <p className="font-medium text-[var(--color-text)]">{bid.freelancer?.full_name || 'Unknown'}</p>
                              <p className="text-sm text-[var(--color-text-muted)]">{formatDate(bid.created_at)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-[var(--color-text)]">{formatCurrency(bid.amount_cents)}</p>
                            <p className="text-sm text-[var(--color-text-muted)]">{bid.delivery_days} days delivery</p>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                          <p className="text-[var(--color-text-muted)]">{bid.cover_letter}</p>
                        </div>
                        {isOwner && bid.status === 'pending' && (
                          <div className="mt-4 flex gap-2">
                            <button
                              onClick={() => handleAcceptBid(bid.id)}
                              className="btn-primary text-sm"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleRejectBid(bid.id)}
                              className="btn-secondary text-sm"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {bid.freelancer_id === user?.id && bid.status === 'pending' && (
                          <div className="mt-4">
                            <button
                              onClick={() => handleWithdrawBid(bid.id)}
                              className="btn-secondary text-sm text-red-600 hover:bg-red-50"
                            >
                              Withdraw Bid
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Client Info */}
            <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6">
              <h3 className="text-lg font-medium text-[var(--color-text)] mb-4">Client</h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[var(--color-accent-muted)] flex items-center justify-center">
                  {project.client?.avatar_url ? (
                    <img src={project.client.avatar_url} alt={project.client.full_name ?? 'Unknown'} className="w-16 h-16 rounded-full" />
                  ) : (
                    <UserCircleIcon className="w-8 h-8 text-[var(--color-accent)]" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-[var(--color-text)]">{project.client?.full_name || 'Unknown'}</p>
                  <p className="text-sm text-[var(--color-text-muted)]">@{project.client?.email ? project.client.email.split('@')[0] : 'unknown'}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6">
              <h3 className="text-lg font-medium text-[var(--color-text)] mb-4">Actions</h3>
              <div className="space-y-3">
                {canBid && (
                  <button
                    onClick={() => setShowBidModal(true)}
                    className="w-full btn-primary flex items-center justify-center gap-2"
                  >
                    <CurrencyDollarIcon className="w-5 h-5" />
                    Place a Bid
                  </button>
                )}
                {user && (
                  <Link
                    to="/chat/$projectId"
                    params={{ projectId: String(projectId) }}
                    className="w-full btn-secondary flex items-center justify-center gap-2"
                  >
                    <ChatBubbleLeftRightIcon className="w-5 h-5" />
                    Chat
                  </Link>
                )}
                <button className="w-full btn-ghost flex items-center justify-center gap-2">
                  <ShareIcon className="w-5 h-5" />
                  Share Project
                </button>
                <button className="w-full btn-ghost flex items-center justify-center gap-2 text-red-600 hover:bg-red-50">
                  <FlagIcon className="w-5 h-5" />
                  Report Project
                </button>
              </div>
            </div>
          </aside>
        </div>

        {/* Bid Modal */}
        {showBidModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-[var(--color-surface)] rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[var(--color-text)]">Place Your Bid</h2>
                <button onClick={() => setShowBidModal(false)} className="text-[var(--color-text-subtle)] hover:text-[var(--color-text)]">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleBidSubmit} className="p-6 space-y-4">
                <div>
                  <label htmlFor="bid-price" className="label">Your Price (USD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">$</span>
                    <input
                      id="bid-price"
                      type="number"
                      min="1"
                      step="1"
                      className="input pl-8"
                      placeholder="500"
                      value={bidForm.price_cents}
                      onChange={(e) => setBidForm({ ...bidForm, price_cents: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="bid-delivery" className="label">Delivery Time (days)</label>
                  <input
                    id="bid-delivery"
                    type="number"
                    min="1"
                    max="365"
                    className="input"
                    placeholder="7"
                    value={bidForm.delivery_days}
                    onChange={(e) => setBidForm({ ...bidForm, delivery_days: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="bid-cover" className="label">Cover Letter</label>
                  <textarea
                    id="bid-cover"
                    rows={4}
                    className="input resize-none"
                    placeholder="Explain why you're the best fit for this project..."
                    value={bidForm.cover_letter}
                    onChange={(e) => setBidForm({ ...bidForm, cover_letter: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="bid-portfolio" className="label">Portfolio URLs (comma separated)</label>
                  <input
                    id="bid-portfolio"
                    type="text"
                    className="input"
                    placeholder="https://example.com/project1, https://example.com/project2"
                    value={bidForm.portfolio_urls}
                    onChange={(e) => setBidForm({ ...bidForm, portfolio_urls: e.target.value })}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowBidModal(false)} className="flex-1 btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmittingBid} className="flex-1 btn-primary">
                    {isSubmittingBid ? 'Submitting...' : 'Submit Bid'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}