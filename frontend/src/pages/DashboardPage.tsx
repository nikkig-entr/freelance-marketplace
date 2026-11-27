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
    <div className="border border-white/15 p-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 border border-white/15 flex items-center justify-center flex-shrink-0">
          <Icon className="w-6 h-6 text-[var(--color-text-muted)]" />
        </div>
        <div className="min-w-0">
          <p className="font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">{label}</p>
          <p className="font-heading font-bold text-[var(--color-text)] text-2xl tabular-nums truncate">{value}</p>
        </div>
      </div>
      {href && (
        <Link
          to={href}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-mono text-[var(--color-text-subtle)] hover:text-[var(--color-white)] transition-colors"
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
      className={`flex items-start gap-4 py-4 border-b border-white/15 last:border-0 transition-all duration-300 ${isHovered ? 'bg-white/5' : ''}`}
    >
      <div className="w-10 h-10 border border-white/15 flex items-center justify-center flex-shrink-0 transition-colors duration-200 min-w-[44px] min-h-[44px]">
        <Icon className="w-5 h-5 text-[var(--color-text-muted)]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <p className="font-medium text-[var(--color-text)] truncate">{item.title}</p>
            <p className="mt-1 text-sm text-[var(--color-text-muted)] truncate">{item.description}</p>
          </div>
          <time
            className="font-mono text-xs text-[var(--color-text-subtle)] tabular-nums whitespace-nowrap flex-shrink-0"
            dateTime={item.timestamp}
          >
            {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
          </time>
        </div>
        {item.metadata && (
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
            {item.metadata.amount && (
              <span className="font-mono text-[var(--color-text)] tabular-nums">
                {item.metadata.amount > 0 ? '+' : ''}${(item.metadata.amount / 100).toLocaleString()}
              </span>
            )}
            {item.metadata.status && (
              <span className="text-[var(--color-text-subtle)] capitalize">{item.metadata.status.replace('_', ' ')}</span>
            )}
            {item.metadata.projectTitle && (
              <span className="text-[var(--color-text-subtle)] truncate max-w-xs">{item.metadata.projectTitle}</span>
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
    <div className="py-16 text-center border border-white/15 p-6">
      <div className="w-16 h-16 border border-white/15 flex items-center justify-center mx-auto mb-6">
        <Icon className="w-8 h-8 text-[var(--color-text-subtle)]" />
      </div>
      <h3 className="font-heading font-medium text-[var(--color-text)] mb-2">{title}</h3>
      <p className="text-[var(--color-text-muted)] mb-6 max-w-sm mx-auto">{description}</p>
      {action && (
        <Button asChild variant={action.variant || 'primary'} size="lg" className="border border-white px-4 py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black min-h-[56px]">
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
  const [hoveredActivityId, setHoveredActivityId] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="container py-6 lg:py-8 space-y-10 lg:space-y-16">
        {/* Welcome Header */}
        <section className="pt-4 lg:pt-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 lg:gap-6">
            <div>
              <h1 className="font-heading font-bold text-[var(--color-text)] text-[clamp(1.75rem,3.5vw,2.5rem)] tracking-tight">
                Welcome back, <span className="text-[var(--color-white)]">{user.full_name?.split(' ')[0] || 'there'}</span>
              </h1>
              <p className="mt-2 text-[var(--color-text-muted)] max-w-xl font-[Instrument_Serif] italic text-sm lg:text-base">
                {isFreelancer
                  ? 'Track your bids, messages, and project activity in one place.'
                  : 'Overview of your projects, incoming bids, and conversations.'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap w-full sm:w-auto">
              {isFreelancer && (
                <Button asChild size="lg" className="border border-white px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black min-h-[56px] w-full sm:w-auto">
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Post a Project
                </Button>
              )}
              <Button variant="secondary" asChild size="lg" className="border border-white/15 px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white/10 min-h-[56px] w-full sm:w-auto">
                <Link to="/projects">
                  <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                  Browse Projects
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section - Grid stacks on mobile */}
        <section>
          <h2 className="font-heading font-semibold text-[var(--color-text)] text-[clamp(1.25rem,2.5vw,1.75rem)] mb-6 border-b border-white/15 pb-3">Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
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
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="font-heading font-semibold text-[var(--color-text)] text-[clamp(1.25rem,2.5vw,1.75rem)] border-b border-white/15 pb-3">Recent Activity</h2>
            <Button variant="ghost" asChild size="sm" className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-text-subtle)] hover:text-[var(--color-white)] min-h-[44px]">
              <Link to="/projects">View all</Link>
            </Button>
          </div>

          <div className="border border-white/15 overflow-hidden">
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

        {/* Quick Actions Section - Grid stacks on mobile */}
        <section>
          <h2 className="font-heading font-semibold text-[var(--color-text)] text-[clamp(1.25rem,2.5vw,1.75rem)] mb-6 border-b border-white/15 pb-3">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <Button variant="secondary" fullWidth asChild size="lg" className="py-5 border border-white/15 px-4 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white/10 min-h-[56px]">
              <Link to="/projects/create">
                <PlusIcon className="w-6 h-6 mr-3" />
                <span className="font-medium">Post a Project</span>
              </Link>
            </Button>
            <Button variant="secondary" fullWidth asChild size="lg" className="py-5 border border-white/15 px-4 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white/10 min-h-[56px]">
              <Link to="/projects">
                <MagnifyingGlassIcon className="w-6 h-6 mr-3" />
                <span className="font-medium">Browse Projects</span>
              </Link>
            </Button>
            <Button variant="secondary" fullWidth asChild size="lg" className="py-5 border border-white/15 px-4 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white/10 min-h-[56px]">
              <Link to="/projects">
                <ChatBubbleLeftRightIcon className="w-6 h-6 mr-3" />
                <span className="font-medium">Messages</span>
              </Link>
            </Button>
            <Button variant="secondary" fullWidth asChild size="lg" className="py-5 border border-white/15 px-4 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white/10 min-h-[56px]">
              <Link to="/balance">
                <CurrencyDollarIcon className="w-6 h-6 mr-3" />
                <span className="font-medium">Balance</span>
              </Link>
            </Button>
          </div>
        </section>

        {/* Plan Info Section */}
        <section className="pb-6 lg:pb-10">
          <h2 className="font-heading font-semibold text-[var(--color-text)] text-[clamp(1.25rem,2.5vw,1.75rem)] mb-6 border-b border-white/15 pb-3">Your Plan</h2>
          <div className="max-w-2xl">
            <div className="border border-white/15 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <p className="font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Current Plan</p>
                  <p className="mt-1 font-heading font-bold text-[var(--color-text)] text-2xl lg:text-3xl tabular-nums capitalize">{user.plan}</p>
                </div>
                {user.plan !== 'agency' && (
                  <Button variant="secondary" asChild size="lg" className="whitespace-nowrap border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white/10 min-h-[48px]">
                    <Link to="/billing">Upgrade Plan</Link>
                  </Button>
                )}
              </div>
              <div className="border-t border-white/15 pt-6">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-[var(--color-white)] flex-shrink-0" />
                    <span className="text-[var(--color-text-muted)]">
                      {user.plan === 'starter' ? '5 bids per week' : user.plan === 'pro' ? '50 bids per week' : 'Unlimited bids'}
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    {user.plan !== 'starter' && (
                      <>
                        <CheckCircleIcon className="w-5 h-5 text-[var(--color-white)] flex-shrink-0" />
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
                  <li className="flex items-center gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-[var(--color-white)] flex-shrink-0" />
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
    </div>
  );
}