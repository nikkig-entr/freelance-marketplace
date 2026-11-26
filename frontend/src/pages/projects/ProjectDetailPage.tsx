import { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate, useSearch } from '@tanstack/react-router';
import { useAuth } from '@/contexts/AuthContext';
import { projectService, bidService } from '@/services/api';
import { Project, Bid, ProjectStatus, formatCurrency, formatDate } from '@/types';
import {
  ArrowLeftIcon,
  UserCircleIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  ShareIcon,
  FlagIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

interface ProjectDetailSearch {
  tab?: string;
}

const projectImages = [
  '/media/projects/projects-code.jpg',
  '/media/projects/projects-design.jpg',
  '/media/hero/hero-main.jpg',
  '/media/hero/hero-code.jpg',
  '/media/bento/bento-remote-work.jpg',
  '/media/bento/bento-escrow.jpg',
];

function getStatusBadge(status: ProjectStatus) {
  const labels: Record<ProjectStatus, string> = {
    open: 'Open',
    in_progress: 'In Progress',
    in_review: 'In Review',
    completed: 'Completed',
    cancelled: 'Cancelled',
    disputed: 'Disputed',
    draft: 'Draft',
  };
  return (
    <span className="inline-flex items-center px-3 py-1 text-sm font-medium border border-[var(--color-border)]">
      {labels[status] || status}
    </span>
  );
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
          <div className="h-8 bg-[var(--color-border)] rounded-none w-1/4" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-[var(--color-border)] rounded-none" />
              <div className="h-32 bg-[var(--color-border)] rounded-none" />
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-[var(--color-border)] rounded-none" />
              <div className="h-48 bg-[var(--color-border)] rounded-none" />
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

  const previewImage = projectImages[project.id % projectImages.length];

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
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="aspect-video relative overflow-hidden bg-[var(--color-border)]">
              <img
                src={previewImage}
                alt={`${project.title} project preview`}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)]/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium border border-[var(--color-border)]">
                  {project.is_fixed_price ? 'Fixed Price' : 'Hourly'}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="border border-[var(--color-border)] p-6">
              <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4 border-b border-[var(--color-border)] pb-4">Description</h2>
              <div className="prose prose-invert max-w-none text-[var(--color-text)] whitespace-pre-wrap">
                {project.description}
              </div>
              {project.requirements && (
                <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
                  <h3 className="text-lg font-medium text-[var(--color-text)] mb-3">Requirements</h3>
                  <div className="prose prose-invert max-w-none text-[var(--color-text-muted)] whitespace-pre-wrap">
                    {project.requirements}
                  </div>
                </div>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="border border-[var(--color-border)] p-6">
                <h3 className="text-lg font-medium text-[var(--color-text)] mb-4 border-b border-[var(--color-border)] pb-4">Budget</h3>
                <div className="space-y-4">
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

              <div className="border border-[var(--color-border)] p-6">
                <h3 className="text-lg font-medium text-[var(--color-text)] mb-4 border-b border-[var(--color-border)] pb-4">Timeline</h3>
                <div className="space-y-4">
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
              <div className="border border-[var(--color-border)] p-6">
                <h3 className="text-lg font-medium text-[var(--color-text)] mb-4 border-b border-[var(--color-border)] pb-4">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {project.required_skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 text-sm font-mono text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/50 hover:text-[var(--color-accent)] transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bids Tab Content */}
            {activeTab === 'bids' && (
              <div className="border border-[var(--color-border)] p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-[var(--color-text)]">Bids ({bids.length})</h2>
                  {canBid && (
                    <Button
                      onClick={() => setShowBidModal(true)}
                      className="flex items-center justify-center gap-2"
                    >
                      <CurrencyDollarIcon className="w-5 h-5" />
                      Place a Bid
                    </Button>
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
                      <div key={bid.id} className="border border-[var(--color-border)] p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[var(--color-border)] flex items-center justify-center">
                              <UserCircleIcon className="w-6 h-6 text-[var(--color-text-muted)]" />
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
                            <Button onClick={() => handleAcceptBid(bid.id)} size="sm">
                              Accept
                            </Button>
                            <Button variant="secondary" onClick={() => handleRejectBid(bid.id)} size="sm">
                              Reject
                            </Button>
                          </div>
                        )}
                        {bid.freelancer_id === user?.id && bid.status === 'pending' && (
                          <div className="mt-4">
                            <Button variant="secondary" onClick={() => handleWithdrawBid(bid.id)} size="sm" className="text-[var(--color-gray-500)] hover:bg-[var(--color-gray-800)]">
                              Withdraw Bid
                            </Button>
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
            <div className="border border-[var(--color-border)] p-6">
              <h3 className="text-lg font-medium text-[var(--color-text)] mb-4 border-b border-[var(--color-border)] pb-4">Client</h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[var(--color-border)] flex items-center justify-center overflow-hidden">
                  {project.client?.avatar_url ? (
                    <img src={project.client.avatar_url} alt={project.client.full_name ?? 'Unknown'} className="w-16 h-16 rounded-full" loading="lazy" />
                  ) : (
                    <UserCircleIcon className="w-8 h-8 text-[var(--color-text-muted)]" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-[var(--color-text)]">{project.client?.full_name || 'Unknown'}</p>
                  <p className="text-sm text-[var(--color-text-muted)]">@{project.client?.email ? project.client.email.split('@')[0] : 'unknown'}</p>
                </div>
              </div>
            </div>

            {/* Project Meta */}
            <div className="border border-[var(--color-border)] p-6">
              <h3 className="text-lg font-medium text-[var(--color-text)] mb-4 border-b border-[var(--color-border)] pb-4">Details</h3>
              <dl className="space-y-4">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-[var(--color-text-muted)]">Category</dt>
                  <dd className="font-mono text-[var(--color-text)]">{project.category}</dd>
                </div>
                {project.subcategory && (
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-[var(--color-text-muted)]">Subcategory</dt>
                    <dd className="font-mono text-[var(--color-text)]">{project.subcategory}</dd>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-[var(--color-text-muted)]">Experience Level</dt>
                  <dd className="font-mono text-[var(--color-text)]">{project.experience_level}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-[var(--color-text-muted)]">English Level</dt>
                  <dd className="font-mono text-[var(--color-text)]">{project.english_level}</dd>
                </div>
                {project.bids_count && (
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-[var(--color-text-muted)]">Bids Received</dt>
                    <dd className="font-mono text-[var(--color-text)]">{project.bids_count}</dd>
                  </div>
                )}
                {project.views_count && (
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-[var(--color-text-muted)]">Views</dt>
                    <dd className="font-mono text-[var(--color-text)]">{project.views_count}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Actions */}
            <div className="border border-[var(--color-border)] p-6">
              <h3 className="text-lg font-medium text-[var(--color-text)] mb-4 border-b border-[var(--color-border)] pb-4">Actions</h3>
              <div className="space-y-3">
                {canBid && (
                  <Button onClick={() => setShowBidModal(true)} fullWidth className="flex items-center justify-center gap-2">
                    <CurrencyDollarIcon className="w-5 h-5" />
                    Place a Bid
                  </Button>
                )}
                {user && (
                  <Link
                    to="/chat/$projectId"
                    params={{ projectId: String(projectId) }}
                    className="w-full"
                  >
                    <Button variant="secondary" fullWidth className="flex items-center justify-center gap-2">
                      <ChatBubbleLeftRightIcon className="w-5 h-5" />
                      Chat
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" fullWidth className="flex items-center justify-center gap-2">
                  <ShareIcon className="w-5 h-5" />
                  Share Project
                </Button>
                <Button variant="ghost" fullWidth className="flex items-center justify-center gap-2 text-[var(--color-gray-500)] hover:bg-[var(--color-gray-800)]">
                  <FlagIcon className="w-5 h-5" />
                  Report Project
                </Button>
              </div>
            </div>
          </aside>
        </div>

        {/* Bid Modal */}
        {showBidModal && (
          <Modal
            isOpen={showBidModal}
            onClose={() => setShowBidModal(false)}
            title="Place Your Bid"
            size="md"
          >
            <form onSubmit={handleBidSubmit} className="space-y-4">
              <div>
                <label htmlFor="bid-price" className="input-label">Your Price (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">$</span>
                  <Input
                    id="bid-price"
                    type="number"
                    min="1"
                    step="1"
                    className="pl-8"
                    placeholder="500"
                    value={bidForm.price_cents}
                    onChange={(e) => setBidForm({ ...bidForm, price_cents: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="bid-delivery" className="input-label">Delivery Time (days)</label>
                <Input
                  id="bid-delivery"
                  type="number"
                  min="1"
                  max="365"
                  placeholder="7"
                  value={bidForm.delivery_days}
                  onChange={(e) => setBidForm({ ...bidForm, delivery_days: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="bid-cover" className="input-label">Cover Letter</label>
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
                <label htmlFor="bid-portfolio" className="input-label">Portfolio URLs (comma separated)</label>
                <Input
                  id="bid-portfolio"
                  type="text"
                  placeholder="https://example.com/project1, https://example.com/project2"
                  value={bidForm.portfolio_urls}
                  onChange={(e) => setBidForm({ ...bidForm, portfolio_urls: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={() => setShowBidModal(false)} fullWidth>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmittingBid} fullWidth>
                  {isSubmittingBid ? 'Submitting...' : 'Submit Bid'}
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </div>
  );
}