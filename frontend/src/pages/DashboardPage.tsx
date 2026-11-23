import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import {
  BriefcaseIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ArrowRightIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card, CardGrid, CardTitle } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { LoadingSpinner, CardLoader } from '@/components/ui/LoadingSpinner';
import { api, projectService, bidService, messageService, balanceService } from '@/services/api';
import { Project, Bid, Message } from '@/types';
import { useAuth } from '@/context/AuthContext';

function StatCard({ title, value, change, icon: Icon, href, color = 'primary' }: {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  color?: string;
}) {
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-600',
    success: 'bg-success-50 text-success-600',
    warning: 'bg-warning-50 text-warning-600',
    danger: 'bg-danger-50 text-danger-600',
  };

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-secondary-600">{title}</p>
          <p className="mt-1 text-2xl font-bold text-secondary-900">{value}</p>
          {change && <p className="mt-1 text-sm text-success-600">{change}</p>}
        </div>
        <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center', colorClasses[color])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {href && (
        <Link to={href} className="mt-4 flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700">
          View details
          <ArrowRightIcon className="w-4 h-4" />
        </Link>
      )}
    </Card>
  );
}

import { clsx } from 'clsx';

function ProjectCard({ project, onClick }: { project: Project; onClick?: () => void }) {
  const budgetText = project.budget_min && project.budget_max
    ? `$${(project.budget_min / 100).toLocaleString()} - $${(project.budget_max / 100).toLocaleString()}`
    : project.budget_min
    ? `From $${(project.budget_min / 100).toLocaleString()}`
    : project.budget_max
    ? `Up to $${(project.budget_max / 100).toLocaleString()}`
    : 'Negotiable';

  return (
    <Card hover onClick={onClick} className="h-full">
      <div className="flex items-start justify-between mb-3">
        <Badge variant="primary" size="sm">{project.category}</Badge>
        <StatusBadge status={project.status} size="sm" />
      </div>
      <h3 className="font-semibold text-secondary-900 mb-2 line-clamp-2">{project.title}</h3>
      <p className="text-secondary-600 text-sm mb-4 line-clamp-2">{project.description}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {project.tags.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="outline" size="sm">{tag}</Badge>
        ))}
        {project.tags.length > 3 && (
          <Badge variant="outline" size="sm">+{project.tags.length - 3} more</Badge>
        )}
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-secondary-200">
        <div className="flex items-center gap-2">
          <CurrencyDollarIcon className="w-5 h-5 text-secondary-400" />
          <span className="font-medium text-secondary-900">{budgetText}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-secondary-500">
          <ClockIcon className="w-4 h-4" />
          <span>{project.bids_count} bids</span>
        </div>
      </div>
    </Card>
  );
}

function BidCard({ bid }: { bid: Bid & { project?: Project } }) {
  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar name={bid.freelancer?.full_name || 'Freelancer'} size="sm" src={bid.freelancer?.avatar_url} />
          <div>
            <p className="font-medium text-secondary-900">{bid.freelancer?.full_name || 'Freelancer'}</p>
            <p className="text-sm text-secondary-500">${(bid.amount_cents / 100).toLocaleString()} • {bid.proposed_timeline_days} days</p>
          </div>
        </div>
        <StatusBadge status={bid.status} size="sm" />
      </div>
      <p className="text-secondary-600 text-sm line-clamp-2">{bid.cover_letter}</p>
      {bid.project && (
        <Link to={`/projects/${bid.project.uuid}`} className="mt-3 block text-sm text-primary-600 hover:text-primary-700">
          View Project →
        </Link>
      )}
    </Card>
  );
}

function MessageCard({ message }: { message: Message & { sender?: { full_name: string; avatar_url: string | null } } }) {
  return (
    <Card>
      <div className="flex items-start gap-3">
        <Avatar name={message.sender?.full_name || 'User'} size="sm" src={message.sender?.avatar_url} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="font-medium text-secondary-900 truncate">{message.sender?.full_name || 'User'}</p>
            <span className="text-xs text-secondary-400">
              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
            </span>
          </div>
          <p className="mt-1 text-secondary-600 text-sm line-clamp-1">{message.content}</p>
        </div>
        {!message.is_read && (
          <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-2" />
        )}
      </div>
    </Card>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const isFreelancer = user?.role === 'freelancer';
  const isClient = user?.role === 'client';

  // Fetch data
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['dashboard-projects', user?.id],
    queryFn: () => projectService.list({ page_size: 5, sort_by: 'created_at', sort_order: 'desc' }),
    enabled: !!user,
  });

  const { data: bids, isLoading: bidsLoading } = useQuery({
    queryKey: ['dashboard-bids', user?.id],
    queryFn: () => bidService.list('', { page_size: 5 }), // Will need proper endpoint
    enabled: !!user && isFreelancer,
  });

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['dashboard-messages', user?.id],
    queryFn: () => messageService.list('', { page_size: 5 }), // Will need proper endpoint
    enabled: !!user,
  });

  const { data: balance, isLoading: balanceLoading } = useQuery({
    queryKey: ['dashboard-balance', user?.id],
    queryFn: () => balanceService.get(),
    enabled: !!user,
  });

  if (!user) return null;

  // Mock data for demo
  const mockProjects: Project[] = [
    {
      id: 1,
      uuid: 'proj-1',
      client_id: 1,
      title: 'React Developer for E-commerce Platform',
      description: 'We need an experienced React developer to build a modern e-commerce platform with TypeScript, Tailwind CSS, and Stripe integration.',
      category: 'Web Development',
      subcategory: 'Frontend',
      tags: ['React', 'TypeScript', 'Tailwind', 'Stripe'],
      budget_min: 500000,
      budget_max: 800000,
      is_fixed_price: true,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      estimated_duration_days: 30,
      status: 'open',
      is_featured: true,
      is_urgent: false,
      required_skills: ['React', 'TypeScript'],
      experience_level: 'senior',
      english_level: 'fluent',
      attachments: [],
      views_count: 120,
      bids_count: 12,
      selected_freelancer_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      published_at: new Date().toISOString(),
    },
  ];

  const mockBids = [
    {
      id: 1,
      uuid: 'bid-1',
      project_id: 1,
      freelancer_id: 1,
      amount_cents: 650000,
      cover_letter: 'I have 5+ years of React experience and have built several e-commerce platforms.',
      proposed_timeline_days: 25,
      attachments: [],
      status: 'pending',
      client_notes: null,
      viewed_at: null,
      project: mockProjects[0],
      freelancer: user,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const mockMessages = [
    {
      id: 1,
      uuid: 'msg-1',
      project_id: 1,
      sender_id: 2,
      recipient_id: 1,
      content: 'Hi, I\'m interested in your project. When would be a good time to discuss?',
      message_type: 'text',
      attachments: [],
      is_read: false,
      read_at: null,
      reply_to_id: null,
      sender: { full_name: 'Sarah Johnson', avatar_url: null },
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const displayProjects = projects?.items || (isClient ? mockProjects : []);
  const displayBids = bids?.items || (isFreelancer ? mockBids : []);
  const displayMessages = messages?.items || mockMessages;
  const displayBalance = balance || { balance_cents: 250000, pending_balance_cents: 50000 };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-secondary-900">
            Welcome back, {user.full_name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="mt-1 text-secondary-600">
            {isFreelancer ? 'Here\'s what\'s happening with your projects and bids.' : 'Here\'s an overview of your projects and activity.'}
          </p>
        </div>
        <div className="flex gap-3">
          {isFreelancer && (
            <Button asChild>
              <Link to="/projects/create">
                <PlusIcon className="w-5 h-5 mr-2" />
                Post a Project
              </Link>
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link to="/projects">
              <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
              Browse Projects
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <CardGrid columns={4}>
        <StatCard
          title="Active Projects"
          value={isClient ? displayProjects.length : displayBids.filter((b: any) => b.status === 'accepted').length}
          icon={BriefcaseIcon}
          color="primary"
          href="/projects"
        />
        <StatCard
          title="Pending Bids"
          value={isFreelancer ? displayBids.filter((b: any) => b.status === 'pending').length : displayProjects.reduce((acc, p) => acc + p.bids_count, 0)}
          icon={CheckCircleIcon}
          color="warning"
          href="/bids"
        />
        <StatCard
          title="Unread Messages"
          value={displayMessages.filter((m) => !m.is_read).length}
          icon={ChatBubbleLeftRightIcon}
          color="success"
          href="/messages"
        />
        <StatCard
          title="Available Balance"
          value={`$${(displayBalance.balance_cents / 100).toLocaleString()}`}
          icon={CurrencyDollarIcon}
          color="danger"
          href="/balance"
        />
      </CardGrid>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Projects */}
        <div className="lg:col-span-2 space-y-8">
          {/* My Projects */}
          <div>
            <CardTitle
              title={isClient ? 'My Projects' : 'Recommended Projects'}
              subtitle={isClient ? `${displayProjects.length} project(s)` : 'Based on your skills'}
              action={
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/projects">View All</Link>
                </Button>
              }
            />
            {projectsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => <CardLoader key={i} />)}
              </div>
            ) : displayProjects.length > 0 ? (
              <CardGrid columns={2}>
                {displayProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </CardGrid>
            ) : (
              <Card className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-secondary-100 flex items-center justify-center mx-auto mb-4">
                  {isClient ? <BriefcaseIcon className="w-8 h-8 text-secondary-400" /> : <MagnifyingGlassIcon className="w-8 h-8 text-secondary-400" />}
                </div>
                <h3 className="text-lg font-medium text-secondary-900 mb-1">
                  {isClient ? 'No projects yet' : 'No matching projects'}
                </h3>
                <p className="text-secondary-600 mb-4">
                  {isClient
                    ? 'Create your first project to start hiring talented freelancers.'
                    : 'We couldn\'t find projects matching your skills right now. Check back later!'}
                </p>
                <Button asChild variant={isClient ? 'primary' : 'outline'}>
                  <Link to={isClient ? '/projects/create' : '/projects'}>
                    {isClient ? 'Create Project' : 'Browse All Projects'}
                  </Link>
                </Button>
              </Card>
            )}
          </div>

          {/* Bids or Messages */}
          {(isFreelancer ? displayBids : displayMessages).length > 0 && (
            <div>
              <CardTitle
                title={isFreelancer ? 'Recent Bids' : 'Recent Messages'}
                action={
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={isFreelancer ? '/bids' : '/messages'}>View All</Link>
                  </Button>
                }
              />
              <div className="space-y-3">
                {(isFreelancer ? displayBids : displayMessages).slice(0, 3).map((item) => (
                  isFreelancer ? <BidCard key={item.id} bid={item} /> : <MessageCard key={item.id} message={item} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Quick Actions & Info */}
        <div className="space-y-6">
          {/* Balance Card */}
          <Card>
            <CardTitle title="Balance" subtitle="Available to withdraw" />
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-secondary-900">${(displayBalance.balance_cents / 100).toLocaleString()}</p>
                <p className="text-sm text-secondary-500">Available</p>
              </div>
              {displayBalance.pending_balance_cents > 0 && (
                <div className="text-center">
                  <p className="text-xl font-medium text-warning-600">${(displayBalance.pending_balance_cents / 100).toLocaleString()}</p>
                  <p className="text-sm text-secondary-500">Pending</p>
                </div>
              )}
              <div className="pt-4 border-t border-secondary-200 space-y-2">
                <Button variant="outline" fullWidth asChild>
                  <Link to="/balance">View Transactions</Link>
                </Button>
                <Button fullWidth asChild>
                  <Link to="/balance">Withdraw Funds</Link>
                </Button>
                <Button variant="outline" fullWidth asChild>
                  <Link to="/balance">Add Funds</Link>
                </Button>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardTitle title="Quick Actions" />
            <div className="space-y-2">
              <Button variant="outline" fullWidth leftIcon={<PlusIcon className="w-4 h-4" />} asChild>
                <Link to="/projects/create">Post a New Project</Link>
              </Button>
              <Button variant="outline" fullWidth leftIcon={<MagnifyingGlassIcon className="w-4 h-4" />} asChild>
                <Link to="/projects">Browse Projects</Link>
              </Button>
              <Button variant="outline" fullWidth leftIcon={<ChatBubbleLeftRightIcon className="w-4 h-4" />} asChild>
                <Link to="/messages">Check Messages</Link>
              </Button>
              <Button variant="outline" fullWidth leftIcon={<CurrencyDollarIcon className="w-4 h-4" />} asChild>
                <Link to="/balance">Manage Balance</Link>
              </Button>
            </div>
          </Card>

          {/* Plan Info */}
          <Card>
            <CardTitle title="Your Plan" subtitle={user.plan.charAt(0).toUpperCase() + user.plan.slice(1)} />
            <div className="space-y-3">
              <Badge variant={user.plan === 'starter' ? 'secondary' : user.plan === 'pro' ? 'primary' : 'success'} className="w-full justify-center">
                {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)} Plan
              </Badge>
              <ul className="space-y-2 text-sm text-secondary-600">
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-success-500" />
                  {user.plan === 'starter' ? '5 bids/week' : user.plan === 'pro' ? '50 bids/week' : 'Unlimited bids'}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-success-500" />
                  {user.plan !== 'starter' && 'AI-powered tools'}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-success-500" />
                  {user.plan === 'starter' ? '5% platform fee' : user.plan === 'pro' ? '3% platform fee' : '1% platform fee'}
                </li>
              </ul>
              {user.plan !== 'agency' && (
                <Button variant="outline" fullWidth size="sm" asChild>
                  <Link to="/settings?tab=billing">Upgrade Plan</Link>
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}