'use client';

import { useState, useEffect } from 'react';
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
    <div className="border border-[var(--color-border)] p-6 min-h-[120px] bg-[var(--color-surface)] transition-all duration-300 hover:border-[var(--color-white)]/40 hover:bg-[var(--color-bg)]">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 border border-[var(--color-border)] flex items-center justify-center flex-shrink-0 min-h-[44px] min-w-[44px]">
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
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-mono text-[var(--color-text-subtle)] hover:text-[var(--color-white)] transition-colors min-h-[44px]"
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
      className={`flex items-start gap-4 py-4 border-b border-[var(--color-border)] last:border-0 transition-all duration-300 ${isHovered ? 'bg-[var(--glass-bg)]' : ''}`}
    >
      <div className="w-10 h-10 border border-[var(--color-border)] flex items-center justify-center flex-shrink-0 transition-colors duration-200 min-w-[44px] min-h-[44px]">
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
    <div className="py-16 text-center border border-[var(--color-border)] p-6 bg-[var(--color-surface)]">
      <div className="w-16 h-16 border border-[var(--color-border)] flex items-center justify-center mx-auto mb-6 min-h-[44px] min-w-[44px]">
        <Icon className="w-8 h-8 text-[var(--color-text-subtle)]" />
      </div>
      <h3 className="font-heading font-medium text-[var(--color-text)] mb-2">{title}</h3>
      <p className="text-[var(--color-text-muted)] mb-6 max-w-sm mx-auto">{description}</p>
      {action && (
        <Link
          to={action.href}
          className={`inline-flex items-center justify-center gap-2 min-h-[56px] px-4 py-3 font-mono text-xs uppercase tracking-[0.2em] border transition-all duration-300 ${action.variant === 'primary' ? 'bg-[var(--color-white)] text-[var(--color-bg)] border-[var(--color-white)] hover:bg-[var(--color-white)]/90' : 'text-[var(--color-text)] border-[var(--color-border)] hover:bg-[var(--glass-bg)] hover:border-[var(--color-border-hover)]'}`}
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

function QuickActionButton({ icon: Icon, label, href }: { icon: React.ComponentType<{ className?: string }>; label: string; href: string }) {
  return (
    <Link
      to={href}
      className="flex items-center gap-3 py-5 border border-[var(--color-border)] px-4 font-mono text-xs uppercase tracking-[0.2em] hover:bg-[var(--glass-bg)] hover:border-[var(--color-border-hover)] transition-all duration-300 min-h-[56px] bg-[var(--color-surface)]"
    >
      <Icon className="w-6 h-6 text-[var(--color-text-muted)] flex-shrink-0" />
      <span className="font-medium text-[var(--color-text)]">{label}</span>
    </Link>
  );
}

function PlanFeature({ icon: Icon, label, enabled }: { icon: React.ComponentType<{ className?: string }>; label: string; enabled: boolean }) {
  return (
    <li className="flex items-center gap-3 min-h-[44px]">
      {enabled ? (
        <Icon className="w-5 h-5 text-[var(--color-white)] flex-shrink-0 min-w-[20px] min-h-[20px]" />
      ) : (
        <span className="w-5 h-5 flex-shrink-0 min-w-[20px] min-h-[20px]" />
      )}
      <span className={enabled ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text-subtle)]'}>
        {label}
      </span>
    </li>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const isFreelancer = user?.role === 'freelancer';
  const isClient = user?.role === 'client';
  const [hoveredActivityId, setHoveredActivityId] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

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

  // Plan features based on user plan
  const planFeatures = {
    starter: {
      bids: '5 bids per week',
      aiTools: false,
      fee: '5% platform fee',
    },
    pro: {
      bids: '50 bids per week',
      aiTools: true,
      fee: '3% platform fee',
    },
    agency: {
      bids: 'Unlimited bids',
      aiTools: true,
      fee: '1% platform fee',
    },
  };

  const currentPlan = planFeatures[user.plan as keyof typeof planFeatures] || planFeatures.starter;

  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="container py-6 lg:py-8 space-y-10 lg:space-y-16">
        {/* Welcome Header */}
        <section className="pt-4 lg:pt-8"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 lg:gap-6">
            <div>
              <h1 className="font-heading font-extrabold text-[var(--color-white)] uppercase tracking-[-0.03em] leading-[0.92] text-[clamp(2.2rem,5.8vw,6rem)] break-words max-w-full mb-4">
                <span>Welcome</span>
                <br />
                <span>back</span>
              </h1>
              <p className="mt-2 text-[var(--color-text-muted)] max-w-xl font-editorial italic text-sm lg:text-base">
                {isFreelancer
                  ? 'Track your bids, messages, and project activity in one place.'
                  : 'Overview of your projects, incoming bids, and conversations.'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap w-full sm:w-auto">
              {isFreelancer && (
                <Link
                  to="/projects/create"
                  className="inline-flex items-center justify-center gap-2 min-h-[56px] px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] border-2 border-[var(--color-white)] text-[var(--color-white)] hover:bg-[var(--color-white)] hover:text-[var(--color-bg)] transition-all duration-300 w-full sm:w-auto"
                >
                  <PlusIcon className="w-5 h-5" />
                  Post a Project
                </Link>
              )}
              <Link
                to="/projects"
                className="inline-flex items-center justify-center gap-2 min-h-[56px] px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--glass-bg)] hover:border-[var(--color-border-hover)] transition-all duration-300 w-full sm:w-auto"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
                Browse Projects
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section - Single-column on mobile, min 44px touch targets */}
        <section
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
          }}
        >
          <h2 className="font-heading font-semibold text-[var(--color-text)] text-[clamp(1.25rem,2.5vw,1.75rem)] mb-6 border-b border-[var(--color-border)] pb-3">Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <StatRow label="Active Projects" value={activeProjectsCount} icon={CubeIcon} href="/projects" />
            <StatRow label="Pending Bids" value={pendingBidsCount} icon={CheckCircleIcon} href="/projects" />
            <StatRow label="Unread Messages" value={unreadMessagesCount} icon={ChatBubbleLeftRightIcon} href="/projects" />
            <StatRow label="Available Balance" value={`$${(displayBalance.balance_cents / 100).toLocaleString()}`} icon={CurrencyDollarIcon} href="/balance" />
          </div>
        </section>

        {/* Activity Feed Section */}
        <section
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="font-heading font-semibold text-[var(--color-text)] text-[clamp(1.25rem,2.5vw,1.75rem)] border-b border-[var(--color-border)] pb-3">Recent Activity</h2>
            <Link
              to="/projects"
              className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-text-subtle)] hover:text-[var(--color-white)] transition-colors min-h-[44px] flex items-center"
            >
              View all
              <ArrowRightIcon className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="border border-[var(--color-border)] overflow-hidden overflow-x-auto bg-[var(--color-surface)]">
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
        <section
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s',
          }}
        >
          <h2 className="font-heading font-semibold text-[var(--color-text)] text-[clamp(1.25rem,2.5vw,1.75rem)] mb-6 border-b border-[var(--color-border)] pb-3">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <QuickActionButton icon={PlusIcon} label="Post a Project" href="/projects/create" />
            <QuickActionButton icon={MagnifyingGlassIcon} label="Browse Projects" href="/projects" />
            <QuickActionButton icon={ChatBubbleLeftRightIcon} label="Messages" href="/projects" />
            <QuickActionButton icon={CurrencyDollarIcon} label="Balance" href="/balance" />
          </div>
        </section>

        {/* Plan Info Section */}
        <section className="pb-6 lg:pb-10"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s',
          }}
        >
          <h2 className="font-heading font-semibold text-[var(--color-text)] text-[clamp(1.25rem,2.5vw,1.75rem)] mb-6 border-b border-[var(--color-border)] pb-3">Your Plan</h2>
          <div className="max-w-2xl">
            <div className="border border-[var(--color-border)] p-6 bg-[var(--color-surface)]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <p className="font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Current Plan</p>
                  <p className="mt-1 font-heading font-bold text-[var(--color-text)] text-2xl lg:text-3xl tabular-nums capitalize">{user.plan}</p>
                </div>
                {user.plan !== 'agency' && (
                  <Link
                    to="/billing"
                    className="inline-flex items-center justify-center min-h-[48px] px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--glass-bg)] hover:border-[var(--color-border-hover)] transition-colors whitespace-nowrap w-full sm:w-auto"
                  >
                    Upgrade Plan
                  </Link>
                )}
              </div>
              <div className="border-t border-[var(--color-border)] pt-6">
                <ul className="space-y-3">
                  <PlanFeature icon={CheckCircleIcon} label={currentPlan.bids} enabled={true} />
                  <PlanFeature icon={CheckCircleIcon} label="AI-powered tools" enabled={currentPlan.aiTools} />
                  <PlanFeature icon={CheckCircleIcon} label={currentPlan.fee} enabled={true} />
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}