import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  UserIcon,
  BriefcaseIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge, StatusBadge, PlanBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { LoadingSpinner, ListLoader } from '@/components/ui/LoadingSpinner';
import { adminService, userService } from '@/services/api';
import { User, UserRole, UserPlan, UserStatus } from '@/types';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const roleOptions = [
  { value: '', label: 'All Roles' },
  { value: 'client', label: 'Client' },
  { value: 'freelancer', label: 'Freelancer' },
  { value: 'admin', label: 'Admin' },
];

const planOptions = [
  { value: '', label: 'All Plans' },
  { value: 'starter', label: 'Starter' },
  { value: 'pro', label: 'Pro' },
  { value: 'agency', label: 'Agency' },
];

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'pending_verification', label: 'Pending Verification' },
];

const sortOptions = [
  { value: 'created_at:desc', label: 'Newest First' },
  { value: 'created_at:asc', label: 'Oldest First' },
  { value: 'email:asc', label: 'Email A-Z' },
  { value: 'full_name:asc', label: 'Name A-Z' },
  { value: 'balance_cents:desc', label: 'Balance High-Low' },
  { value: 'total_earned_cents:desc', label: 'Earnings High-Low' },
];

export function AdminUsersPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    page: 1,
    page_size: 20,
    role: '',
    plan: '',
    status: '',
    search: '',
    sort: 'created_at:desc',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', filters],
    queryFn: () => adminService.listUsers(filters),
    enabled: !!user && user.role === 'admin',
  });

  const { mutate: updateUser } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<User> }) => adminService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User updated!');
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update user');
    },
  });

  const { mutate: deleteUser } = useMutation({
    mutationFn: (id: number) => adminService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User deleted!');
      setShowDeleteModal(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete user');
    },
  });

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      page_size: 20,
      role: '',
      plan: '',
      status: '',
      search: '',
      sort: 'created_at:desc',
    });
  };

  const hasActiveFilters = ['role', 'plan', 'status', 'search'].some(key => filters[key]);

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      role: user.role,
      plan: user.plan,
      status: user.status,
      is_verified: user.is_verified,
      email_notifications: user.email_notifications,
    });
  };

  const handleEditSubmit = () => {
    if (selectedUser) {
      updateUser({ id: selectedUser.id, data: editForm });
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-secondary-900">Access Denied</h1>
        <p className="mt-2 text-secondary-600">Admin access required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-secondary-900">User Management</h1>
          <p className="mt-1 text-secondary-600">
            {data?.total || 0} user{data?.total !== 1 ? 's' : ''} found
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} leftIcon={<FunnelIcon className="w-4 h-4" />}>
          Filters {hasActiveFilters && <Badge variant="primary" size="sm">Active</Badge>}
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="animate-slide-down">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 p-6">
            <Input
              label="Search"
              placeholder="Name, email, username..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              leftIcon={<MagnifyingGlassIcon className="w-4 h-4" />}
            />
            <Select
              label="Role"
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              options={roleOptions}
            />
            <Select
              label="Plan"
              value={filters.plan}
              onChange={(e) => handleFilterChange('plan', e.target.value)}
              options={planOptions}
            />
            <Select
              label="Status"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              options={statusOptions}
            />
            <Select
              label="Sort By"
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              options={sortOptions}
            />
            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} fullWidth>
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Users Table */}
      <Card padding="none">
        {isLoading ? (
          <ListLoader count={10} />
        ) : data?.items.length === 0 ? (
          <div className="text-center py-12">
            <UserIcon className="w-16 h-16 mx-auto mb-4 text-secondary-300" />
            <h3 className="text-lg font-medium text-secondary-900 mb-1">No users found</h3>
            <p className="text-secondary-600 mb-4">
              {hasActiveFilters ? 'Try adjusting your filters' : 'No users registered yet'}
            </p>
            {hasActiveFilters && <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Verified</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Balance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Earnings</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-200">
                  {data.items.map((userItem) => (
                    <tr key={userItem.id} className="hover:bg-secondary-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={userItem.full_name}
                            src={userItem.avatar_url}
                            size="md"
                          />
                          <div>
                            <p className="font-medium text-secondary-900">{userItem.full_name}</p>
                            <p className="text-sm text-secondary-500">@{userItem.username}</p>
                            <p className="text-xs text-secondary-400">{userItem.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={
                          userItem.role === 'admin' ? 'danger' :
                          userItem.role === 'client' ? 'secondary' : 'primary'
                        }>
                          {userItem.role.charAt(0).toUpperCase() + userItem.role.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <PlanBadge plan={userItem.plan} size="sm" />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={userItem.status} size="sm" />
                      </td>
                      <td className="px-6 py-4">
                        {userItem.is_verified ? (
                          <Badge variant="success" size="sm">✓ Verified</Badge>
                        ) : (
                          <Badge variant="outline" size="sm">Not Verified</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-secondary-900">
                        ${(userItem.balance_cents / 100).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-secondary-900">
                        ${(userItem.total_earned_cents / 100).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-500">
                        {format(new Date(userItem.created_at), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditModal(userItem)}>
                            <PencilIcon className="w-4 h-4" />
                          </Button>
                          {userItem.id !== user.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-danger-600 hover:bg-danger-50"
                              onClick={() => setShowDeleteModal(true)}
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data && data.total_pages > 1 && (
              <div className="border-t border-secondary-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-secondary-600">
                    Showing {(filters.page - 1) * filters.page_size + 1} to {Math.min(filters.page * filters.page_size, data.total)} of {data.total} users
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={filters.page === 1}
                      onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={filters.page === data.total_pages}
                      onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Edit User Modal */}
      {selectedUser && (
        <Modal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          title="Edit User"
          description={`Editing ${selectedUser.full_name} (@${selectedUser.username})`}
          size="lg"
        >
          <div className="space-y-4">
            <Select
              label="Role"
              options={[
                { value: 'client', label: 'Client' },
                { value: 'freelancer', label: 'Freelancer' },
                { value: 'admin', label: 'Admin' },
              ]}
              value={editForm.role}
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })}
            />
            <Select
              label="Plan"
              options={[
                { value: 'starter', label: 'Starter' },
                { value: 'pro', label: 'Pro' },
                { value: 'agency', label: 'Agency' },
              ]}
              value={editForm.plan}
              onChange={(e) => setEditForm({ ...editForm, plan: e.target.value as UserPlan })}
            />
            <Select
              label="Status"
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'suspended', label: 'Suspended' },
                { value: 'pending_verification', label: 'Pending Verification' },
              ]}
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value as UserStatus })}
            />
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_verified"
                checked={editForm.is_verified}
                onChange={(e) => setEditForm({ ...editForm, is_verified: e.target.checked })}
                className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
              />
              <label htmlFor="is_verified" className="text-sm font-medium text-secondary-700">Email Verified</label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="email_notifications"
                checked={editForm.email_notifications}
                onChange={(e) => setEditForm({ ...editForm, email_notifications: e.target.checked })}
                className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
              />
              <label htmlFor="email_notifications" className="text-sm font-medium text-secondary-700">Email Notifications</label>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setSelectedUser(null)}>Cancel</Button>
              <Button onClick={handleEditSubmit}>Save Changes</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          if (selectedUser) {
            deleteUser(selectedUser.id);
          }
        }}
        title="Delete User"
        message={`Are you sure you want to delete ${selectedUser?.full_name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}