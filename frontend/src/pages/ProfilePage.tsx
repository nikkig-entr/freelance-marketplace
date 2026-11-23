import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CameraIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Card, CardTitle } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge, PlanBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { userService } from '@/services/api';
import { User, UserPlan, UserRole } from '@/types';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username is too long').regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  bio: z.string().max(2000, 'Bio is too long').optional(),
  location: z.string().max(100, 'Location is too long').optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  github_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  linkedin_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  twitter_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  skills: z.string().optional(),
  hourly_rate: z.coerce.number().min(0).max(10000).optional(),
  availability: z.string().optional(),
  email_notifications: z.boolean(),
  push_notifications: z.boolean(),
  marketing_emails: z.boolean(),
});

type ProfileForm = z.infer<typeof profileSchema>;

const availabilityOptions = [
  { value: 'full_time', label: 'Full-time (30+ hrs/week)' },
  { value: 'part_time', label: 'Part-time (10-30 hrs/week)' },
  { value: 'occasionally', label: 'Occasionally (< 10 hrs/week)' },
  { value: 'unavailable', label: 'Not available' },
];

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'portfolio'>('profile');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name || '',
      username: user?.username || '',
      bio: user?.bio || '',
      location: user?.location || '',
      website: user?.website || '',
      github_url: user?.github_url || '',
      linkedin_url: user?.linkedin_url || '',
      twitter_url: user?.twitter_url || '',
      skills: user?.skills?.join(', ') || '',
      hourly_rate: user?.hourly_rate || undefined,
      availability: user?.availability || 'full_time',
      email_notifications: user?.email_notifications ?? true,
      push_notifications: user?.push_notifications ?? true,
      marketing_emails: user?.marketing_emails ?? false,
    },
  });

  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: (data: ProfileForm) => userService.updateProfile({
      ...data,
      skills: data.skills ? data.skills.split(',').map(s => s.trim()) : [],
      hourly_rate: data.hourly_rate || null,
    }),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    },
  });

  const { mutate: uploadAvatar } = useMutation({
    mutationFn: (file: File) => userService.uploadAvatar(file),
    onSuccess: (data) => {
      updateUser({ ...user!, avatar_url: data.avatar_url });
      toast.success('Avatar updated!');
      setAvatarPreview(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to upload avatar');
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('File must be an image');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        uploadAvatar(file);
      }
    };
    input.click();
  };

  const handleSubmitForm = (data: ProfileForm) => {
    updateProfile(data);
  };

  if (!user) return null;

  const displayAvatar = avatarPreview || user.avatar_url;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-secondary-900">Profile Settings</h1>
          <p className="mt-1 text-secondary-600">Manage your public profile and account settings</p>
        </div>
      </div>

      {/* Profile Overview Card */}
      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative">
            <Avatar
              name={user.full_name}
              src={displayAvatar}
              size="2xl"
            />
            {isEditing && (
              <button
                type="button"
                onClick={handleAvatarUpload}
                className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 transition-colors"
                aria-label="Change avatar"
              >
                <CameraIcon className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h2 className="text-xl font-bold text-secondary-900">{user.full_name}</h2>
              {user.username && (
                <span className="text-secondary-500">@{user.username}</span>
              )}
              <PlanBadge plan={user.plan} size="md" />
              <Badge variant={user.role === 'admin' ? 'danger' : user.role === 'client' ? 'secondary' : 'primary'}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
              {user.is_verified && (
                <Badge variant="success" size="sm">
                  <CheckIcon className="w-3 h-3 mr-1" /> Verified
                </Badge>
              )}
            </div>
            <p className="text-secondary-600">{user.bio || 'No bio yet. Add one to tell clients about yourself!'}</p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-secondary-500">
              {user.location && (
                <span className="flex items-center gap-1">📍 {user.location}</span>
              )}
              {user.website && (
                <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary-600">
                  🌐 {user.website.replace(/^https?:\/\//, '')}
                </a>
              )}
              {user.hourly_rate && (
                <span className="flex items-center gap-1">${user.hourly_rate}/hr</span>
              )}
              <span className="flex items-center gap-1">
                {availabilityOptions.find(o => o.value === user.availability)?.label || 'Availability not set'}
              </span>
            </div>
          </div>
          {isEditing ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { reset(); setIsEditing(false); }}>
                <XMarkIcon className="w-4 h-4 mr-1" /> Cancel
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsEditing(true)} leftIcon={<PencilIcon className="w-4 h-4" />}>
              Edit Profile
            </Button>
          )}
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-secondary-200">
        <nav className="flex gap-4" aria-label="Profile tabs">
          {[
            { id: 'profile', label: 'Profile', icon: null },
            { id: 'portfolio', label: 'Portfolio', icon: null },
            { id: 'settings', label: 'Settings', icon: null },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-6">
          <Card>
            <CardTitle title="Basic Information" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                label="Full Name *"
                error={errors.full_name?.message}
                {...register('full_name')}
              />
              <Input
                label="Username *"
                placeholder="johndoe"
                error={errors.username?.message}
                {...register('username')}
              />
            </div>
            <Textarea
              label="Bio"
              placeholder="Tell potential clients about yourself, your experience, and what you do..."
              rows={4}
              error={errors.bio?.message}
              {...register('bio')}
            />
          </Card>

          <Card>
            <CardTitle title="Contact & Links" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                label="Location"
                placeholder="San Francisco, CA"
                error={errors.location?.message}
                {...register('location')}
              />
              <Input
                label="Website"
                placeholder="https://yourwebsite.com"
                type="url"
                error={errors.website?.message}
                {...register('website')}
              />
              <Input
                label="GitHub"
                placeholder="https://github.com/username"
                type="url"
                error={errors.github_url?.message}
                {...register('github_url')}
              />
              <Input
                label="LinkedIn"
                placeholder="https://linkedin.com/in/username"
                type="url"
                error={errors.linkedin_url?.message}
                {...register('linkedin_url')}
              />
              <Input
                label="Twitter/X"
                placeholder="https://twitter.com/username"
                type="url"
                error={errors.twitter_url?.message}
                {...register('twitter_url')}
              />
            </div>
          </Card>

          {(user.role === 'freelancer' || user.role === 'admin') && (
            <Card>
              <CardTitle title="Freelancer Details" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input
                  label="Skills (comma-separated)"
                  placeholder="React, TypeScript, Node.js, PostgreSQL"
                  error={errors.skills?.message}
                  {...register('skills')}
                />
                <Input
                  label="Hourly Rate (USD)"
                  type="number"
                  placeholder="100"
                  min="0"
                  max="10000"
                  step="5"
                  error={errors.hourly_rate?.message}
                  {...register('hourly_rate', { valueAsNumber: Number })}
                />
              </div>
              <Select
                label="Availability"
                options={availabilityOptions}
                error={errors.availability?.message}
                {...register('availability')}
              />
            </Card>
          )}

          <Card>
            <CardTitle title="Notification Preferences" />
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
                  {...register('email_notifications')}
                />
                <span className="text-sm font-medium text-secondary-700">Email notifications</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
                  {...register('push_notifications')}
                />
                <span className="text-sm font-medium text-secondary-700">Push notifications</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
                  {...register('marketing_emails')}
                />
                <span className="text-sm font-medium text-secondary-700">Marketing emails</span>
              </label>
            </div>
          </Card>

          {isEditing && (
            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => { reset(); setIsEditing(false); }}>
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting || isPending} size="lg">
                Save Changes
              </Button>
            </div>
          )}
        </form>
      )}

      {/* Portfolio Tab */}
      {activeTab === 'portfolio' && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <CardTitle title="Portfolio" subtitle="Showcase your work to attract more clients" />
            <Button variant="outline" size="sm">Add Project</Button>
          </div>
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-secondary-100 flex items-center justify-center mx-auto mb-4">
              <CameraIcon className="w-8 h-8 text-secondary-400" />
            </div>
            <h3 className="text-lg font-medium text-secondary-900 mb-1">No portfolio items yet</h3>
            <p className="text-secondary-600 mb-4">Add your best work to show potential clients what you can do.</p>
            <Button variant="outline">Add Your First Project</Button>
          </div>
        </Card>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <Card>
            <CardTitle title="Account Settings" subtitle="Manage your account security and preferences" />
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary-50">
                <div>
                  <p className="font-medium text-secondary-900">Email Address</p>
                  <p className="text-sm text-secondary-500">{user.email}</p>
                </div>
                <Button variant="outline" size="sm">Change Email</Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary-50">
                <div>
                  <p className="font-medium text-secondary-900">Password</p>
                  <p className="text-sm text-secondary-500">Last changed: Never</p>
                </div>
                <Button variant="outline" size="sm">Change Password</Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary-50">
                <div>
                  <p className="font-medium text-secondary-900">Two-Factor Authentication</p>
                  <p className="text-sm text-secondary-500">Add an extra layer of security</p>
                </div>
                <Button variant="outline" size="sm">Enable 2FA</Button>
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle title="Plan & Billing" subtitle="Manage your subscription and payment methods" />
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary-50">
                <div>
                  <p className="font-medium text-secondary-900">Current Plan</p>
                  <PlanBadge plan={user.plan} size="md" />
                </div>
                <Button variant="outline" size="sm">Manage Plan</Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary-50">
                <div>
                  <p className="font-medium text-secondary-900">Payment Methods</p>
                  <p className="text-sm text-secondary-500">Manage your saved payment methods</p>
                </div>
                <Button variant="outline" size="sm">View Methods</Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary-50">
                <div>
                  <p className="font-medium text-secondary-900">Billing History</p>
                  <p className="text-sm text-secondary-500">View past invoices and receipts</p>
                </div>
                <Button variant="outline" size="sm">View History</Button>
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle title="Danger Zone" subtitle="Irreversible actions" />
            <div className="flex items-center justify-between p-4 rounded-xl bg-danger-50 border border-danger-100">
              <div>
                <p className="font-medium text-danger-900">Delete Account</p>
                <p className="text-sm text-danger-700">Permanently delete your account and all data</p>
              </div>
              <Button variant="danger" size="sm">Delete Account</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}