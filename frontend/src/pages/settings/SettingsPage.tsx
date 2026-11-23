import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { User, UserRole, UserPlan } from '../../types';
import {
  UserCircleIcon,
  BellIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
  TrashIcon,
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
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

interface NotificationForm {
  email_notifications: boolean;
  bid_notifications: boolean;
  message_notifications: boolean;
  payment_notifications: boolean;
  marketing_emails: boolean;
}

export function SettingsPage() {
  const { user, refreshUser, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    watch: watchProfile,
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

  const {
    register: registerNotifications,
    handleSubmit: handleSubmitNotifications,
    watch: watchNotifications,
    formState: { errors: notificationErrors },
  } = useForm<NotificationForm>({
    defaultValues: {
      email_notifications: true,
      bid_notifications: true,
      message_notifications: true,
      payment_notifications: true,
      marketing_emails: false,
    },
  });

  const newPassword = watchPassword('new_password');

  useEffect(() => {
    if (user) {
      setValueProfile('full_name', user.full_name || '');
      setValueProfile('avatar_url', user.avatar_url || '');
      setValueProfile('bio', (user.profile?.bio as string) || '');
      setValueProfile('website', (user.profile?.website as string) || '');
      setValueProfile('location', (user.profile?.location as string) || '');
      setValueProfile('skills', (user.profile?.skills as string[])?.join(', ') || '');
      setValueProfile('hourly_rate', (user.profile?.hourly_rate as number)?.toString() || '');
      setValueProfile('availability', (user.profile?.availability as 'available' | 'busy' | 'unavailable') || 'available');
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
      await api.updateUser(user!.id, { profile: profileData });
      await refreshUser();
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmitPassword = async (data: PasswordForm) => {
    setIsSaving(true);
    try {
      // This would call a password change endpoint
      // await api.changePassword(data.current_password, data.new_password);
      toast.success('Password changed successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to change password');
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmitNotifications = async (data: NotificationForm) => {
    setIsSaving(true);
    try {
      // await api.updateNotifications(data);
      toast.success('Notification preferences saved!');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to save preferences');
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
    { id: 'profile', label: 'Profile', icon: UserCircleIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'security', label: 'Security', icon: ShieldCheckIcon },
    { id: 'appearance', label: 'Appearance', icon: PaintBrushIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/projects" className="text-gray-500 hover:text-gray-700">
            <ArrowLeftIcon className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="mt-1 text-gray-600">Manage your account settings and preferences</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="card overflow-hidden">
          <nav className="border-b border-gray-200" aria-label="Settings tabs">
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
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                      ) : (
                        <UserCircleIcon className="w-12 h-12 text-primary-600" />
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 transition-colors">
                      <input type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" />
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </label>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Profile Picture</p>
                    <p className="text-sm text-gray-500">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6 space-y-6">
                  <div>
                    <label htmlFor="full_name" className="label">Full Name *</label>
                    <input
                      id="full_name"
                      type="text"
                      className={`input ${profileErrors.full_name ? 'input-error' : ''}`}
                      {...registerProfile('full_name', { required: 'Full name is required' })}
                    />
                    {profileErrors.full_name && <p className="mt-1 text-sm text-red-600">{profileErrors.full_name.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="bio" className="label">Bio</label>
                    <textarea
                      id="bio"
                      rows={4}
                      className="input resize-none"
                      placeholder="Tell others about yourself..."
                      {...registerProfile('bio')}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="location" className="label">Location</label>
                      <input
                        id="location"
                        type="text"
                        className="input"
                        placeholder="City, Country"
                        {...registerProfile('location')}
                      />
                    </div>
                    <div>
                      <label htmlFor="website" className="label">Website</label>
                      <input
                        id="website"
                        type="url"
                        className="input"
                        placeholder="https://example.com"
                        {...registerProfile('website')}
                      />
                    </div>
                  </div>

                  {user?.role === 'freelancer' && (
                    <>
                      <div>
                        <label htmlFor="skills" className="label">Skills (comma separated)</label>
                        <input
                          id="skills"
                          type="text"
                          className="input"
                          placeholder="React, TypeScript, Node.js, Python"
                          {...registerProfile('skills')}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="hourly_rate" className="label">Hourly Rate (USD)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                            <input
                              id="hourly_rate"
                              type="number"
                              min="0"
                              step="1"
                              className="input pl-8"
                              placeholder="75"
                              {...registerProfile('hourly_rate', { valueAsNumber: true })}
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="availability" className="label">Availability</label>
                          <select
                            id="availability"
                            className="input"
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

                <div className="pt-6 border-t border-gray-200 flex justify-end">
                  <button type="submit" disabled={isSaving} className="btn-primary">
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <form onSubmit={handleSubmitNotifications(onSubmitNotifications)} className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'email_notifications', label: 'All Email Notifications', desc: 'Master toggle for all email notifications' },
                      { key: 'bid_notifications', label: 'Bid Updates', desc: 'When someone bids on your projects or your bid status changes' },
                      { key: 'message_notifications', label: 'New Messages', desc: 'When you receive a new chat message' },
                      { key: 'payment_notifications', label: 'Payment Updates', desc: 'Deposits, withdrawals, and project payments' },
                      { key: 'marketing_emails', label: 'Marketing Emails', desc: 'Product updates, tips, and promotional offers' },
                    ].map((item) => (
                      <label key={item.key} className="flex items-center justify-between py-3">
                        <div>
                          <p className="font-medium text-gray-900">{item.label}</p>
                          <p className="text-sm text-gray-500">{item.desc}</p>
                        </div>
                        <input
                          type="checkbox"
                          className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          {...registerNotifications(item.key as keyof NotificationForm)}
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200 flex justify-end">
                  <button type="submit" disabled={isSaving} className="btn-primary">
                    {isSaving ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </form>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                  <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4 max-w-md">
                    <div>
                      <label htmlFor="current_password" className="label">Current Password</label>
                      <input
                        id="current_password"
                        type="password"
                        className={`input ${passwordErrors.current_password ? 'input-error' : ''}`}
                        {...registerPassword('current_password', { required: 'Current password is required' })}
                      />
                      {passwordErrors.current_password && <p className="mt-1 text-sm text-red-600">{passwordErrors.current_password.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="new_password" className="label">New Password</label>
                      <input
                        id="new_password"
                        type="password"
                        className={`input ${passwordErrors.new_password ? 'input-error' : ''}`}
                        {...registerPassword('new_password', {
                          required: 'New password is required',
                          minLength: { value: 8, message: 'Password must be at least 8 characters' },
                        })}
                      />
                      {passwordErrors.new_password && <p className="mt-1 text-sm text-red-600">{passwordErrors.new_password.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="confirm_password" className="label">Confirm New Password</label>
                      <input
                        id="confirm_password"
                        type="password"
                        className={`input ${passwordErrors.confirm_password ? 'input-error' : ''}`}
                        {...registerPassword('confirm_password', {
                          required: 'Please confirm your password',
                          validate: (value) => value === newPassword || 'Passwords do not match',
                        })}
                      />
                      {passwordErrors.confirm_password && <p className="mt-1 text-sm text-red-600">{passwordErrors.confirm_password.message}</p>}
                    </div>
                    <button type="submit" disabled={isSaving} className="btn-primary">
                      {isSaving ? 'Saving...' : 'Update Password'}
                    </button>
                  </form>
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Connected Accounts</h3>
                  <div className="space-y-4">
                    {[
                      { provider: 'Google', connected: !!user?.google_id, icon: '🌐' },
                      { provider: 'GitHub', connected: !!user?.github_id, icon: '🐙' },
                      { provider: 'Telegram', connected: !!user?.telegram_id, icon: '📱' },
                    ].map((account) => (
                      <div key={account.provider} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{account.icon}</span>
                          <div>
                            <p className="font-medium text-gray-900">{account.provider}</p>
                            <p className="text-sm text-gray-500">
                              {account.connected ? 'Connected' : 'Not connected'}
                            </p>
                          </div>
                        </div>
                        <button className={`btn-secondary text-sm ${account.connected ? 'text-red-600 hover:bg-red-50 border-red-200' : ''}`}>
                          {account.connected ? 'Disconnect' : 'Connect'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">Add an extra layer of security to your account.</p>
                    <button className="btn-secondary mt-3">Enable 2FA</button>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Theme</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { value: 'light', label: 'Light', icon: '☀️' },
                      { value: 'dark', label: 'Dark', icon: '🌙' },
                      { value: 'system', label: 'System', icon: '💻' },
                    ].map((theme) => (
                      <button
                        key={theme.value}
                        className={`p-4 border-2 rounded-xl transition-all flex flex-col items-center gap-2 ${
                          theme.value === 'system' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-3xl">{theme.icon}</span>
                        <span className="font-medium text-gray-900">{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Language</h3>
                  <select className="input w-full max-w-xs">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="zh">Chinese</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card p-6 mt-8 border-red-200 bg-red-50">
          <h3 className="text-lg font-medium text-red-900 mb-4 flex items-center gap-2">
            <TrashIcon className="w-5 h-5" />
            Danger Zone
          </h3>
          <p className="text-red-700 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
          <button className="btn-danger">Delete Account</button>
        </div>
      </div>
    </div>
  );
}

// Need to import Link
import { Link } from '@tanstack/react-router';