import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';
import {
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ArrowRightIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { projectService, bidService, messageService, balanceService } from '@/services/api';
import { Project, Bid, Message, MessageType } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface PaginatedProjects {
  items: Project[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

interface PaginatedBids {
  items: Bid[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

interface PaginatedMessages {
  items: Message[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

interface Balance {
  balance_cents: number;
  pending_balance_cents: number;
}

function StatCard({ title, value, change, icon: Icon, href, color = 'primary' }: {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger';
}) {
  const colorClasses: Record<string, string> = {
    primary: 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]',
    success: 'bg-[var(--color-success-muted)] text-[var(--color-success)]',
    warning: 'bg-[var(--color-warning-muted)] text-[var(--color-warning)]',
    danger: 'bg-[var(--color-error-muted)] text-[var(--color-error)]',
  };

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--color-text-muted)]">{title}</p>
          <p className="mt-1 text-2xl font-bold text-[var(--color-text)]">{value}</p>
          {change && <p className="mt-1 text-sm text-[var(--color-success)]">{change}</p>}
        </div>
        <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center', colorClasses[color])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {href && (
        <Link to={href} className="mt-4 flex items-center gap-1 text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]">
          View details
          <ArrowRightIcon className="w-4 h-4" />
        </Link>
      )}
    </Card>
  );
}

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
        <Badge variant="outline" size="sm">{project.status.replace('_', ' ')}</Badge>
      </div>
      <h3 className="font-semibold text-[var(--color-text)] mb-2 line-clamp-2">{project.title}</h3>
      <p className="text-[var(--color-text-muted)] text-sm mb-4 line-clamp-2">{project.description}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {(project.tags || []).slice(0, 3).map((tag) => (
          <Badge key={tag} variant="outline" size="sm">{tag}</Badge>
        ))}
        {project.tags && project.tags.length > 3 && (
          <Badge variant="outline" size="sm">+{project.tags.length - 3} more</Badge>
        )}
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <CurrencyDollarIcon className="w-5 h-5 text-[var(--color-text-subtle)]" />
          <span className="font-medium text-[var(--color-text)]">{budgetText}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
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
            <p className="font-medium text-[var(--color-text)]">{bid.freelancer?.full_name || 'Freelancer'}</p>
            <p className="text-sm text-[var(--color-text-muted)]">${(bid.amount_cents / 100).toLocaleString()} • {bid.proposed_timeline_days} days</p>
          </div>
        </div>
        <Badge variant="outline" size="sm">{bid.status.replace('_', ' ')}</Badge>
      </div>
      <p className="text-[var(--color-text-muted)] text-sm line-clamp-2">{bid.cover_letter}</p>
      {bid.project && (
        <Button variant="ghost" size="sm" asChild>
          <Link to="/projects/$projectId" params={{ projectId: String(bid.project.id) }} search={{ tab: 'details' }}>View Project</Link>
        </Button>
      )}
    </Card>
  );
}

function MessageCard({ message }: { message: Message }) {
  return (
    <Card>
      <div className="flex items-start gap-3">
        <Avatar name={message.sender?.full_name || 'User'} size="sm" src={message.sender?.avatar_url} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="font-medium text-[var(--color-text)] truncate">{message.sender?.full_name || 'User'}</p>
            <span className="text-xs text-[var(--color-text-subtle)]">
              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
            </span>
          </div>
          <p className="mt-1 text-[var(--color-text-muted)] text-sm line-clamp-1">{message.content}</p>
        </div>
        {!message.is_read && (
          <div className="w-2 h-2 rounded-full bg-[var(--color-accent)] flex-shrink-0 mt-2" />
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
  const { data: projectsData, isLoading: projectsLoading } = useQuery<PaginatedProjects>({
    queryKey: ['dashboard-projects', user?.id],
    queryFn: () => projectService.list({ page_size: 5, sort_by: 'created_at', sort_order: 'desc' }) as Promise<PaginatedProjects>,
    enabled: !!user,
  });

  const { data: bidsData } = useQuery<PaginatedBids>({
    queryKey: ['dashboard-bids', user?.id],
    queryFn: () => bidService.list('', { page_size: 5 }) as Promise<PaginatedBids>,
    enabled: !!user && isFreelancer,
  });

  const { data: messagesData } = useQuery<PaginatedMessages>({
    queryKey: ['dashboard-messages', user?.id],
    queryFn: () => messageService.list('', { page_size: 5 }) as Promise<PaginatedMessages>,
    enabled: !!user,
  });

  const { data: balance } = useQuery<Balance>({
    queryKey: ['dashboard-balance', user?.id],
    queryFn: () => balanceService.get() as Promise<Balance>,
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
      started_at: null,
      completed_at: null,
    },
  ];

  const mockBids: (Bid & { project?: Project })[] = [
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

  const mockMessages: Message[] = [
    {
      id: 1,
      uuid: 'msg-1',
      project_id: 1,
      sender_id: 2,
      recipient_id: 1,
      content: 'Hi, I\'m interested in your project. When would be a good time to discuss?',
      message_type: 'text' as MessageType,
      attachments: [],
      is_read: false,
      read_at: null,
      reply_to_id: null,
      sender: { id: 2, uuid: 'user-2', email: 'sarah@example.com', full_name: 'Sarah Johnson', avatar_url: null, bio: null, location: null, website: null, skills: [], hourly_rate: null, availability: '', role: 'client', plan: 'starter', is_active: true, is_verified: true, rating: 0, reviews_count: 0, completed_projects: 0, balance_cents: 0, pending_balance_cents: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), last_login_at: null },
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const displayProjects = projectsData?.items || (isClient ? mockProjects : []);
  const displayBids = bidsData?.items || (isFreelancer ? mockBids : []);
  const displayMessages = messagesData?.items || mockMessages;
  const displayBalance = balance ?? { balance_cents: 250000, pending_balance_cents: 50000 };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[var(--color-text)]">
            Welcome back, {user.full_name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="mt-1 text-[var(--color-text-muted)]">
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard
          title="Active Projects"
          value={isClient ? displayProjects.length : displayBids.filter((b: Bid) => b.status === 'accepted').length}
          icon={CubeIcon}
          color="primary"
          href="/projects"
        />
        <StatCard
          title="Pending Bids"
          value={isFreelancer ? displayBids.filter((b: Bid) => b.status === 'pending').length : displayProjects.reduce((acc: number, p: Project) => acc + p.bids_count, 0)}
          icon={CheckCircleIcon}
          color="warning"
          href="/projects"
        />
        <StatCard
          title="Unread Messages"
          value={displayMessages.filter((m: Message) => !m.is_read).length}
          icon={ChatBubbleLeftRightIcon}
          color="success"
          href="/projects"
        />
        <StatCard
          title="Available Balance"
          value={`$${(displayBalance.balance_cents / 100).toLocaleString()}`}
          icon={CurrencyDollarIcon}
          color="danger"
          href="/balance"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Projects */}
        <div className="lg:col-span-2 space-y-8">
          {/* My Projects */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-[var(--color-text)]">
                  {isClient ? 'My Projects' : 'Recommended Projects'}
                </h2>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {isClient ? `${displayProjects.length} project(s)` : 'Based on your skills'}
                </p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/projects">View All</Link>
              </Button>
            </div>
            {projectsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse h-64" />
                ))}
              </div>
            ) : displayProjects.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {displayProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[var(--color-surface-muted)] flex items-center justify-center mx-auto mb-4">
                  {isClient ? <CubeIcon className="w-8 h-8 text-[var(--color-text-subtle)]" /> : <MagnifyingGlassIcon className="w-8 h-8 text-[var(--color-text-subtle)]" />}
                </div>
                <h3 className="text-lg font-medium text-[var(--color-text)] mb-1">
                  {isClient ? 'No projects yet' : 'No matching projects'}
                </h3>
                <p className="text-[var(--color-text-muted)] mb-4">
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-[var(--color-text)]">
                  {isFreelancer ? 'Recent Bids' : 'Recent Messages'}
                </h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/projects">View All</Link>
                </Button>
              </div>
              <div className="space-y-3">
                {isFreelancer ? (
                  displayBids.slice(0, 3).map((bid) => <BidCard key={bid.id} bid={bid} />)
                ) : (
                  displayMessages.slice(0, 3).map((message) => <MessageCard key={message.id} message={message} />)
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Quick Actions & Info */}
        <div className="space-y-6">
          {/* Balance Card */}
          <Card>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[var(--color-text)]">Balance</h3>
              <p className="text-sm text-[var(--color-text-muted)]">Available to withdraw</p>
            </div>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-[var(--color-text)]">${(displayBalance.balance_cents / 100).toLocaleString()}</p>
                <p className="text-sm text-[var(--color-text-muted)]">Available</p>
              </div>
              {displayBalance.pending_balance_cents > 0 && (
                <div className="text-center">
                  <p className="text-xl font-medium text-[var(--color-warning)]">${(displayBalance.pending_balance_cents / 100).toLocaleString()}</p>
                  <p className="text-sm text-[var(--color-text-muted)]">Pending</p>
                </div>
              )}
              <div className="pt-4 border-t border-[var(--color-border)] space-y-2">
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
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" fullWidth leftIcon={<PlusIcon className="w-4 h-4" />} asChild>
                <Link to="/projects/create">Post a New Project</Link>
              </Button>
              <Button variant="outline" fullWidth leftIcon={<MagnifyingGlassIcon className="w-4 h-4" />} asChild>
                <Link to="/projects">Browse Projects</Link>
              </Button>
              <Button variant="outline" fullWidth leftIcon={<ChatBubbleLeftRightIcon className="w-4 h-4" />} asChild>
                <Link to="/projects">Check Messages</Link>
              </Button>
              <Button variant="outline" fullWidth leftIcon={<CurrencyDollarIcon className="w-4 h-4" />} asChild>
                <Link to="/balance">Manage Balance</Link>
              </Button>
            </div>
          </Card>

          {/* Plan Info */}
          <Card>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-[var(--color-text)]">Your Plan</h3>
              <p className="text-sm text-[var(--color-text-muted)] capitalize">{user.plan}</p>
            </div>
            <div className="space-y-3">
              <Badge variant={user.plan === 'starter' ? 'secondary' : 'primary'} className="w-full justify-center">
                {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)} Plan
              </Badge>
              <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-[var(--color-success)]" />
                  {user.plan === 'starter' ? '5 bids/week' : user.plan === 'pro' ? '50 bids/week' : 'Unlimited bids'}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-[var(--color-success)]" />
                  {user.plan !== 'starter' && 'AI-powered tools'}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-[var(--color-success)]" />
                  {user.plan === 'starter' ? '5% platform fee' : user.plan === 'pro' ? '3% platform fee' : '1% platform fee'}
                </li>
              </ul>
              {user.plan !== 'agency' && (
                <Button variant="outline" fullWidth size="sm" asChild>
                  <Link to="/projects">Upgrade Plan</Link>
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}