import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import {
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { projectService, bidService, messageService, balanceService } from '@/services/api';
import { Project, Bid, Message } from '@/types';
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

interface ActivityItem {
  id: string;
  type: 'project' | 'bid' | 'message' | 'payment';
  timestamp: string;
  title: string;
  description: string;
  metadata?: {
    amount?: number;
    status?: string;
    projectTitle?: string;
  };
}

function StatRow({ label, value, href, icon: Icon }: {
  label: string;
  value: string | number;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center justify-between py-6 border-b border-[rgba(255,255,255,0.08)] last:border-0 transition-colors duration-200 group">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center">
          <Icon className="w-6 h-6 text-[var(--color-text-muted)]" />
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--color-text-muted)] tracking-wide uppercase">{label}</p>
          <p className="font-mono text-xl font-medium text-[var(--color-text)] tabular-nums">{value}</p>
        </div>
      </div>
      {href && (
        <Link
          to={href}
          className="flex items-center gap-1.5 text-sm text-[var(--color-text-subtle)] hover:text-[var(--color-accent)] transition-colors opacity-0 group-hover:opacity-100"
        >
          View
          <ArrowRightIcon className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

function ActivityRow({
  item,
  isHovered,
  onHover,
  onLeave,
}: {
  item: ActivityItem;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  const typeIcons = {
    project: CubeIcon,
    bid: CheckCircleIcon,
    message: ChatBubbleLeftRightIcon,
    payment: CurrencyDollarIcon,
  };

  const Icon = typeIcons[item.type];

  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`flex items-start gap-4 py-6 border-b border-[rgba(255,255,255,0.08)] last:border-0 transition-all duration-300 ${
        isHovered
          ? 'bg-[var(--glass-bg)] border-l-4 border-l-[var(--color-accent)] pl-6 -ml-6'
          : ''
      }`}
    >
      <div className="w-10 h-10 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center flex-shrink-0 transition-colors duration-200">
        <Icon className="w-5 h-5 text-[var(--color-text-muted)]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-[var(--color-text)]">{item.title}</p>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">{item.description}</p>
          </div>
          <time
            className="font-mono text-xs text-[var(--color-text-subtle)] tabular-nums whitespace-nowrap"
            dateTime={item.timestamp}
          >
            {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
          </time>
        </div>
        {item.metadata && (
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
            {item.metadata.amount && (
              <span className="font-mono text-[var(--color-accent)] tabular-nums">
                {item.metadata.amount > 0 ? '+' : ''}${(item.metadata.amount / 100).toLocaleString()}
              </span>
            )}
            {item.metadata.status && (
              <span className="text-[var(--color-text-subtle)] capitalize">{item.metadata.status.replace('_', ' ')}</span>
            )}
            {item.metadata.projectTitle && (
              <span className="text-[var(--color-text-subtle)]">{item.metadata.projectTitle}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ActivityList({ activities, hoveredId, onHover, onLeave }: {
  activities: ActivityItem[];
  hoveredId: string | null;
  onHover: (id: string) => void;
  onLeave: () => void;
}) {
  return (
    <div className="space-y-0">
      {activities.map((activity) => (
        <ActivityRow
          key={activity.id}
          item={activity}
          isHovered={hoveredId === activity.id}
          onHover={() => onHover(activity.id)}
          onLeave={onLeave}
        />
      ))}
      {activities.length === 0 && (
        <div className="py-12 text-center text-[var(--color-text-muted)]">
          No recent activity
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, title, description, action }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: { label: string; href: string; variant?: 'primary' | 'outline' };
}) {
  return (
    <div className="py-16 text-center border border-[var(--glass-border)] rounded-2xl bg-[var(--glass-bg)]">
      <div className="w-16 h-16 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center mx-auto mb-6">
        <Icon className="w-8 h-8 text-[var(--color-text-subtle)]" />
      </div>
      <h3 className="text-lg font-medium text-[var(--color-text)] mb-2">{title}</h3>
      <p className="text-[var(--color-text-muted)] mb-6 max-w-sm mx-auto">{description}</p>
      {action && (
        <Button asChild variant={action.variant || 'primary'} size="lg">
          <Link to={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const isFreelancer = user?.role === 'freelancer';
  const isClient = user?.role === 'client';

  // Fetch data
  const { data: projectsData } = useQuery<PaginatedProjects>({
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

  // Build activity feed from real data
  const activities: ActivityItem[] = [];

  // Add recent projects
  projectsData?.items.slice(0, 3).forEach((project) => {
    activities.push({
      id: `project-${project.id}`,
      type: 'project',
      timestamp: project.created_at,
      title: isClient ? 'Project created' : 'Project published',
      description: project.title,
      metadata: {
        projectTitle: project.title,
        status: project.status,
      },
    });
  });

  // Add recent bids
  if (isFreelancer) {
    bidsData?.items.slice(0, 3).forEach((bid) => {
      activities.push({
        id: `bid-${bid.id}`,
        type: 'bid',
        timestamp: bid.created_at,
        title: 'Bid submitted',
        description: bid.project?.title || 'Project',
        metadata: {
          amount: bid.amount_cents,
          status: bid.status,
          projectTitle: bid.project?.title,
        },
      });
    });
  } else {
    // Client sees bids on their projects
    projectsData?.items.forEach((project) => {
      if (project.bids_count > 0) {
        activities.push({
          id: `bids-${project.id}`,
          type: 'bid',
          timestamp: project.updated_at,
          title: 'New bids received',
          description: project.title,
          metadata: {
            status: `${project.bids_count} bids`,
            projectTitle: project.title,
          },
        });
      }
    });
  }

  // Add recent messages
  messagesData?.items.slice(0, 3).forEach((message) => {
    activities.push({
      id: `message-${message.id}`,
      type: 'message',
      timestamp: message.created_at,
      title: 'New message',
      description: message.sender?.full_name || 'Someone',
      metadata: {
        projectTitle: message.project?.title,
      },
    });
  });

  // Sort by timestamp descending
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const displayBalance = balance ?? { balance_cents: 0, pending_balance_cents: 0 };
  const activeProjectsCount = isClient
    ? projectsData?.items.filter((p) => p.status === 'in_progress' || p.status === 'open').length || 0
    : bidsData?.items.filter((b: Bid) => b.status === 'accepted').length || 0;
  const pendingBidsCount = isFreelancer
    ? bidsData?.items.filter((b: Bid) => b.status === 'pending').length || 0
    : projectsData?.items.reduce((acc: number, p: Project) => acc + p.bids_count, 0) || 0;
  const unreadMessagesCount = messagesData?.items.filter((m: Message) => !m.is_read).length || 0;

  const [hoveredActivityId, setHoveredActivityId] = useState<string | null>(null);

  return (
    <div className="space-y-24 lg:space-y-32">
      {/* Welcome Header */}
      <section className="pt-8 lg:pt-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h1 className="text-headline-1 text-balance">
              Welcome back, <span className="text-[var(--color-accent)]">{user.full_name?.split(' ')[0] || 'there'}</span>
            </h1>
            <p className="mt-3 text-body-lg text-[var(--color-text-muted)] max-w-xl">
              {isFreelancer
                ? 'Track your bids, messages, and project activity in one place.'
                : 'Overview of your projects, incoming bids, and conversations.'}
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {isFreelancer && (
              <Button asChild size="lg">
                <Link to="/projects/create">
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Post a Project
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild size="lg">
              <Link to="/projects">
                <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                Browse Projects
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-t border-[rgba(255,255,255,0.08)] pt-24 lg:pt-32">
        <h2 className="text-headline-4 mb-12 lg:mb-16">Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          <StatRow
            label="Active Projects"
            value={activeProjectsCount}
            icon={CubeIcon}
            href="/projects"
          />
          <StatRow
            label="Pending Bids"
            value={pendingBidsCount}
            icon={CheckCircleIcon}
            href="/projects"
          />
          <StatRow
            label="Unread Messages"
            value={unreadMessagesCount}
            icon={ChatBubbleLeftRightIcon}
            href="/projects"
          />
          <StatRow
            label="Available Balance"
            value={`$${(displayBalance.balance_cents / 100).toLocaleString()}`}
            icon={CurrencyDollarIcon}
            href="/balance"
          />
        </div>
      </section>

      {/* Activity Feed Section */}
      <section className="border-t border-[rgba(255,255,255,0.08)] pt-24 lg:pt-32">
        <div className="flex items-center justify-between mb-12 lg:mb-16">
          <h2 className="text-headline-4">Recent Activity</h2>
          <Button variant="ghost" asChild size="sm">
            <Link to="/projects">View all</Link>
          </Button>
        </div>

        <div className="border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden bg-[var(--glass-bg)]">
          <ActivityList
            activities={activities.slice(0, 10)}
            hoveredId={hoveredActivityId}
            onHover={setHoveredActivityId}
            onLeave={() => setHoveredActivityId(null)}
          />
        </div>

        {activities.length === 0 && (
          <EmptyState
            icon={CubeIcon}
            title="No activity yet"
            description={isClient
              ? 'Create your first project to start receiving bids and messages.'
              : 'Browse projects and submit bids to see activity here.'}
            action={{
              label: isClient ? 'Create Project' : 'Browse Projects',
              href: isClient ? '/projects/create' : '/projects',
              variant: isClient ? 'primary' : 'outline',
            }}
          />
        )}
      </section>

      {/* Quick Actions Section */}
      <section className="border-t border-[rgba(255,255,255,0.08)] pt-24 lg:pt-32">
        <h2 className="text-headline-4 mb-12 lg:mb-16">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Button variant="outline" fullWidth asChild size="lg" className="py-6">
            <Link to="/projects/create">
              <PlusIcon className="w-6 h-6 mr-3" />
              <span className="font-medium">Post a Project</span>
            </Link>
          </Button>
          <Button variant="outline" fullWidth asChild size="lg" className="py-6">
            <Link to="/projects">
              <MagnifyingGlassIcon className="w-6 h-6 mr-3" />
              <span className="font-medium">Browse Projects</span>
            </Link>
          </Button>
          <Button variant="outline" fullWidth asChild size="lg" className="py-6">
            <Link to="/projects">
              <ChatBubbleLeftRightIcon className="w-6 h-6 mr-3" />
              <span className="font-medium">Messages</span>
            </Link>
          </Button>
          <Button variant="outline" fullWidth asChild size="lg" className="py-6">
            <Link to="/balance">
              <CurrencyDollarIcon className="w-6 h-6 mr-3" />
              <span className="font-medium">Balance</span>
            </Link>
          </Button>
        </div>
      </section>

      {/* Plan Info Section */}
      <section className="border-t border-[rgba(255,255,255,0.08)] pt-24 lg:pt-32 pb-8 lg:pb-12">
        <h2 className="text-headline-4 mb-12 lg:mb-16">Your Plan</h2>
        <div className="max-w-2xl">
          <div className="border border-[rgba(255,255,255,0.08)] rounded-2xl bg-[var(--glass-bg)] p-8 lg:p-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-muted)] tracking-wide uppercase">Current Plan</p>
                <p className="mt-1 font-mono text-3xl font-bold text-[var(--color-text)] tabular-nums capitalize">{user.plan}</p>
              </div>
              {user.plan !== 'agency' && (
                <Button variant="outline" asChild size="lg" className="whitespace-nowrap">
                  <Link to="/billing">Upgrade Plan</Link>
                </Button>
              )}
            </div>
            <div className="border-t border-[rgba(255,255,255,0.08)] pt-8">
              <ul className="space-y-4">
                <li className="flex items-center gap-4">
                  <CheckCircleIcon className="w-5 h-5 text-[var(--color-accent)] flex-shrink-0" />
                  <span className="text-[var(--color-text-muted)]">
                    {user.plan === 'starter' ? '5 bids per week' : user.plan === 'pro' ? '50 bids per week' : 'Unlimited bids'}
                  </span>
                </li>
                <li className="flex items-center gap-4">
                  {user.plan !== 'starter' && (
                    <>
                      <CheckCircleIcon className="w-5 h-5 text-[var(--color-accent)] flex-shrink-0" />
                      <span className="text-[var(--color-text-muted)]">AI-powered tools</span>
                    </>
                  )}
                  {user.plan === 'starter' && (
                    <>
                      <span className="w-5 h-5 flex-shrink-0" />
                      <span className="text-[var(--color-text-subtle)]">AI-powered tools (Pro+)</span>
                    </>
                  )}
                </li>
                <li className="flex items-center gap-4">
                  <CheckCircleIcon className="w-5 h-5 text-[var(--color-accent)] flex-shrink-0" />
                  <span className="text-[var(--color-text-muted)]">
                    {user.plan === 'starter' ? '5% platform fee' : user.plan === 'pro' ? '3% platform fee' : '1% platform fee'}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}