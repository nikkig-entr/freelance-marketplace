import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { Input, Select } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { api, adminService } from '@/services/api';
import { User, UserRole, UserPlan } from '@/types';
import { formatDate, formatCurrency } from '@/utils/format';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

interface PaginatedUsers {
  items: User[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

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

const roleBadgeVariants: Record<UserRole, string> = {
  client: 'border-white/15',
  freelancer: 'border-white',
  admin: 'border-white',
};

const statusBadgeVariants: Record<string, string> = {
  active: 'border-white',
  inactive: 'border-white/15',
  suspended: 'border-white',
  pending_verification: 'border-white/15',
  true: 'border-white',
  false: 'border-white/15',
};

const planBadgeVariants: Record<UserPlan, string> = {
  starter: 'border-white/15',
  pro: 'border-white',
  agency: 'border-white',
};

export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
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
    queryFn: () => adminService.getUsers(filters) as Promise<PaginatedUsers>,
  });

  const { mutate: updateUser } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<User> }) => api.patch(`/admin/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User updated!');
      setSelectedUser(null);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Failed to update user');
    },
  });

  const { mutate: deleteUser } = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User deleted!');
      setShowDeleteModal(false);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Failed to delete user');
    },
  });

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
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

  const hasActiveFilters = (['role', 'plan', 'status', 'search'] as const).some(key => filters[key]);

  const openEditModal = (userItem: User) => {
    setSelectedUser(userItem);
    setEditForm({
      role: userItem.role,
      plan: userItem.plan,
      is_active: userItem.is_active,
      is_verified: userItem.is_verified,
    });
  };

  const handleEditSubmit = () => {
    if (selectedUser) {
      updateUser({ id: selectedUser.id, data: editForm });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] container py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-[var(--color-text)] text-3xl">User Management</h1>
          <p className="mt-1 text-[var(--color-text-muted)] font-[Instrument_Serif] italic">
            {data?.total || 0} user{data?.total !== 1 ? 's' : ''} found
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-colors flex items-center gap-2"
        >
          <FunnelIcon className="w-4 h-4" />
          Filters {hasActiveFilters && <span className="border border-white/15 px-2 py-0.5 font-mono text-xs uppercase tracking-[0.2em]">Active</span>}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="border border-white/15 p-6 animate-slide-down">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
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
              <button
                onClick={clearFilters}
                className="border border-white/15 px-4 py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-colors w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="border border-white/15 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-4 px-6 py-4 border-b border-white/15">
                <div className="h-4 bg-white/10 rounded w-48" />
                <div className="h-4 bg-white/10 rounded w-32 ml-auto" />
              </div>
            ))}
          </div>
        ) : data?.items.length === 0 ? (
          <div className="text-center py-12">
            <UserIcon className="w-16 h-16 mx-auto mb-4 text-[var(--color-text-subtle)]" />
            <h3 className="font-heading font-medium text-[var(--color-text)] text-xl mb-1">No users found</h3>
            <p className="text-[var(--color-text-muted)] mb-4">
              {hasActiveFilters ? 'Try adjusting your filters' : 'No users registered yet'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/15">
                  <tr>
                    <th className="px-6 py-4 text-left font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">User</th>
                    <th className="px-6 py-4 text-left font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Role</th>
                    <th className="px-6 py-4 text-left font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Plan</th>
                    <th className="px-6 py-4 text-left font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Status</th>
                    <th className="px-6 py-4 text-left font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Verified</th>
                    <th className="px-6 py-4 text-left font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Balance</th>
                    <th className="px-6 py-4 text-left font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Earnings</th>
                    <th className="px-6 py-4 text-left font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Joined</th>
                    <th className="px-6 py-4 text-right font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/15">
                  {data?.items.map((userItem) => (
                    <tr key={userItem.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={userItem.full_name || 'User'}
                            src={userItem.avatar_url}
                            size="md"
                          />
                          <div>
                            <p className="font-medium text-[var(--color-text)]">{userItem.full_name ?? 'Unknown'}</p>
                            <p className="text-sm text-[var(--color-text-muted)]">{userItem.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 text-sm font-mono text-[var(--color-text)] ${roleBadgeVariants[userItem.role]}`}>
                          {userItem.role.charAt(0).toUpperCase() + userItem.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 text-sm font-mono text-[var(--color-text)] ${planBadgeVariants[userItem.plan]}`}>
                          {userItem.plan.charAt(0).toUpperCase() + userItem.plan.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 text-sm font-mono text-[var(--color-text)] ${statusBadgeVariants[userItem.is_active ? 'true' : 'false']}`}>
                          {userItem.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {userItem.is_verified ? (
                          <span className="inline-flex items-center px-3 py-1 text-sm font-mono text-[var(--color-text)] border border-white">✓ Verified</span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 text-sm font-mono text-[var(--color-text)] border border-white/15">Not Verified</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-[var(--color-text)] font-mono">{formatCurrency(userItem.balance_cents)}</td>
                      <td className="px-6 py-4 text-[var(--color-text)] font-mono">{formatCurrency(userItem.pending_balance_cents)}</td>
                      <td className="px-6 py-4 text-sm text-[var(--color-text-muted)] font-mono">
                        {formatDate(userItem.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(userItem)}
                            className="p-2 text-[var(--color-text-muted)] hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          {user && userItem.id !== user.id && (
                            <button
                              onClick={() => { setSelectedUser(userItem); setShowDeleteModal(true); }}
                              className="p-2 text-[var(--color-gray-500)] hover:text-white hover:bg-white/5 transition-colors"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
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
              <div className="border-t border-white/15 px-6 py-4">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-xs text-[var(--color-text-muted)]">
                    Showing {(filters.page - 1) * filters.page_size + 1} to {Math.min(filters.page * filters.page_size, data.total)} of {data.total} users
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                      disabled={filters.page === 1}
                      className="border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                      disabled={filters.page === data.total_pages}
                      className="border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit User Modal */}
      {selectedUser && (
        <Modal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          title="Edit User"
          description={`Editing ${selectedUser.full_name} (@${selectedUser.email})`}
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
                { value: 'true', label: 'Active' },
                { value: 'false', label: 'Inactive' },
              ]}
              value={String(editForm.is_active ?? true)}
              onChange={(e) => setEditForm({ ...editForm, is_active: e.target.value === 'true' })}
            />
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_verified"
                checked={editForm.is_verified}
                onChange={(e) => setEditForm({ ...editForm, is_verified: e.target.checked })}
                className="h-4 w-4 border border-white/30 bg-transparent appearance-none"
              />
              <label htmlFor="is_verified" className="text-sm font-medium text-[var(--color-text)]">Email Verified</label>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-white/15">
              <button
                onClick={() => setSelectedUser(null)}
                className="border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                className="border border-white px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors"
              >
                Save Changes
              </button>
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