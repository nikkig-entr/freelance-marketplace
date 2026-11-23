import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { User, Project, Review, UserRole, UserPlan, formatCurrency, formatDate, getStatusColor } from '../../types';
import {
  ArrowLeftIcon,
  StarIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  MapPinIcon,
  GlobeAltIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

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
      const data = await api.getCurrentUser(); // In real app, would be api.getUser(userId)
      setProfile(data);
    } catch (error) {
      toast.error('Failed to load profile');
      navigate('/projects');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPublicProjects = async () => {
    try {
      const data = await api.getProjects({ freelancer_id: userId, status: 'completed', page_size: 6 });
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
      navigate('/login', { search: { redirect: `/profile/${userId}` } });
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-8">
          <div className="h-48 bg-gray-200 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-12 bg-gray-200 rounded" />
            <div className="h-12 bg-gray-200 rounded" />
            <div className="h-12 bg-gray-200 rounded" />
          </div>
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Profile not found</h2>
          <Link to="/projects" className="btn-primary mt-4 inline-block">Browse Projects</Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: UserCircleIcon },
    { id: 'portfolio', label: 'Portfolio', icon: BriefcaseIcon },
    { id: 'reviews', label: 'Reviews', icon: StarIcon },
  ];

  const getPlanBadge = (plan: UserPlan) => {
    switch (plan) {
      case 'starter': return 'badge-gray';
      case 'pro': return 'badge-primary';
      case 'agency': return 'badge-success';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-b from-primary-600 to-primary-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start gap-4 mb-6">
            <Link to="/projects" className="text-white/80 hover:text-white">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{profile.full_name || 'Unnamed User'}</h1>
                <span className={`badge ${getPlanBadge(profile.plan)} bg-white/20 text-white border-white/30`}>
                  {profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1)}
                </span>
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
              <button onClick={handleHire} className="btn bg-white text-primary-600 hover:bg-white/90 px-6 py-3 whitespace-nowrap">
                Hire Now
              </button>
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
        <div className="card mb-8">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <UserCircleIcon className="w-12 h-12 text-primary-600" />
                )}
              </div>
              <div className="flex-1">
                {profile.bio && (
                  <p className="text-gray-700 text-lg mb-4">{profile.bio}</p>
                )}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  {profile.location && (
                    <span className="flex items-center gap-1">
                      <MapPinIcon className="w-4 h-4" />
                      {profile.location}
                    </span>
                  )}
                  {profile.profile?.website && (
                    <a href={profile.profile.website as string} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary-600">
                      <GlobeAltIcon className="w-4 h-4" />
                      Website
                    </a>
                  )}
                  {profile.profile?.hourly_rate && (
                    <span className="flex items-center gap-1">
                      <CurrencyDollarIcon className="w-4 h-4" />
                      ${profile.profile.hourly_rate}/hr
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <CalendarDaysIcon className="w-4 h-4" />
                    Joined {formatDate(profile.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {profile.profile?.skills && profile.profile.skills.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {(profile.profile.skills as string[]).map((skill) => (
                    <span key={skill} className="badge badge-primary">{skill}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="card">
          <nav className="border-b border-gray-200" aria-label="Profile tabs">
            <ul className="flex flex-wrap -mb-px" role="tablist">
              {tabs.map((tab) => (
                <li key={tab.id} role="presentation">
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
                    <h3 className="font-semibold text-gray-900 mb-4">Availability</h3>
                    <div className="flex items-center gap-3">
                      <span className={`badge ${profile.profile?.availability === 'available' ? 'badge-success' : profile.profile?.availability === 'busy' ? 'badge-warning' : 'badge-gray'}`}>
                        {profile.profile?.availability === 'available' ? 'Available for work' :
                         profile.profile?.availability === 'busy' ? 'Busy / Limited availability' :
                         'Not available'}
                      </span>
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Account Details</h3>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm text-gray-500">Role</dt>
                      <dd className="font-medium text-gray-900 capitalize">{profile.role}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Plan</dt>
                      <dd className="font-medium text-gray-900 capitalize">{profile.plan}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Email Verified</dt>
                      <dd className="font-medium text-gray-900">{profile.email_verified_at ? 'Yes' : 'No'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Identity Verified</dt>
                      <dd className="font-medium text-gray-900">{profile.is_verified ? 'Yes' : 'No'}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}

            {activeTab === 'portfolio' && (
              <div>
                {projects.length === 0 ? (
                  <div className="text-center py-12">
                    <BriefcaseIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No portfolio projects yet</h3>
                    <p className="mt-1 text-gray-500">Completed projects will appear here</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                      <Link key={project.id} to={`/projects/${project.id}`} className="card-hover p-4">
                        <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">{project.title}</h4>
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{project.description}</p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {project.skills.slice(0, 3).map((skill) => (
                            <span key={skill} className="badge badge-gray text-xs">{skill}</span>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <CurrencyDollarIcon className="w-4 h-4" />
                            {formatCurrency(project.budget_min)}
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
                    <StarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No reviews yet</h3>
                    <p className="mt-1 text-gray-500">Reviews from clients will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                              {review.from_user?.avatar_url ? (
                                <img src={review.from_user.avatar_url} alt="" className="w-10 h-10 rounded-full" />
                              ) : (
                                <UserCircleIcon className="w-5 h-5 text-primary-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{review.from_user?.full_name || 'Client'}</p>
                              <p className="text-sm text-gray-500">{formatDate(review.created_at)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-500">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon key={i} className="w-5 h-5" fill={i < (review.rating || 0) ? 'currentColor' : 'none'} stroke="currentColor" />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-gray-700 ml-13">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact {profile.full_name}</h2>
            <p className="text-gray-600 mb-6">Send a message to discuss your project requirements.</p>
            <Link
              to={`/chat/${userId}`}
              className="btn-primary w-full block text-center py-3"
              onClick={() => setShowContactModal(false)}
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2 inline" />
              Start Chat
            </Link>
            <button
              onClick={() => setShowContactModal(false)}
              className="btn-secondary w-full block text-center py-3 mt-3"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Need to import Link
import { Link } from '@tanstack/react-router';