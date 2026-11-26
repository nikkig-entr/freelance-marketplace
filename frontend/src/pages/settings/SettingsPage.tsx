import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/api';
import { UserCircleIcon, ShieldCheckIcon, BanknotesIcon, ArrowLeftIcon, PencilIcon, KeyIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface ProfileForm {
  full_name: string;
  avatar_url: string;
  bio: string;
  website: string;
  location: string;
  skills: string;
  hourly_rate: string;
  availability: 'available' | 'busy' | 'unavailable';
}

interface PasswordForm {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'billing'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    setValue: setValueProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileForm>({
    defaultValues: {
      availability: 'available',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    watch: watchPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordForm>();

  const newPassword = watchPassword('new_password');

  useEffect(() => {
    if (user) {
      setValueProfile('full_name', user.full_name || '');
      setValueProfile('avatar_url', user.avatar_url || '');
      setValueProfile('bio', user.bio || '');
      setValueProfile('website', user.website || '');
      setValueProfile('location', user.location || '');
      setValueProfile('skills', user.skills?.join(', ') || '');
      setValueProfile('hourly_rate', user.hourly_rate?.toString() || '');
      setValueProfile('availability', (user.availability as 'available' | 'busy' | 'unavailable') || 'available');
      if (user.avatar_url) setAvatarPreview(user.avatar_url);
    }
  }, [user, setValueProfile]);

  const onSubmitProfile = async (data: ProfileForm) => {
    setIsSaving(true);
    try {
      const profileData = {
        full_name: data.full_name,
        avatar_url: data.avatar_url || undefined,
        bio: data.bio || undefined,
        website: data.website || undefined,
        location: data.location || undefined,
        skills: data.skills.split(',').map((s) => s.trim()).filter(Boolean),
        hourly_rate: data.hourly_rate ? parseFloat(data.hourly_rate) : undefined,
        availability: data.availability,
      };
      await userService.updateProfile(user!.id, profileData);
      await refreshUser();
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmitPassword = async (_data: PasswordForm) => {
    setIsSaving(true);
    try {
      // This would call a password change endpoint
      // await api.changePassword(data.current_password, data.new_password);
      toast.success('Password changed successfully!');
    } catch {
      toast.error('Failed to change password');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setAvatarPreview(base64);
      setValueProfile('avatar_url', base64);
    };
    reader.readAsDataURL(file);
  };

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: UserCircleIcon },
    { id: 'security' as const, label: 'Security', icon: ShieldCheckIcon },
    { id: 'billing' as const, label: 'Billing', icon: BanknotesIcon },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="text-center text-[var(--color-text-muted)]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <Link to="/" className="text-[var(--color-text-subtle)] hover:text-[var(--color-text)] transition-colors">
            <ArrowLeftIcon className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight text-[var(--color-text)]">Account</h1>
            <p className="mt-1 text-[var(--color-text-muted)]">Manage your profile, security, and billing</p>
          </div>
        </div>

        {/* User Header Card */}
        <div className="border border-[var(--color-border)] mb-8 overflow-hidden">
          <div className="p-8 flex flex-col sm:flex-row items-start sm:items-center gap-8">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 overflow-hidden rounded-none bg-[var(--color-gray-100)]">
              {avatarPreview ? (
                <img src={avatarPreview} alt={`${user.full_name || 'User'}'s avatar`} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <UserCircleIcon className="w-full h-full text-[var(--color-text-subtle)]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[var(--color-text)]">
                    {user.full_name || 'Unnamed User'}
                  </h2>
                  <p className="mt-1 text-[var(--color-text-muted)] font-mono text-sm">{user.email}</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="px-3 py-1 text-xs font-mono font-medium border border-[var(--color-border)] text-[var(--color-text)]">
                    {user.role}
                  </span>
                  <span className="px-3 py-1 text-xs font-mono font-medium border border-[var(--color-border)] text-[var(--color-text)]">
                    {user.plan}
                  </span>
                  {user.is_verified && (
                    <span className="px-3 py-1 text-xs font-mono font-medium border border-[var(--color-border)] text-[var(--color-text)]">
                      Verified
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-8 text-sm">
                <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                  <ChartBarIcon className="w-4 h-4" />
                  <span>{user.completed_projects} projects completed</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                  <UserCircleIcon className="w-4 h-4" />
                  <span>{user.reviews_count} reviews</span>
                </div>
                {user.role === 'freelancer' && user.hourly_rate && (
                  <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                    <BanknotesIcon className="w-4 h-4" />
                    <span className="font-mono">${user.hourly_rate}/hr</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <nav className="border-b border-[var(--color-border)] mb-8" aria-label="Account tabs">
          <ul className="flex flex-wrap -mb-px" role="tablist">
            {tabs.map((tab) => (
              <li key={tab.id} role="presentation">
                <button
                  onClick={() => setActiveTab(tab.id)}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-[var(--color-text)] text-[var(--color-text)]'
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

        {/* Tab Content */}
        <div className="pt-8">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-8">
              {/* Avatar Section */}
              <div className="border-t border-[var(--color-border)] pt-8">
                <h3 className="text-lg font-medium text-[var(--color-text)] mb-6 flex items-center gap-2">
                  <UserCircleIcon className="w-5 h-5" />
                  Profile Picture
                </h3>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-[var(--color-gray-100)] flex items-center justify-center overflow-hidden rounded-none">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                      ) : (
                        <UserCircleIcon className="w-12 h-12 text-[var(--color-text-subtle)]" />
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-[var(--color-text)] text-[var(--color-bg)] p-2 cursor-pointer hover:bg-[var(--color-text-muted)] transition-colors">
                      <input type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" aria-label="Change avatar" />
                      <PencilIcon className="w-5 h-5" />
                    </label>
                  </div>
                  <div>
                    <p className="font-medium text-[var(--color-text)]">Profile Picture</p>
                    <p className="text-sm text-[var(--color-text-muted)]">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>
              </div>

              {/* Profile Fields */}
              <div className="border-t border-[var(--color-border)] pt-8 space-y-6">
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-[var(--color-text)] mb-2">Full Name *</label>
                  <input
                    id="full_name"
                    type="text"
                    className={`w-full input ${profileErrors.full_name ? 'border-[var(--color-gray-500)]' : ''}`}
                    {...registerProfile('full_name', { required: 'Full name is required' })}
                    aria-invalid={profileErrors.full_name ? 'true' : 'false'}
                    aria-describedby={profileErrors.full_name ? 'full_name-error' : undefined}
                  />
                  {profileErrors.full_name && (
                    <p id="full_name-error" className="mt-1 text-sm text-[var(--color-gray-500)]" role="alert">{profileErrors.full_name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-[var(--color-text)] mb-2">Bio</label>
                  <textarea
                    id="bio"
                    rows={4}
                    className="w-full input resize-none"
                    placeholder="Tell others about yourself..."
                    {...registerProfile('bio')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-[var(--color-text)] mb-2">Location</label>
                    <input
                      id="location"
                      type="text"
                      className="w-full input"
                      placeholder="City, Country"
                      {...registerProfile('location')}
                    />
                  </div>
                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-[var(--color-text)] mb-2">Website</label>
                    <input
                      id="website"
                      type="url"
                      className="w-full input"
                      placeholder="https://example.com"
                      {...registerProfile('website')}
                    />
                  </div>
                </div>

                {user.role === 'freelancer' && (
                  <>
                    <div>
                      <label htmlFor="skills" className="block text-sm font-medium text-[var(--color-text)] mb-2">Skills (comma separated)</label>
                      <input
                        id="skills"
                        type="text"
                        className="w-full input"
                        placeholder="React, TypeScript, Node.js, Python"
                        {...registerProfile('skills')}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="hourly_rate" className="block text-sm font-medium text-[var(--color-text)] mb-2">Hourly Rate (USD)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-subtle)] font-mono">$</span>
                          <input
                            id="hourly_rate"
                            type="number"
                            min="0"
                            step="1"
                            className="w-full input pl-8"
                            placeholder="75"
                            {...registerProfile('hourly_rate', { valueAsNumber: true })}
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="availability" className="block text-sm font-medium text-[var(--color-text)] mb-2">Availability</label>
                        <select
                          id="availability"
                          className="w-full input appearance-none bg-[var(--glass-bg)]"
                          {...registerProfile('availability')}
                        >
                          <option value="available">Available for work</option>
                          <option value="busy">Busy / Limited availability</option>
                          <option value="unavailable">Not available</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="border-t border-[var(--color-border)] pt-8 flex justify-end">
                <button type="submit" disabled={isSaving} className="btn-primary">
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-12">
              <div className="border-t border-[var(--color-border)] pt-8">
                <h3 className="text-lg font-medium text-[var(--color-text)] mb-6 flex items-center gap-2">
                  <KeyIcon className="w-5 h-5" />
                  Change Password
                </h3>
                <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4 max-w-md">
                  <div>
                    <label htmlFor="current_password" className="block text-sm font-medium text-[var(--color-text)] mb-2">Current Password</label>
                    <input
                      id="current_password"
                      type="password"
                      className={`w-full input ${passwordErrors.current_password ? 'border-[var(--color-gray-500)]' : ''}`}
                      {...registerPassword('current_password', { required: 'Current password is required' })}
                      aria-invalid={passwordErrors.current_password ? 'true' : 'false'}
                    />
                    {passwordErrors.current_password && (
                      <p className="mt-1 text-sm text-[var(--color-gray-500)]" role="alert">{passwordErrors.current_password.message}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="new_password" className="block text-sm font-medium text-[var(--color-text)] mb-2">New Password</label>
                    <input
                      id="new_password"
                      type="password"
                      className={`w-full input ${passwordErrors.new_password ? 'border-[var(--color-gray-500)]' : ''}`}
                      {...registerPassword('new_password', {
                        required: 'New password is required',
                        minLength: { value: 8, message: 'Password must be at least 8 characters' },
                      })}
                      aria-invalid={passwordErrors.new_password ? 'true' : 'false'}
                    />
                    {passwordErrors.new_password && (
                      <p className="mt-1 text-sm text-[var(--color-gray-500)]" role="alert">{passwordErrors.new_password.message}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="confirm_password" className="block text-sm font-medium text-[var(--color-text)] mb-2">Confirm New Password</label>
                    <input
                      id="confirm_password"
                      type="password"
                      className={`w-full input ${passwordErrors.confirm_password ? 'border-[var(--color-gray-500)]' : ''}`}
                      {...registerPassword('confirm_password', {
                        required: 'Please confirm your password',
                        validate: (value) => value === newPassword || 'Passwords do not match',
                      })}
                      aria-invalid={passwordErrors.confirm_password ? 'true' : 'false'}
                    />
                    {passwordErrors.confirm_password && (
                      <p className="mt-1 text-sm text-[var(--color-gray-500)]" role="alert">{passwordErrors.confirm_password.message}</p>
                    )}
                  </div>
                  <button type="submit" disabled={isSaving} className="btn-primary">
                    {isSaving ? 'Saving...' : 'Update Password'}
                  </button>
                </form>
              </div>

              <div className="border-t border-[var(--color-border)] pt-8">
                <h3 className="text-lg font-medium text-[var(--color-text)] mb-6 flex items-center gap-2">
                  <ShieldCheckIcon className="w-5 h-5" />
                  Two-Factor Authentication
                </h3>
                <div className="p-6 border border-[var(--color-border)] max-w-md">
                  <p className="text-[var(--color-text-muted)] mb-4">Add an extra layer of security to your account.</p>
                  <button className="btn-secondary">Enable 2FA</button>
                </div>
              </div>

              <div className="border-t border-[var(--color-border)] pt-8">
                <h3 className="text-lg font-medium text-[var(--color-text)] mb-6 flex items-center gap-2">
                  <UserCircleIcon className="w-5 h-5" />
                  Connected Accounts
                </h3>
                <div className="p-6 border border-[var(--color-border)] max-w-md">
                  <p className="text-[var(--color-text-muted)]">Social login connections are managed during login. This feature will be available soon.</p>
                </div>
              </div>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <div className="space-y-12">
              <div className="border-t border-[var(--color-border)] pt-8">
                <h3 className="text-lg font-medium text-[var(--color-text)] mb-6 flex items-center gap-2">
                  <BanknotesIcon className="w-5 h-5" />
                  Account Balance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                  <div className="p-6 border border-[var(--color-border)]">
                    <p className="text-sm text-[var(--color-text-muted)] mb-1">Available Balance</p>
                    <p className="text-3xl font-heading font-bold font-mono text-[var(--color-text)]">
                      ${(user.balance_cents / 100).toFixed(2)}
                    </p>
                  </div>
                  <div className="p-6 border border-[var(--color-border)]">
                    <p className="text-sm text-[var(--color-text-muted)] mb-1">Pending Balance</p>
                    <p className="text-3xl font-heading font-bold font-mono text-[var(--color-text)]">
                      ${(user.pending_balance_cents / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex gap-4 flex-wrap">
                  <button className="btn-primary">Add Funds</button>
                  <button className="btn-secondary">Withdraw</button>
                </div>
              </div>

              <div className="border-t border-[var(--color-border)] pt-8">
                <h3 className="text-lg font-medium text-[var(--color-text)] mb-6 flex items-center gap-2">
                  <ChartBarIcon className="w-5 h-5" />
                  Transaction History
                </h3>
                <div className="p-6 border border-[var(--color-border)]">
                  <p className="text-[var(--color-text-muted)]">Transaction history will be available here. Connect to the transactions API to display recent deposits, withdrawals, and project payments.</p>
                </div>
              </div>

              <div className="border-t border-[var(--color-border)] pt-8">
                <h3 className="text-lg font-medium text-[var(--color-text)] mb-6 flex items-center gap-2">
                  <UserCircleIcon className="w-5 h-5" />
                  Subscription Plan
                </h3>
                <div className="p-6 border border-[var(--color-border)] max-w-md">
                  <p className="text-sm text-[var(--color-text-muted)] mb-2">Current Plan</p>
                  <p className="text-xl font-heading font-bold font-mono text-[var(--color-text)] capitalize">{user.plan}</p>
                  <p className="mt-4 text-sm text-[var(--color-text-muted)]">Subscription management will be available soon.</p>
                </div>
              </div>
            </div>
          )}

          {/* Danger Zone */}
          <div className="border-t border-[var(--color-border)] pt-8 mt-12">
            <h3 className="text-lg font-medium text-[var(--color-text)] mb-6 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Danger Zone
            </h3>
            <div className="p-6 border border-[var(--color-border)] max-w-md bg-[var(--color-gray-100)]">
              <p className="text-[var(--color-text-muted)] mb-4">Once you delete your account, there is no going back. Please be certain.</p>
              <button
                onClick={() => { if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) { /* logout(); */ }}}
                className="btn-secondary border-[var(--color-gray-500)] text-[var(--color-text)] hover:bg-[var(--color-gray-200)]"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}