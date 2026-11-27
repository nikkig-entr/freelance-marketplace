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
  BriefcaseIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
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
    project: BriefcaseIcon,
    review: StarIcon,
    skill: ShieldCheckIcon,
  };

  const Icon = typeIcons[item.type];

  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`flex items-start gap-4 py-4 border-b border-white/15 last:border-0 transition-all duration-300 ${isHovered ? 'bg-white/5' : ''}`}
    >
      <div className="w-10 h-10 border border-white/15 flex items-center justify-center flex-shrink-0 transition-colors duration-200">
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
    <div className="py-16 text-center border border-white/15 p-6">
      <div className="w-16 h-16 border border-white/15 flex items-center justify-center mx-auto mb-6">
        <Icon className="w-8 h-8 text-[var(--color-text-subtle)]" />
      </div>
      <h3 className="font-heading font-medium text-[var(--color-text)] mb-2">{title}</h3>
      <p className="text-[var(--color-text-muted)] max-w-sm mx-auto">{description}</p>
    </div>
  );
}

function ProjectCardItem({ project }: { project: Project }) {
  return (
    <Link
      to="/projects"
      className="p-6 border border-white/15 transition-all duration-200 hover:border-white/30 hover:bg-white/5 group"
    >
      <h4 className="font-medium text-[var(--color-text)] mb-2 line-clamp-1 group-hover:text-[var(--color-white)] transition-colors">{project.title}</h4>
      <p className="text-sm text-[var(--color-text-muted)] mb-4 line-clamp-2">{project.description}</p>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {(project.tags || []).slice(0, 3).map((skill) => (
          <span key={skill} className="px-2 py-0.5 text-xs font-mono text-[var(--color-text-subtle)] border border-white/15">
            {skill}
          </span>
        ))}
        {project.tags && project.tags.length > 3 && (
          <span className="px-2 py-0.5 text-xs font-mono text-[var(--color-text-subtle)] border border-white/15">
            +{project.tags.length - 3} more
          </span>
        )}
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-mono text-[var(--color-text)] tabular-nums">
          {project.budget_min ? formatCurrency(project.budget_min) : 'Negotiable'}
        </span>
        <time className="text-[var(--color-text-subtle)]" dateTime={project.completed_at || project.updated_at}>
          {formatDate(project.completed_at || project.updated_at)}
        </time>
      </div>
    </Link>
  );
}

const profileImages = [
  '/media/arch-01.jpg',
  '/media/arch-02.jpg',
  '/media/arch-03.jpg',
  '/media/arch-04.jpg',
];

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
          <div className="aspect-video bg-white/10" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-12 bg-white/10" />
            <div className="h-12 bg-white/10" />
            <div className="h-12 bg-white/10" />
          </div>
          <div className="h-64 bg-white/10" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center py-16 lg:py-24">
        <div className="text-center">
          <h2 className="font-heading font-bold text-[var(--color-text)] text-2xl">Profile not found</h2>
          <Link to="/projects" className="inline-block mt-6">
            <Button className="border border-white px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black">
              Browse Projects
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: ShieldCheckIcon },
    { id: 'portfolio' as const, label: 'Portfolio', icon: BriefcaseIcon },
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

  const previewImage = profileImages[userId % profileImages.length];

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header with Hero Image */}
      <header className="relative">
        <div className="aspect-video relative overflow-hidden">
          <img
            src={previewImage}
            alt={`${profile.full_name || 'Freelancer'} profile background`}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)]/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
            <div className="container">
              <div className="flex items-start gap-4 mb-8 lg:mb-12">
                <Link to="/projects" className="text-white/70 hover:text-white transition-colors shrink-0">
                  <ArrowLeftIcon className="w-6 h-6" />
                </Link>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h1 className="font-heading font-bold text-[var(--color-white)] text-3xl sm:text-4xl tracking-tight">{profile.full_name || 'Unnamed User'}</h1>
                    <span className="px-3 py-1 text-sm font-mono font-medium border border-white/30 text-white">
                      {profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1)}
                    </span>
                    {profile.is_verified && (
                      <span className="flex items-center gap-1.5 px-3 py-1 text-sm font-mono border border-white/30 text-white">
                        <ShieldCheckIcon className="w-4 h-4" />
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-white/70 text-lg font-mono">@{profile.email?.split('@')[0] || 'user'}</p>
                </div>
                {!isOwnProfile && profile.role === 'freelancer' && (
                  <Button
                    className="bg-white text-black hover:bg-white/90 px-6 py-3 whitespace-nowrap shrink-0 border border-white font-mono text-xs uppercase tracking-[0.2em]"
                    onClick={handleHire}
                  >
                    Hire Now
                  </Button>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                <div className="bg-white/10 border border-white/10 p-5 lg:p-6">
                  <p className="text-white/60 font-mono text-xs tracking-wider uppercase">Rating</p>
                  <p className="mt-1 font-heading font-bold text-white text-3xl sm:text-4xl flex items-center gap-1.5">
                    {profile.rating || 0} <StarIcon className="w-6 h-6" />
                  </p>
                </div>
                <div className="bg-white/10 border border-white/10 p-5 lg:p-6">
                  <p className="text-white/60 font-mono text-xs tracking-wider uppercase">Reviews</p>
                  <p className="mt-1 font-heading font-bold text-white text-3xl sm:text-4xl font-mono tabular-nums">{profile.reviews_count || 0}</p>
                </div>
                <div className="bg-white/10 border border-white/10 p-5 lg:p-6">
                  <p className="text-white/60 font-mono text-xs tracking-wider uppercase">Completed</p>
                  <p className="mt-1 font-heading font-bold text-white text-3xl sm:text-4xl font-mono tabular-nums">{profile.completed_projects || 0}</p>
                </div>
                <div className="bg-white/10 border border-white/10 p-5 lg:p-6">
                  <p className="text-white/60 font-mono text-xs tracking-wider uppercase">Member Since</p>
                  <p className="mt-1 font-heading font-bold text-white text-xl sm:text-2xl font-mono tabular-nums">{formatDate(profile.created_at).split(' ').slice(1).join(' ')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-16 lg:py-24 -mt-8 lg:-mt-12 relative z-10">
        {/* Profile Card */}
        <div className="border border-white/15 p-6 lg:p-8 mb-12 lg:mb-16">
          <div className="flex flex-col md:flex-row md:items-start gap-8">
            <div className="w-28 h-28 border border-white/15 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <UserCircleIcon className="w-16 h-16 text-[var(--color-text-muted)]" />
              )}
            </div>
            <div className="flex-1 md:flex md:items-center md:justify-between">
              <div>
                {profile.bio && (
                  <p className="font-[Instrument_Serif] italic text-[var(--color-text-muted)] text-lg mb-6 max-w-2xl">{profile.bio}</p>
                )}
                <div className="flex flex-wrap items-center gap-4 lg:gap-6 text-sm text-[var(--color-text-muted)]">
                  {profile.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPinIcon className="w-4 h-4" />
                      {profile.location}
                    </span>
                  )}
                  {profile.website && (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-white transition-colors">
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
                <Button variant="secondary" asChild size="lg" className="whitespace-nowrap mt-4 md:mt-0 md:ml-8 border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white/10">
                  <Link to="/settings">Edit Profile</Link>
                </Button>
              )}
            </div>
          </div>

          {(profile.skills || []).length > 0 && (
            <div className="mt-8 lg:mt-10 pt-8 lg:pt-10 border-t border-white/15">
              <h3 className="font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 text-sm font-mono text-[var(--color-text)] border border-white/15 hover:border-white/30 hover:text-white transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="border border-white/15">
          <nav className="border-b border-white/15" aria-label="Profile tabs">
            <ul className="flex flex-wrap -mb-px" role="tablist">
              {tabs.map((tab) => (
                <li key={tab.id} role="presentation">
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    className={`flex items-center gap-2 px-6 py-5 text-sm font-medium border-b-2 transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'border-white text-white'
                        : 'border-transparent text-[var(--color-text-muted)] hover:text-white hover:border-white/15'
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
                    <h3 className="font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase mb-5">Availability</h3>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-4 py-2 text-sm font-medium border transition-colors ${
                          profile.availability === 'available'
                            ? 'bg-white/10 text-white border-white/30'
                            : profile.availability === 'busy'
                            ? 'bg-white/5 text-[var(--color-text-muted)] border-white/15'
                            : 'bg-white/5 text-[var(--color-text-muted)] border-white/15'
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
                  <h3 className="font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase mb-5">Account Details</h3>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <dt className="font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Role</dt>
                      <dd className="mt-1 font-mono text-[var(--color-text)] capitalize">{profile.role}</dd>
                    </div>
                    <div>
                      <dt className="font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Plan</dt>
                      <dd className="mt-1 font-mono text-[var(--color-text)] capitalize">{profile.plan}</dd>
                    </div>
                    <div>
                      <dt className="font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Email Verified</dt>
                      <dd className="mt-1 font-mono text-[var(--color-text)]">{profile.is_verified ? 'Yes' : 'No'}</dd>
                    </div>
                    <div>
                      <dt className="font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Identity Verified</dt>
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
                    icon={BriefcaseIcon}
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
                      <div key={review.id} className="p-6 border border-white/15">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 border border-white/15 flex items-center justify-center">
                              {review.reviewer?.avatar_url ? (
                                <img src={review.reviewer.avatar_url} alt="" className="w-12 h-12" loading="lazy" />
                              ) : (
                                <ShieldCheckIcon className="w-6 h-6 text-[var(--color-text-muted)]" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-[var(--color-text)]">{review.reviewer?.full_name || 'Client'}</p>
                              <p className="text-sm text-[var(--color-text-muted)] font-mono">{formatDate(review.created_at)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-white">
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
                <div className="border border-white/15 overflow-hidden bg-white/5">
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
        </div>
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
            <Button asChild fullWidth className="border border-white px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black" onClick={() => setShowContactModal(false)}>
              <Link to="/projects">
                <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2 inline" />
                Start Chat
              </Link>
            </Button>
            <Button variant="secondary" fullWidth onClick={() => setShowContactModal(false)} className="border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white/10">
              Cancel
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}