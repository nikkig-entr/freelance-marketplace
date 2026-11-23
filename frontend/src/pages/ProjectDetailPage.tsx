import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  ClockIcon,
  CurrencyDollarIcon,
  UserIcon,
  MapPinIcon,
  GlobeAltIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  ArrowRightIcon,
  ShareIcon,
  FlagIcon,
} from '@heroicons/react/24/outline';
import { Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge, StatusBadge, PlanBadge } from '@/components/ui/Badge';
import { Avatar, AvatarGroup } from '@/components/ui/Avatar';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { LoadingSpinner, CardLoader } from '@/components/ui/LoadingSpinner';
import { projectService, bidService, messageService } from '@/services/api';
import { Project, Bid } from '@/types';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export function ProjectDetailPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, hasRole } = useAuth();
  const isFreelancer = hasRole(['freelancer']);
  const isClient = hasRole(['client']);
  const isOwner = user && false; // Would check if user is project owner

  const [showBidModal, setShowBidModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [bidTimeline, setBidTimeline] = useState('');
  const [bidCoverLetter, setBidCoverLetter] = useState('');

  const { data: project, isLoading, isError } = useQuery({
    queryKey: ['project', uuid],
    queryFn: () => projectService.get(uuid!),
    enabled: !!uuid,
  });

  const { mutate: placeBid, isPending: bidPending } = useMutation({
    mutationFn: (data: { amount_cents: number; proposed_timeline_days: number; cover_letter: string }) =>
      bidService.create(uuid!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', uuid] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-bids'] });
      toast.success('Bid placed successfully!');
      setShowBidModal(false);
      setBidAmount('');
      setBidTimeline('');
      setBidCoverLetter('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to place bid');
    },
  });

  const { mutate: acceptBid, isPending: acceptPending } = useMutation({
    mutationFn: (bidId: string) => bidService.accept(bidId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', uuid] });
      toast.success('Bid accepted!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to accept bid');
    },
  });

  const budgetText = project?.budget_min && project?.budget_max
    ? `$${(project.budget_min / 100).toLocaleString()} - $${(project.budget_max / 100).toLocaleString()}`
    : project?.budget_min
    ? `From $${(project.budget_min / 100).toLocaleString()}`
    : project?.budget_max
    ? `Up to $${(project.budget_max / 100).toLocaleString()}`
    : 'Negotiable';

  if (isLoading) {
    return <CardLoader />;
  }

  if (isError || !project) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-secondary-900">Project not found</h1>
        <Button asChild className="mt-4">
          <Link to="/projects">Browse Projects</Link>
        </Button>
      </div>
    );
  }

  const canBid = isFreelancer && project.status === 'open' && project.client_id !== user?.id;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <Badge variant="primary">{project.category}</Badge>
            <StatusBadge status={project.status} />
            {project.is_featured && <Badge variant="warning">Featured</Badge>}
            {project.is_urgent && <Badge variant="danger">Urgent</Badge>}
          </div>
          <h1 className="text-3xl font-heading font-bold text-secondary-900 mb-3">{project.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-secondary-600">
            <span className="flex items-center gap-1">
              <CurrencyDollarIcon className="w-4 h-4" />
              {budgetText}
            </span>
            {project.deadline && (
              <span className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4" />
                Deadline: {format(new Date(project.deadline), 'MMM d, yyyy')}
              </span>
            )}
            <span className="flex items-center gap-1">
              <ChatBubbleLeftRightIcon className="w-4 h-4" />
              {project.bids_count} bid{project.bids_count !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1">
              <UserIcon className="w-4 h-4" />
              {project.views_count} views
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {canBid && (
            <Button onClick={() => setShowBidModal(true)} leftIcon={<CurrencyDollarIcon className="w-4 h-4" />}>
              Place a Bid
            </Button>
          )}
          {isClient && project.status === 'open' && (
            <Button variant="outline" onClick={() => navigate(`/projects/${project.uuid}/edit`)}>
              Edit Project
            </Button>
          )}
          <Button variant="ghost" leftIcon={<ShareIcon className="w-4 h-4" />}>
            Share
          </Button>
          <Button variant="ghost" leftIcon={<FlagIcon className="w-4 h-4" />} onClick={() => setShowReportModal(true)}>
            Report
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Description & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardTitle title="Project Description" />
            <div className="prose prose-secondary max-w-none">
              <p className="whitespace-pre-wrap">{project.description}</p>
            </div>
          </Card>

          {/* Requirements */}
          <Card>
            <CardTitle title="Requirements" />
            <div className="space-y-4">
              {project.required_skills.length > 0 && (
                <div>
                  <h4 className="font-medium text-secondary-900 mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.required_skills.map((skill) => (
                      <Badge key={skill} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-secondary-500">Experience Level</p>
                  <p className="font-medium text-secondary-900 capitalize">{project.experience_level}</p>
                </div>
                <div>
                  <p className="text-secondary-500">English Level</p>
                  <p className="font-medium text-secondary-900 capitalize">{project.english_level}</p>
                </div>
                <div>
                  <p className="text-secondary-500">Project Type</p>
                  <p className="font-medium text-secondary-900">{project.is_fixed_price ? 'Fixed Price' : 'Hourly'}</p>
                </div>
                <div>
                  <p className="text-secondary-500">Estimated Duration</p>
                  <p className="font-medium text-secondary-900">
                    {project.estimated_duration_days ? `${project.estimated_duration_days} days` : 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Attachments */}
          {project.attachments.length > 0 && (
            <Card>
              <CardTitle title="Attachments" />
              <div className="space-y-2">
                {project.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-secondary-400" />
                      </div>
                      <div>
                        <p className="font-medium text-secondary-900">{attachment.name}</p>
                        <p className="text-sm text-secondary-500">{(attachment.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Download</Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Bids */}
          {isClient && project.status !== 'cancelled' && (
            <Card>
              <CardTitle title="Bids" subtitle={`${project.bids_count} bids received`} />
              {/* Bids would be fetched and displayed here */}
              <div className="text-center py-8 text-secondary-500">
                <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto mb-3 text-secondary-300" />
                <p>No bids yet. Bids will appear here when freelancers apply.</p>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - Client Info & Actions */}
        <div className="space-y-6">
          {/* Client Info */}
          <Card>
            <CardTitle title="Posted by" />
            <div className="flex items-center gap-4">
              <Avatar
                name={project.client?.full_name || 'Client'}
                src={project.client?.avatar_url}
                size="lg"
                status={project.client?.is_active ? 'online' : 'offline'}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-secondary-900 truncate">
                  {project.client?.full_name || 'Anonymous Client'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <PlanBadge plan={project.client?.plan || 'starter'} size="sm" />
                  {project.client?.rating && (
                    <div className="flex items-center gap-1">
                      <StarIcon className="w-4 h-4 text-amber-500 fill-current" />
                      <span className="text-sm font-medium">{project.client.rating.toFixed(1)}</span>
                      <span className="text-secondary-500">({project.client.reviews_count} reviews)</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm text-secondary-500">
                  <MapPinIcon className="w-4 h-4" />
                  <span>{project.client?.location || 'Location not specified'}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-secondary-200">
              <Button variant="outline" fullWidth asChild>
                <Link to={`/messages/${project.id}`}>Contact Client</Link>
              </Button>
            </div>
          </Card>

          {/* Project Timeline */}
          <Card>
            <CardTitle title="Timeline" />
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircleIcon className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-secondary-900">Project Posted</p>
                  <p className="text-sm text-secondary-500">
                    {format(new Date(project.published_at || project.created_at), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
              {project.started_at && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-secondary-900">Work Started</p>
                    <p className="text-sm text-secondary-500">{format(new Date(project.started_at), 'MMM d, yyyy')}</p>
                  </div>
                </div>
              )}
              {project.deadline && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-warning-50 flex items-center justify-center flex-shrink-0">
                    <ClockIcon className="w-5 h-5 text-warning-600" />
                  </div>
                  <div>
                    <p className="font-medium text-secondary-900">Deadline</p>
                    <p className="text-sm text-secondary-500">{format(new Date(project.deadline), 'MMM d, yyyy')}</p>
                  </div>
                </div>
              )}
              {project.completed_at && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-success-50 flex items-center justify-center flex-shrink-0">
                    <CheckCircleIcon className="w-5 h-5 text-success-600" />
                  </div>
                  <div>
                    <p className="font-medium text-secondary-900">Completed</p>
                    <p className="text-sm text-secondary-500">{format(new Date(project.completed_at), 'MMM d, yyyy')}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Quick Stats */}
          <Card>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 rounded-xl bg-secondary-50">
                <p className="text-2xl font-bold text-secondary-900">{project.bids_count}</p>
                <p className="text-sm text-secondary-500">Total Bids</p>
              </div>
              <div className="p-4 rounded-xl bg-secondary-50">
                <p className="text-2xl font-bold text-secondary-900">{project.views_count}</p>
                <p className="text-sm text-secondary-500">Views</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Bid Modal */}
      <Modal
        isOpen={showBidModal}
        onClose={() => setShowBidModal(false)}
        title="Place a Bid"
        description="Submit your proposal for this project"
        size="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (bidAmount && bidTimeline && bidCoverLetter) {
              placeBid({
                amount_cents: parseFloat(bidAmount) * 100,
                proposed_timeline_days: parseInt(bidTimeline),
                cover_letter: bidCoverLetter,
              });
            }
          }}
          className="space-y-4"
        >
          <Input
            label="Bid Amount (USD)"
            type="number"
            placeholder="500"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            error={!bidAmount && bidPending ? 'Required' : undefined}
            required
          />
          <Input
            label="Timeline (Days)"
            type="number"
            placeholder="14"
            value={bidTimeline}
            onChange={(e) => setBidTimeline(e.target.value)}
            error={!bidTimeline && bidPending ? 'Required' : undefined}
            required
          />
          <Textarea
            label="Cover Letter"
            placeholder="Explain why you're the best fit for this project..."
            value={bidCoverLetter}
            onChange={(e) => setBidCoverLetter(e.target.value)}
            rows={6}
            error={!bidCoverLetter && bidPending ? 'Required' : undefined}
            required
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setShowBidModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={bidPending}>
              Submit Bid
            </Button>
          </div>
        </form>
      </Modal>

      {/* Report Modal */}
      <ConfirmModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onConfirm={() => {
          // Report logic here
          toast.success('Project reported. Our team will review it.');
          setShowReportModal(false);
        }}
        title="Report Project"
        message="Are you sure you want to report this project? Our moderation team will review it."
        confirmText="Report"
        variant="danger"
      />
    </div>
  );
}