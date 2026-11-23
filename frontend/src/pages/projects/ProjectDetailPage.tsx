import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useSearch } from '@tanstack/react-router';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { Project, Bid, BidStatus, formatCurrency, formatDate, getStatusColor } from '../../types';
import {
  ArrowLeftIcon,
  UserCircleIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ClockIcon,
  MapPinIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  EyeIcon,
  PencilIcon,
  ShareIcon,
  FlagIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export function ProjectDetailPage() {
  const params = useParams({ from: '/projects/$projectId' });
  const search = useSearch({ from: '/projects/$projectId' });
  const navigate = useNavigate();
  const { user, hasRole, canUseAI, getBidLimit } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(search.tab || 'details');
  const [showBidModal, setShowBidModal] = useState(false);
  const [bidForm, setBidForm] = useState({ price_cents: '', delivery_days: '', cover_letter: '', portfolio_urls: '' });
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);

  const projectId = parseInt(params.projectId);

  useEffect(() => {
    fetchProject();
    fetchBids();
  }, [projectId]);

  useEffect(() => {
    setActiveTab(search.tab || 'details');
  }, [search.tab]);

  const fetchProject = async () => {
    try {
      const data = await api.getProject(projectId);
      setProject(data);
    } catch (error) {
      toast.error('Failed to load project');
      navigate('/projects');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBids = async () => {
    try {
      const data = await api.getBids(projectId);
      setBids(data.items || []);
    } catch (error) {
      console.error('Failed to fetch bids:', error);
    }
  };

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { search: { redirect: `/projects/${projectId}` } });
      return;
    }
    if (user.role !== 'freelancer' && user.role !== 'admin') {
      toast.error('Only freelancers can bid on projects');
      return;
    }
    setIsSubmittingBid(true);
    try {
      await api.createBid({
        project_id: projectId,
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
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to submit bid');
    } finally {
      setIsSubmittingBid(false);
    }
  };

  const handleAcceptBid = async (bidId: number) => {
    try {
      await api.acceptBid(bidId);
      toast.success('Bid accepted!');
      fetchProject();
      fetchBids();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to accept bid');
    }
  };

  const handleRejectBid = async (bidId: number) => {
    try {
      await api.rejectBid(bidId);
      toast.success('Bid rejected');
      fetchBids();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to reject bid');
    }
  };

  const handleWithdrawBid = async (bidId: number) => {
    try {
      await api.withdrawBid(bidId);
      toast.success('Bid withdrawn');
      fetchBids();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to withdraw bid');
    }
  };

  const userBid = bids.find((b) => b.freelancer_id === user?.id);
  const canBid = user && (user.role === 'freelancer' || user.role === 'admin') && project?.status === 'open' && !userBid;
  const isOwner = user && project?.client_id === user.id;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 rounded-xl" />
              <div className="h-32 bg-gray-200 rounded-xl" />
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-gray-200 rounded-xl" />
              <div className="h-48 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Project not found</h2>
          <Link to="/projects" className="btn-primary mt-4 inline-block">Back to Projects</Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'details', label: 'Details', icon: DocumentTextIcon },
    { id: 'bids', label: `Bids (${project.bid_count})`, icon: ChatBubbleLeftRightIcon },
    { id: 'chat', label: 'Chat', icon: ChatBubbleLeftRightIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-4">
            <Link to="/projects" className="text-gray-500 hover:text-gray-700">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div className="flex-1">
              <nav className="flex gap-2" aria-label="Project tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => navigate({ search: { ...search, tab: tab.id } })}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
            {isOwner && (
              <Link to={`/projects/${projectId}/edit`} className="btn-secondary flex items-center gap-2">
                <PencilIcon className="w-5 h-5" />
                Edit
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Header */}
            <div className="card p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
                    <span className={`badge ${getStatusColor(project.status)}`}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <Link
                      to={`/profile/${project.client_id}`}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      <UserCircleIcon className="w-4 h-4" />
                      {project.client?.full_name || 'Client'}
                    </Link>
                    <span className="flex items-center gap-1">
                      <CalendarDaysIcon className="w-4 h-4" />
                      Posted {formatDate(project.created_at)}
                    </span>
                    {project.deadline_days && (
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        {project.deadline_days} days left
                      </span>
                    )}
                  </div>
                </div>
                {canBid && (
                  <button
                    onClick={() => setShowBidModal(true)}
                    className="btn-primary flex items-center gap-2 whitespace-nowrap"
                  >
                    <CurrencyDollarIcon className="w-5 h-5" />
                    Place Bid
                  </button>
                )}
              </div>

              <p className="text-gray-700 whitespace-pre-wrap mb-6">{project.description}</p>

              {project.requirements && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Requirements</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{project.requirements}</p>
                </div>
              )}

              {/* Skills */}
              {project.skills.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    Skills Required
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.skills.map((skill) => (
                      <span key={skill} className="badge badge-primary">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Meta Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-500">Budget</p>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(project.budget_min)}
                    {project.budget_max && ` - ${formatCurrency(project.budget_max)}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-semibold text-gray-900">
                    {project.is_fixed_price ? 'Fixed Price' : 'Hourly'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bids</p>
                  <p className="font-semibold text-gray-900">{project.bid_count}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Views</p>
                  <p className="font-semibold text-gray-900">{project.view_count}</p>
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <div className="card">
              <div className="p-6 border-b border-gray-200">
                {activeTab === 'details' && (
                  <div className="space-y-6">
                    {project.freelancer && (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-3">
                          <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-green-800">Project Awarded</p>
                            <p className="text-sm text-green-700">
                              Awarded to {project.freelancer.full_name} on {formatDate(project.accepted_bid?.accepted_at || '')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Full Description</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
                    </div>
                    {project.requirements && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Requirements</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{project.requirements}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'bids' && (
                  <div>
                    {bids.length === 0 ? (
                      <div className="p-12 text-center">
                        <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No bids yet</h3>
                        <p className="mt-1 text-gray-500">Be the first to bid on this project!</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {bids.map((bid) => (
                          <div key={bid.id} className="p-6 hover:bg-gray-50">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <Link to={`/profile/${bid.freelancer_id}`} className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                                      {bid.freelancer?.avatar_url ? (
                                        <img src={bid.freelancer.avatar_url} alt="" className="w-10 h-10 rounded-full" />
                                      ) : (
                                        <UserCircleIcon className="w-6 h-6 text-primary-600" />
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-900">{bid.freelancer?.full_name || 'Freelancer'}</p>
                                      <p className="text-sm text-gray-500">{bid.freelancer?.rating || 0} ⭐ · {bid.freelancer?.completed_projects || 0} completed</p>
                                    </div>
                                  </Link>
                                  <span className={`badge ${getStatusColor(bid.status)}`}>
                                    {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                                  </span>
                                </div>
                                <p className="text-gray-700 mb-3">{bid.cover_letter}</p>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <CurrencyDollarIcon className="w-4 h-4" />
                                    {formatCurrency(bid.price_cents)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <ClockIcon className="w-4 h-4" />
                                    {bid.delivery_days} days
                                  </span>
                                  {bid.portfolio_urls.length > 0 && (
                                    <span className="flex items-center gap-1">
                                      <DocumentTextIcon className="w-4 h-4" />
                                      {bid.portfolio_urls.length} portfolio items
                                    </span>
                                  )}
                                </div>
                              </div>
                              {isOwner && bid.status === 'pending' && (
                                <div className="flex flex-col gap-2">
                                  <button
                                    onClick={() => handleAcceptBid(bid.id)}
                                    className="btn-success text-sm"
                                  >
                                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => handleRejectBid(bid.id)}
                                    className="btn-danger text-sm"
                                  >
                                    <XCircleIcon className="w-4 h-4 mr-1" />
                                    Reject
                                  </button>
                                </div>
                              )}
                              {bid.freelancer_id === user?.id && bid.status === 'pending' && (
                                <button
                                  onClick={() => handleWithdrawBid(bid.id)}
                                  className="btn-ghost text-sm text-red-600 hover:bg-red-50"
                                >
                                  Withdraw Bid
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'chat' && (
                  <div className="p-6">
                    {user ? (
                      <Link
                        to={`/chat/${projectId}`}
                        className="btn-primary flex items-center justify-center gap-2 w-full"
                      >
                        <ChatBubbleLeftRightIcon className="w-5 h-5" />
                        Open Chat
                      </Link>
                    ) : (
                      <div className="text-center">
                        <p className="text-gray-600 mb-4">Sign in to chat with the client/freelancer</p>
                        <Link to="/login" className="btn-primary inline-block">
                          Sign In
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Client Info */}
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Client</h3>
              <Link to={`/profile/${project.client_id}`} className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center">
                  {project.client?.avatar_url ? (
                    <img src={project.client.avatar_url} alt="" className="w-14 h-14 rounded-full" />
                  ) : (
                    <UserCircleIcon className="w-8 h-8 text-primary-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{project.client?.full_name || 'Client'}</p>
                  <p className="text-sm text-gray-500">@{project.client?.email?.split('@')[0] || 'user'}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      {project.client?.rating || 0} ⭐
                    </span>
                    <span className="text-sm text-gray-400">·</span>
                    <span className="text-sm text-gray-500">{project.client?.completed_projects || 0} completed</span>
                  </div>
                </div>
              </Link>
              <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Member since</p>
                  <p className="font-medium text-gray-900">{formatDate(project.client?.created_at || '')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Verification</p>
                  <p className="font-medium text-gray-900">{project.client?.is_verified ? 'Verified' : 'Not verified'}</p>
                </div>
              </div>
            </div>

            {/* Project Stats */}
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Project Details</h3>
              <dl className="space-y-4">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Budget Range</dt>
                  <dd className="font-medium text-gray-900">
                    {formatCurrency(project.budget_min)}
                    {project.budget_max && ` - ${formatCurrency(project.budget_max)}`}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Price Type</dt>
                  <dd className="font-medium text-gray-900">{project.is_fixed_price ? 'Fixed Price' : 'Hourly'}</dd>
                </div>
                {project.deadline_days && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Deadline</dt>
                    <dd className="font-medium text-gray-900">{project.deadline_days} days</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-gray-500">Posted</dt>
                  <dd className="font-medium text-gray-900">{formatDate(project.created_at)}</dd>
                </div>
                {project.started_at && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Started</dt>
                    <dd className="font-medium text-gray-900">{formatDate(project.started_at)}</dd>
                  </div>
                )}
                {project.completed_at && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Completed</dt>
                    <dd className="font-medium text-gray-900">{formatDate(project.completed_at)}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Actions */}
            <div className="card p-6 space-y-3">
              <h3 className="font-semibold text-gray-900 mb-3">Actions</h3>
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
                  to={`/chat/${projectId}`}
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
          </aside>
        </div>
      </div>

      {/* Bid Modal */}
      {showBidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Place Your Bid</h2>
              <button onClick={() => setShowBidModal(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleBidSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="bid-price" className="label">Your Price (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
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
  );
}