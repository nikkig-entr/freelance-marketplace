import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BellIcon, ShieldCheckIcon, MoonIcon, GlobeAltIcon, CreditCardIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { Switch } from '@/components/ui/Switch';
import { userService } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

type PasswordForm = z.infer<typeof passwordSchema>;

const notificationTypes = [
  { key: 'email_notifications', label: 'Email Notifications', description: 'Receive email updates about your account', icon: BellIcon },
  { key: 'push_notifications', label: 'Push Notifications', description: 'Receive browser push notifications', icon: BellIcon },
  { key: 'marketing_emails', label: 'Marketing Emails', description: 'Receive tips, updates, and promotions', icon: GlobeAltIcon },
];

export function SettingsPage() {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'notifications' | 'security' | 'billing' | 'appearance' | 'privacy'>('notifications');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
    reset: resetPassword,
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const { mutate: changePassword } = useMutation({
    mutationFn: (data: PasswordForm) => userService.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed successfully!');
      resetPassword();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to change password');
    },
  });

  const { mutate: updateNotifications } = useMutation({
    mutationFn: (data: Record<string, boolean>) => userService.updateProfile(data),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Notification preferences updated!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update preferences');
    },
  });

  const { mutate: toggle2FA } = useMutation({
    mutationFn: (enabled: boolean) => userService.toggle2FA(enabled),
    onSuccess: (data) => {
      updateUser({ ...user!, two_factor_enabled: data.enabled });
      toast.success(data.enabled ? '2FA enabled!' : '2FA disabled!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update 2FA');
    },
  });

  const { mutate: deleteAccount } = useMutation({
    mutationFn: () => userService.deleteAccount(),
    onSuccess: () => {
      toast.success('Account deleted');
      // Logout handled by auth context
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete account');
    },
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    updateNotifications({ [key]: value });
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-secondary-900">Settings</h1>
        <p className="mt-1 text-secondary-600">Manage your account settings and preferences</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-secondary-200">
        <nav className="flex flex-wrap gap-4" aria-label="Settings tabs">
          {[
            { id: 'notifications', label: 'Notifications', icon: BellIcon },
            { id: 'security', label: 'Security', icon: ShieldCheckIcon },
            { id: 'appearance', label: 'Appearance', icon: MoonIcon },
            { id: 'billing', label: 'Billing', icon: CreditCardIcon },
            { id: 'privacy', label: 'Privacy', icon: TrashIcon },
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

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <Card>
          <CardTitle title="Notification Preferences" subtitle="Choose how you want to be notified" />
          <div className="space-y-6">
            {notificationTypes.map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-secondary-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-secondary-900">{item.label}</p>
                    <p className="text-sm text-secondary-500">{item.description}</p>
                  </div>
                </div>
                <Switch
                  checked={user[item.key as keyof typeof user] as boolean}
                  onChange={(checked) => handleNotificationChange(item.key, checked)}
                />
              </div>
            ))}

            <div className="pt-6 border-t border-secondary-200">
              <h4 className="font-medium text-secondary-900 mb-4">Event Notifications</h4>
              <div className="space-y-3">
                {[
                  { label: 'New bids on my projects', description: 'When a freelancer bids on your project' },
                  { label: 'Bid accepted/rejected', description: 'When your bid status changes' },
                  { label: 'New messages', description: 'When you receive a new message' },
                  { label: 'Project updates', description: 'When project status changes' },
                  { label: 'Payments & withdrawals', description: 'When money moves in/out of your account' },
                  { label: 'Reviews received', description: 'When someone leaves you a review' },
                  { label: 'Weekly digest', description: 'Summary of your activity each week' },
                ].map((item, index) => (
                  <label key={index} className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="font-medium text-secondary-900">{item.label}</p>
                      <p className="text-sm text-secondary-500">{item.description}</p>
                    </div>
                    <Switch checked={true} onChange={() => {}} />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card>
            <CardTitle title="Password" subtitle="Change your password" />
            <form onSubmit={handleSubmitPassword(changePassword)} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                error={passwordErrors.current_password?.message}
                {...registerPassword('current_password')}
              />
              <Input
                label="New Password"
                type="password"
                error={passwordErrors.new_password?.message}
                {...registerPassword('new_password')}
              />
              <Input
                label="Confirm New Password"
                type="password"
                error={passwordErrors.confirm_password?.message}
                {...registerPassword('confirm_password')}
              />
              <Button type="submit" loading={isPasswordSubmitting}>
                Update Password
              </Button>
            </form>
          </Card>

          <Card>
            <CardTitle title="Two-Factor Authentication" subtitle="Add an extra layer of security to your account" />
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary-50">
              <div>
                <p className="font-medium text-secondary-900">Authenticator App</p>
                <p className="text-sm text-secondary-500">
                  {user.two_factor_enabled ? '2FA is enabled' : '2FA is disabled'}
                </p>
              </div>
              <Button
                variant={user.two_factor_enabled ? 'outline' : 'primary'}
                onClick={() => toggle2FA(!user.two_factor_enabled)}
                loading={false}
              >
                {user.two_factor_enabled ? 'Disable' : 'Enable'} 2FA
              </Button>
            </div>
            <div className="mt-4 p-4 rounded-xl bg-warning-50 border border-warning-100">
              <p className="text-sm text-warning-900">
                <strong>Backup codes:</strong> Save your backup codes in a safe place. You'll need them if you lose access to your authenticator app.
              </p>
              <Button variant="outline" size="sm" className="mt-2">View Backup Codes</Button>
            </div>
          </Card>

          <Card>
            <CardTitle title="Active Sessions" subtitle="Manage your logged-in sessions" />
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                    <GlobeAltIcon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-secondary-900">Current Session</p>
                    <p className="text-sm text-secondary-500">Chrome on Windows • Active now</p>
                  </div>
                </div>
                <Badge variant="success" size="sm">Current</Badge>
              </div>
              <div className="text-center py-4 text-secondary-500">
                No other active sessions
              </div>
              <Button variant="outline" fullWidth className="mt-4">Log Out of All Sessions</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <Card>
          <CardTitle title="Appearance" subtitle="Customize how the app looks" />
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-3">Theme</label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: 'light', label: 'Light', icon: '☀️' },
                  { value: 'dark', label: 'Dark', icon: '🌙' },
                  { value: 'system', label: 'System', icon: '💻' },
                ].map((theme) => (
                  <button
                    key={theme.value}
                    className={`relative p-4 rounded-xl border-2 transition-colors ${
                      'border-secondary-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{theme.icon}</div>
                    <p className="font-medium text-secondary-900">{theme.label}</p>
                    <input type="radio" name="theme" value={theme.value} className="sr-only" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-3">Language</label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: 'en', label: 'English' },
                  { value: 'es', label: 'Spanish' },
                  { value: 'fr', label: 'French' },
                  { value: 'de', label: 'German' },
                ].map((lang) => (
                  <button
                    key={lang.value}
                    className={`p-4 rounded-xl border-2 transition-colors ${
                      'border-secondary-200 hover:border-primary-300'
                    }`}
                  >
                    <p className="font-medium text-secondary-900">{lang.label}</p>
                    <input type="radio" name="language" value={lang.value} className="sr-only" />
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-secondary-200">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-secondary-700">Reduce motion</span>
              </label>
              <p className="text-sm text-secondary-500 mt-1 ml-7">Minimize animations and transitions</p>
            </div>
          </div>
        </Card>
      )}

      {/* Billing Tab */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <Card>
            <CardTitle title="Subscription" subtitle="Manage your plan" />
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary-50">
              <div>
                <p className="font-medium text-secondary-900 capitalize">{user.plan} Plan</p>
                <p className="text-sm text-secondary-500">
                  {user.plan === 'starter' ? 'Free forever' : '$29/month'}
                </p>
              </div>
              <Button variant="outline" size="sm">Manage Plan</Button>
            </div>
          </Card>

          <Card>
            <CardTitle title="Payment Methods" subtitle="Your saved payment methods" />
            <div className="text-center py-8">
              <CreditCardIcon className="w-12 h-12 mx-auto mb-3 text-secondary-300" />
              <p className="text-secondary-600 mb-4">No payment methods saved</p>
              <Button variant="outline" leftIcon={<CreditCardIcon className="w-4 h-4" />}>
                Add Payment Method
              </Button>
            </div>
          </Card>

          <Card>
            <CardTitle title="Billing History" subtitle="Your invoices and receipts" />
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-secondary-100 flex items-center justify-center mx-auto mb-3">
                <CreditCardIcon className="w-6 h-6 text-secondary-400" />
              </div>
              <p className="text-secondary-600 mb-4">No billing history yet</p>
            </div>
          </Card>
        </div>
      )}

      {/* Privacy Tab */}
      {activeTab === 'privacy' && (
        <div className="space-y-6">
          <Card>
            <CardTitle title="Data & Privacy" subtitle="Control your data" />
            <div className="space-y-4">
              <Button variant="outline" fullWidth leftIcon={<GlobeAltIcon className="w-4 h-4" />}>
                Download My Data
              </Button>
              <Button variant="outline" fullWidth leftIcon={<TrashIcon className="w-4 h-4" />}>
                Request Data Deletion
              </Button>
            </div>
          </Card>

          <Card>
            <CardTitle title="Delete Account" subtitle="Permanently delete your account and all data" />
            <div className="p-4 rounded-xl bg-danger-50 border border-danger-100">
              <p className="text-danger-900 mb-4">
                This action is irreversible. All your projects, bids, messages, reviews, and balance will be permanently deleted.
              </p>
              <Button
                variant="danger"
                onClick={() => setShowDeleteModal(true)}
                leftIcon={<TrashIcon className="w-4 h-4" />}
              >
                Delete My Account
              </Button>
            </div>
          </Card>

          <ConfirmModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={() => {
              deleteAccount();
              setShowDeleteModal(false);
            }}
            title="Delete Account"
            message="Are you absolutely sure you want to delete your account? This action cannot be undone. All your data will be permanently removed."
            confirmText="Delete Forever"
            variant="danger"
          />
        </div>
      )}
    </div>
  );
}