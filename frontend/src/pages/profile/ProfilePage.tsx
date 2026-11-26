import { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/contexts/AuthContext';
import { userService, projectService } from '@/services/api';
import { User, Project, Review, formatCurrency, formatDate } from '@/types';
import {
  ArrowLeftIcon,
  StarIcon,
  MapPinIcon,
  GlobeAltIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import toast from 'react-hot-toast';

interface PaginatedProjects {
  items: Project[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

interface ActivityItem {
  id: string;
  type: 'project' | 'review' | 'skill';
  timestamp: string;
  title: string;
  description: string;
  metadata?: {
    rating?: number;
    projectTitle?: string;
  };
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
    project: Briefcase,
    review: StarIcon,
    skill: ShieldCheckIcon,
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
            {formatDate(item.timestamp)}
          </time>
        </div>
        {item.metadata && (
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
            {(() => {
              const rating = item.metadata.rating;
              if (rating !== undefined && rating > 0) {
                return (
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className="w-4 h-4"
                        fill={i < rating ? 'currentColor' : 'none'}
                        stroke="currentColor"
                      />
                    ))}
                  </div>
                );
              }
              return null;
            })()}
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

function EmptyState({ icon: Icon, title, description }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="py-16 text-center border border-[var(--glass-border)] rounded-2xl bg-[var(--glass-bg)]">
      <div className="w-16 h-16 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center mx-auto mb-6">
        <Icon className="w-8 h-8 text-[var(--color-text-subtle)]" />
      </div>
      <h3 className="text-lg font-medium text-[var(--color-text)] mb-2">{title}</h3>
      <p className="text-[var(--color-text-muted)] max-w-sm mx-auto">{description}</p>
    </div>
  );
}

function ProjectCardItem({ project }: { project: Project }) {
  return (
    <Link
      to="/projects"
      className="p-6 border border-[rgba(255,255,255,0.08)] rounded-xl transition-all duration-200 hover:border-[var(--color-accent)]/50 hover:bg-[var(--glass-bg)] group"
    >
      <h4 className="font-semibold text-[var(--color-text)] mb-2 line-clamp-1 group-hover:text-[var(--color-accent)] transition-colors">{project.title}</h4>
      <p className="text-sm text-[var(--color-text-muted)] mb-4 line-clamp-2">{project.description}</p>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {(project.tags || []).slice(0, 3).map((skill) => (
          <span key={skill} className="px-2 py-0.5 text-xs font-mono text-[var(--color-text-subtle)] border border-[rgba(255,255,255,0.1)] rounded">
            {skill}
          </span>
        ))}
        {project.tags && project.tags.length > 3 && (
          <span className="px-2 py-0.5 text-xs font-mono text-[var(--color-text-subtle)] border border-[rgba(255,255,255,0.1)] rounded">
            +{project.tags.length - 3} more
          </span>
        )}
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-mono text-[var(--color-accent)] tabular-nums">
          {project.budget_min ? formatCurrency(project.budget_min) : 'Negotiable'}
        </span>
        <time className="text-[var(--color-text-subtle)]" dateTime={project.completed_at || project.updated_at}>
          {formatDate(project.completed_at || project.updated_at)}
        </time>
      </div>
    </Link>
  );
}

export function ProfilePage() {
  const params = useParams({ from: '/profile/$userId' });
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'portfolio' | 'reviews' | 'activity'>('overview');
  const [showContactModal, setShowContactModal] = useState(false);
  const [hoveredActivityId, setHoveredActivityId] = useState<string | null>(null);

  const userId = parseInt(params.userId);
  const isOwnProfile = currentUser?.id === userId;

  const fetchProfile = useCallback(async () => {
    try {
      const data = await userService.getProfile(userId) as User;
      setProfile(data);
    } catch {
      toast.error('Failed to load profile');
      navigate({ to: '/projects' });
    } finally {
      setIsLoading(false);
    }
  }, [userId, navigate]);

  const fetchPublicProjects = useCallback(async () => {
    try {
      const data = await projectService.list({ freelancer_id: userId, status: 'completed', page_size: 6 }) as PaginatedProjects;
      setProjects(data.items || []);
    } catch {
      console.error('Failed to fetch projects');
    }
  }, [userId]);

  const fetchReviews = useCallback(async () => {
    try {
      // In real app, would fetch reviews for this user
      setReviews([]);
    } catch {
      console.error('Failed to fetch reviews');
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    if (!isOwnProfile) {
      fetchPublicProjects();
      fetchReviews();
    }
  }, [fetchProfile, fetchPublicProjects, fetchReviews, isOwnProfile]);

  const handleHire = () => {
    if (!currentUser) {
      navigate({ to: '/login', search: { redirect: `/profile/${userId}` } });
      return;
    }
    if (currentUser.role !== 'client') {
      toast.error('Only clients can hire freelancers');
      return;
    }
    setShowContactModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 animate-pulse space-y-12 lg:space-y-16">
          <div className="h-48 bg-[var(--color-border)] rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-12 bg-[var(--color-border)] rounded" />
            <div className="h-12 bg-[var(--color-border)] rounded" />
            <div className="h-12 bg-[var(--color-border)] rounded" />
          </div>
          <div className="h-64 bg-[var(--color-border)] rounded-xl" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center py-16 lg:py-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[var(--color-text)]">Profile not found</h2>
          <Link to="/projects" className="inline-block mt-6">
            <Button variant="primary">Browse Projects</Button>
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: ShieldCheckIcon },
    { id: 'portfolio' as const, label: 'Portfolio', icon: Briefcase },
    { id: 'reviews' as const, label: 'Reviews', icon: StarIcon },
    { id: 'activity' as const, label: 'Activity', icon: CalendarDaysIcon },
  ];

  // Build activity feed
  const activities: ActivityItem[] = [];

  // Add completed projects as activity
  projects.forEach((project) => {
    activities.push({
      id: `project-${project.id}`,
      type: 'project',
      timestamp: project.completed_at || project.updated_at,
      title: 'Project completed',
      description: project.title,
      metadata: {
        projectTitle: project.title,
      },
    });
  });

  // Add reviews as activity
  reviews.forEach((review) => {
    activities.push({
      id: `review-${review.id}`,
      type: 'review',
      timestamp: review.created_at,
      title: 'Received a review',
      description: `From ${review.reviewer?.full_name || 'a client'}`,
      metadata: {
        rating: review.rating,
        projectTitle: review.project?.title,
      },
    });
  });

  // Add skills as activity (when they were added - using created_at as placeholder)
  if (profile.skills && profile.skills.length > 0) {
    profile.skills.slice(0, 5).forEach((skill, index) => {
      activities.push({
        id: `skill-${skill}-${index}`,
        type: 'skill',
        timestamp: profile.created_at,
        title: 'Skill added',
        description: skill,
      });
    });
  }

  // Sort by timestamp descending
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <header className="bg-gradient-to-b from-[var(--color-accent)] to-[var(--color-accent-hover)] text-white relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5" aria-hidden="true">
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)"/>
          </svg>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative z-10">
          <div className="flex items-start gap-4 mb-8 lg:mb-12">
            <Link to="/projects" className="text-white/70 hover:text-white transition-colors shrink-0">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{profile.full_name || 'Unnamed User'}</h1>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white border border-white/30 backdrop-blur-sm">
                  {profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1)}
                </span>
                {profile.is_verified && (
                  <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                    <ShieldCheckIcon className="w-4 h-4" />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-white/70 text-lg font-mono">@{profile.email?.split('@')[0] || 'user'}</p>
            </div>
            {!isOwnProfile && profile.role === 'freelancer' && (
              <Button
                variant="outline"
                className="bg-white text-[var(--color-accent)] hover:bg-white/90 px-6 py-3 whitespace-nowrap shrink-0"
                onClick={handleHire}
              >
                Hire Now
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            <div className="bg-white/10 rounded-xl p-5 lg:p-6 backdrop-blur-sm border border-white/10">
              <p className="text-white/60 text-sm font-medium tracking-wide uppercase">Rating</p>
              <p className="mt-1 text-3xl sm:text-4xl font-bold flex items-center gap-1.5">
                {profile.rating || 0} <StarIcon className="w-6 h-6" />
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-5 lg:p-6 backdrop-blur-sm border border-white/10">
              <p className="text-white/60 text-sm font-medium tracking-wide uppercase">Reviews</p>
              <p className="mt-1 text-3xl sm:text-4xl font-bold font-mono tabular-nums">{profile.reviews_count || 0}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-5 lg:p-6 backdrop-blur-sm border border-white/10">
              <p className="text-white/60 text-sm font-medium tracking-wide uppercase">Completed</p>
              <p className="mt-1 text-3xl sm:text-4xl font-bold font-mono tabular-nums">{profile.completed_projects || 0}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-5 lg:p-6 backdrop-blur-sm border border-white/10">
              <p className="text-white/60 text-sm font-medium tracking-wide uppercase">Member Since</p>
              <p className="mt-1 text-xl sm:text-2xl font-bold font-mono tabular-nums">{formatDate(profile.created_at).split(' ').slice(1).join(' ')}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 -mt-8 lg:-mt-12 relative z-10">
        {/* Profile Card */}
        <Card variant="default" padding="lg" className="mb-12 lg:mb-16">
          <div className="flex flex-col md:flex-row md:items-start gap-8">
            <div className="w-28 h-28 rounded-full bg-[var(--color-accent-muted)] flex items-center justify-center flex-shrink-0 overflow-hidden border border-[var(--glass-border)]">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <UserCircleIcon className="w-16 h-16 text-[var(--color-accent)]" />
              )}
            </div>
            <div className="flex-1 md:flex md:items-center md:justify-between">
              <div>
                {profile.bio && (
                  <p className="text-body-lg text-[var(--color-text-muted)] mb-6 max-w-2xl">{profile.bio}</p>
                )}
                <div className="flex flex-wrap items-center gap-4 lg:gap-6 text-sm text-[var(--color-text-muted)]">
                  {profile.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPinIcon className="w-4 h-4" />
                      {profile.location}
                    </span>
                  )}
                  {profile.website && (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[var(--color-accent)] transition-colors">
                      <GlobeAltIcon className="w-4 h-4" />
                      Website
                    </a>
                  )}
                  {profile.hourly_rate && (
                    <span className="flex items-center gap-1.5">
                      <CurrencyDollarIcon className="w-4 h-4" />
                      <span className="font-mono tabular-nums">${profile.hourly_rate}/hr</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <CalendarDaysIcon className="w-4 h-4" />
                    Joined {formatDate(profile.created_at)}
                  </span>
                </div>
              </div>
              {isOwnProfile && (
                <Button variant="outline" asChild size="lg" className="whitespace-nowrap mt-4 md:mt-0 md:ml-8">
                  <Link to="/settings">Edit Profile</Link>
                </Button>
              )}
            </div>
          </div>

          {(profile.skills || []).length > 0 && (
            <div className="mt-8 lg:mt-10 pt-8 lg:pt-10 border-t border-[rgba(255,255,255,0.08)]">
              <h3 className="font-medium text-[var(--color-text)] mb-4 tracking-wide uppercase text-sm">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 text-sm font-mono text-[var(--color-text)] border border-[rgba(255,255,255,0.1)] rounded-lg hover:border-[var(--color-accent)]/50 hover:text-[var(--color-accent)] transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Tabs */}
        <Card variant="default" padding="none">
          <nav className="border-b border-[rgba(255,255,255,0.08)]" aria-label="Profile tabs">
            <ul className="flex flex-wrap -mb-px" role="tablist">
              {tabs.map((tab) => (
                <li key={tab.id} role="presentation">
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    className={`flex items-center gap-2 px-6 py-5 text-sm font-medium border-b-2 transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                        : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[rgba(255,255,255,0.08)]'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-6 lg:p-8">
            {activeTab === 'overview' && (
              <div className="space-y-10 lg:space-y-12">
                {profile.role === 'freelancer' && (
                  <div>
                    <h3 className="font-semibold text-[var(--color-text)] mb-5 tracking-wide uppercase text-sm">Availability</h3>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                          profile.availability === 'available'
                            ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]/30'
                            : profile.availability === 'busy'
                            ? 'bg-[var(--color-gray-700)]/50 text-[var(--color-gray-400)] border-[var(--color-gray-600)]'
                            : 'bg-[var(--glass-bg)] text-[var(--color-text-muted)] border-[var(--glass-border)]'
                        }`}
                      >
                        {profile.availability === 'available' ? 'Available for work' :
                         profile.availability === 'busy' ? 'Busy / Limited availability' :
                         'Not available'}
                      </span>
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-[var(--color-text)] mb-5 tracking-wide uppercase text-sm">Account Details</h3>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <dt className="text-sm text-[var(--color-text-muted)] tracking-wide uppercase">Role</dt>
                      <dd className="mt-1 font-mono text-[var(--color-text)] capitalize">{profile.role}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-[var(--color-text-muted)] tracking-wide uppercase">Plan</dt>
                      <dd className="mt-1 font-mono text-[var(--color-text)] capitalize">{profile.plan}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-[var(--color-text-muted)] tracking-wide uppercase">Email Verified</dt>
                      <dd className="mt-1 font-mono text-[var(--color-text)]">{profile.is_verified ? 'Yes' : 'No'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-[var(--color-text-muted)] tracking-wide uppercase">Identity Verified</dt>
                      <dd className="mt-1 font-mono text-[var(--color-text)]">{profile.is_verified ? 'Yes' : 'No'}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}

            {activeTab === 'portfolio' && (
              <div>
                {projects.length === 0 ? (
                  <EmptyState
                    icon={Briefcase}
                    title="No portfolio projects yet"
                    description="Completed projects will appear here automatically."
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                      <ProjectCardItem key={project.id} project={project} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                {reviews.length === 0 ? (
                  <EmptyState
                    icon={StarIcon}
                    title="No reviews yet"
                    description="Reviews from clients will appear here once projects are completed."
                  />
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="p-6 border border-[rgba(255,255,255,0.08)] rounded-xl">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-[var(--color-accent-muted)] flex items-center justify-center border border-[var(--glass-border)]">
                              {review.reviewer?.avatar_url ? (
                                <img src={review.reviewer.avatar_url} alt="" className="w-12 h-12 rounded-full" />
                              ) : (
                                <ShieldCheckIcon className="w-6 h-6 text-[var(--color-accent)]" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-[var(--color-text)]">{review.reviewer?.full_name || 'Client'}</p>
                              <p className="text-sm text-[var(--color-text-muted)] font-mono">{formatDate(review.created_at)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-[var(--color-accent)]">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon
                                key={i}
                                className="w-5 h-5"
                                fill={i < (review.rating || 0) ? 'currentColor' : 'none'}
                                stroke="currentColor"
                              />
                            ))}
                          </div>
                        </div>
                        {review.content && (
                          <p className="text-[var(--color-text-muted)] leading-relaxed">{review.content}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <div>
                <div className="border border-[rgba(255,255,255,0.08)] rounded-xl overflow-hidden bg-[var(--glass-bg)]">
                  <ActivityList
                    activities={activities.slice(0, 20)}
                    hoveredId={hoveredActivityId}
                    onHover={setHoveredActivityId}
                    onLeave={() => setHoveredActivityId(null)}
                  />
                </div>
                {activities.length === 0 && (
                  <EmptyState
                    icon={CalendarDaysIcon}
                    title="No activity yet"
                    description="Your project activity, reviews, and skill updates will appear here."
                  />
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <Modal
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
          title={`Contact ${profile.full_name}`}
          size="md"
        >
          <div className="space-y-4">
            <p className="text-[var(--color-text-muted)]">Send a message to discuss your project requirements.</p>
            <Button variant="primary" fullWidth asChild onClick={() => setShowContactModal(false)}>
              <Link to="/projects">
                <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2 inline" />
                Start Chat
              </Link>
            </Button>
            <Button variant="secondary" fullWidth onClick={() => setShowContactModal(false)}>
              Cancel
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}