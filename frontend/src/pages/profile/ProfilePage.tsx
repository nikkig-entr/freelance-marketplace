import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/contexts/AuthContext';
import { userService, projectService } from '@/services/api';
import { User, Project, Review, UserPlan, formatCurrency, formatDate } from '@/types';
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
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import toast from 'react-hot-toast';

interface PaginatedProjects {
  items: Project[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export function ProfilePage() {
  const params = useParams({ from: '/profile/$userId' });
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showContactModal, setShowContactModal] = useState(false);

  const userId = parseInt(params.userId);
  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    fetchProfile();
    if (!isOwnProfile) {
      fetchPublicProjects();
      fetchReviews();
    }
  }, [userId, isOwnProfile]);

  const fetchProfile = async () => {
    try {
      const data = await userService.getProfile(userId) as User;
      setProfile(data);
    } catch (error) {
      toast.error('Failed to load profile');
      navigate({ to: '/projects' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPublicProjects = async () => {
    try {
      const data = await projectService.list({ freelancer_id: userId, status: 'completed', page_size: 6 }) as PaginatedProjects;
      setProjects(data.items || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      // In real app, would fetch reviews for this user
      setReviews([]);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-8">
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
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[var(--color-text)]">Profile not found</h2>
          <Link to="/projects" className="inline-block mt-4">
            <Button variant="primary">Browse Projects</Button>
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ShieldCheckIcon },
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
    { id: 'reviews', label: 'Reviews', icon: StarIcon },
  ];

  const getPlanBadge = (plan: UserPlan): 'primary' | 'secondary' | 'outline' | 'danger' => {
    switch (plan) {
      case 'starter': return 'secondary';
      case 'pro': return 'primary';
      case 'agency': return 'primary';
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <header className="bg-gradient-to-b from-[var(--color-accent)] to-[var(--color-accent-hover)] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start gap-4 mb-6">
            <Link to="/projects" className="text-white/80 hover:text-white">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{profile.full_name || 'Unnamed User'}</h1>
                <Badge variant={getPlanBadge(profile.plan)} className="bg-white/20 text-white border-white/30">
                  {profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1)}
                </Badge>
                {profile.is_verified && (
                  <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-sm">
                    <ShieldCheckIcon className="w-4 h-4" />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-white/80">@{profile.email?.split('@')[0] || 'user'}</p>
            </div>
            {!isOwnProfile && profile.role === 'freelancer' && (
              <Button variant="outline" className="bg-white text-[var(--color-accent)] hover:bg-white/90 px-6 py-3 whitespace-nowrap" onClick={handleHire}>
                Hire Now
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-white/70 text-sm">Rating</p>
              <p className="text-2xl font-bold flex items-center gap-1">
                {profile.rating || 0} <StarIcon className="w-5 h-5" />
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-white/70 text-sm">Reviews</p>
              <p className="text-2xl font-bold">{profile.reviews_count || 0}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-white/70 text-sm">Completed</p>
              <p className="text-2xl font-bold">{profile.completed_projects || 0}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-white/70 text-sm">Member Since</p>
              <p className="text-2xl font-bold">{formatDate(profile.created_at).split(' ')[1]} {formatDate(profile.created_at).split(' ')[2]}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-6 relative z-10">
        {/* Profile Card */}
        <Card className="mb-8">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-[var(--color-accent-muted)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <UserCircleIcon className="w-12 h-12 text-[var(--color-accent)]" />
                )}
              </div>
              <div className="flex-1">
                {profile.bio && (
                  <p className="text-[var(--color-text-muted)] text-lg mb-4">{profile.bio}</p>
                )}
                <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-muted)]">
                  {profile.location && (
                    <span className="flex items-center gap-1">
                      <MapPinIcon className="w-4 h-4" />
                      {profile.location}
                    </span>
                  )}
                  {profile.website && (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-[var(--color-accent)]">
                      <GlobeAltIcon className="w-4 h-4" />
                      Website
                    </a>
                  )}
                  {profile.hourly_rate && (
                    <span className="flex items-center gap-1">
                      <CurrencyDollarIcon className="w-4 h-4" />
                      ${profile.hourly_rate}/hr
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <CalendarDaysIcon className="w-4 h-4" />
                    Joined {formatDate(profile.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {(profile.skills || []).length > 0 && (
              <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
                <h3 className="font-medium text-[var(--color-text)] mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <Badge key={skill} variant="primary">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Tabs */}
        <Card>
          <nav className="border-b border-[var(--color-border)]" aria-label="Profile tabs">
            <ul className="flex flex-wrap -mb-px" role="tablist">
              {tabs.map((tab) => (
                <li key={tab.id} role="presentation">
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                        : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border)]'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {profile.role === 'freelancer' && (
                  <div>
                    <h3 className="font-semibold text-[var(--color-text)] mb-4">Availability</h3>
                    <div className="flex items-center gap-3">
                      <Badge variant={
                        profile.availability === 'available' ? 'primary' :
                        profile.availability === 'busy' ? 'secondary' : 'outline'
                      }>
                        {profile.availability === 'available' ? 'Available for work' :
                         profile.availability === 'busy' ? 'Busy / Limited availability' :
                         'Not available'}
                      </Badge>
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-[var(--color-text)] mb-4">Account Details</h3>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm text-[var(--color-text-muted)]">Role</dt>
                      <dd className="font-medium text-[var(--color-text)] capitalize">{profile.role}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-[var(--color-text-muted)]">Plan</dt>
                      <dd className="font-medium text-[var(--color-text)] capitalize">{profile.plan}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-[var(--color-text-muted)]">Email Verified</dt>
                      <dd className="font-medium text-[var(--color-text)]">{profile.is_verified ? 'Yes' : 'No'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-[var(--color-text-muted)]">Identity Verified</dt>
                      <dd className="font-medium text-[var(--color-text)]">{profile.is_verified ? 'Yes' : 'No'}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}

            {activeTab === 'portfolio' && (
              <div>
                {projects.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="w-16 h-16 text-[var(--color-text-subtle)] mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-[var(--color-text)]">No portfolio projects yet</h3>
                    <p className="mt-1 text-[var(--color-text-muted)]">Completed projects will appear here</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                      <Link key={project.id} to="/projects" className="card-hover p-4">
                        <h4 className="font-semibold text-[var(--color-text)] mb-1 line-clamp-1">{project.title}</h4>
                        <p className="text-sm text-[var(--color-text-muted)] mb-3 line-clamp-2">{project.description}</p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {(project.tags || []).slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="outline" size="sm">{skill}</Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
                          <span className="flex items-center gap-1">
                            <CurrencyDollarIcon className="w-4 h-4" />
                            {project.budget_min ? formatCurrency(project.budget_min) : 'Negotiable'}
                          </span>
                          <span>{formatDate(project.completed_at || project.updated_at)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                {reviews.length === 0 ? (
                  <div className="text-center py-12">
                    <StarIcon className="w-16 h-16 text-[var(--color-text-subtle)] mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-[var(--color-text)]">No reviews yet</h3>
                    <p className="mt-1 text-[var(--color-text-muted)]">Reviews from clients will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="p-4 bg-[var(--color-surface-muted)] rounded-lg">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[var(--color-accent-muted)] flex items-center justify-center">
                              {review.reviewer?.avatar_url ? (
                                <img src={review.reviewer.avatar_url} alt="" className="w-10 h-10 rounded-full" />
                              ) : (
                                <ShieldCheckIcon className="w-5 h-5 text-[var(--color-accent)]" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-[var(--color-text)]">{review.reviewer?.full_name || 'Client'}</p>
                              <p className="text-sm text-[var(--color-text-muted)]">{formatDate(review.created_at)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-[var(--color-warning)]">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon key={i} className="w-5 h-5" fill={i < (review.rating || 0) ? 'currentColor' : 'none'} stroke="currentColor" />
                            ))}
                          </div>
                        </div>
                        {review.content && (
                          <p className="text-[var(--color-text-muted)] ml-13">{review.content}</p>
                        )}
                      </div>
                    ))}
                  </div>
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