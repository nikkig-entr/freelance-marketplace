import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { LoadingSpinner, ListLoader } from '@/components/ui/LoadingSpinner';
import { adminService } from '@/services/api';
import { Project, ProjectStatus } from '@/types';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'closed', label: 'Closed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const sortOptions = [
  { value: 'created_at:desc', label: 'Newest First' },
  { value: 'created_at:asc', label: 'Oldest First' },
  { value: 'title:asc', label: 'Title A-Z' },
  { value: 'budget_min:desc', label: 'Budget High-Low' },
  { value: 'bids_count:desc', label: 'Most Bids' },
  { value: 'views_count:desc', label: 'Most Views' },
];

export function AdminProjectsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    page: 1,
    page_size: 20,
    status: '',
    search: '',
    sort: 'created_at:desc',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Project>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['admin-projects', filters],
    queryFn: () => adminService.listProjects(filters),
    enabled: !!user && user.role === 'admin',
  });

  const { mutate: updateProject } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Project> }) => adminService.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      toast.success('Project updated!');
      setSelectedProject(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update project');
    },
  });

  const { mutate: deleteProject } = useMutation({
    mutationFn: (id: number) => adminService.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      toast.success('Project deleted!');
      setShowDeleteModal(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete project');
    },
  });

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      page_size: 20,
      status: '',
      search: '',
      sort: 'created_at:desc',
    });
  };

  const hasActiveFilters = ['status', 'search'].some(key => filters[key]);

  const openEditModal = (project: Project) => {
    setSelectedProject(project);
    setEditForm({
      status: project.status,
      is_featured: project.is_featured,
      is_urgent: project.is_urgent,
    });
  };

  const handleEditSubmit = () => {
    if (selectedProject) {
      updateProject({ id: selectedProject.id, data: editForm });
    }
  };

  const budgetText = (project: Project) => {
    if (project.budget_min && project.budget_max) {
      return `$${(project.budget_min / 100).toLocaleString()} - $${(project.budget_max / 100).toLocaleString()}`;
    } else if (project.budget_min) {
      return `From $${(project.budget_min / 100).toLocaleString()}`;
    } else if (project.budget_max) {
      return `Up to $${(project.budget_max / 100).toLocaleString()}`;
    }
    return 'Negotiable';
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
          <h1 className="text-2xl font-heading font-bold text-secondary-900">Project Management</h1>
          <p className="mt-1 text-secondary-600">
            {data?.total || 0} project{data?.total !== 1 ? 's' : ''} found
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} leftIcon={<FunnelIcon className="w-4 h-4" />}>
          Filters {hasActiveFilters && <Badge variant="primary" size="sm">Active</Badge>}
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="animate-slide-down">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 p-6">
            <Input
              label="Search"
              placeholder="Title, description..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              leftIcon={<MagnifyingGlassIcon className="w-4 h-4" />}
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

      {/* Projects Table */}
      <Card padding="none">
        {isLoading ? (
          <ListLoader count={10} />
        ) : data?.items.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-secondary-300" />
            <h3 className="text-lg font-medium text-secondary-900 mb-1">No projects found</h3>
            <p className="text-secondary-600 mb-4">
              {hasActiveFilters ? 'Try adjusting your filters' : 'No projects yet'}
            </p>
            {hasActiveFilters && <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Budget</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Bids</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Views</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Featured</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-200">
                  {data.items.map((project) => (
                    <tr key={project.id} className="hover:bg-secondary-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-secondary-900 truncate max-w-xs">{project.title}</p>
                          <p className="text-sm text-secondary-500 truncate max-w-xs">{project.category}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-secondary-900">{project.client?.full_name || 'Unknown'}</span>
                          <span className="text-xs text-secondary-400">@{project.client?.username || ''}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={project.status} size="sm" />
                      </td>
                      <td className="px-6 py-4 text-secondary-900">{budgetText(project)}</td>
                      <td className="px-6 py-4 text-secondary-900">{project.bids_count}</td>
                      <td className="px-6 py-4 text-secondary-900">{project.views_count}</td>
                      <td className="px-6 py-4">
                        {project.is_featured ? (
                          <Badge variant="warning" size="sm"><StarIcon className="w-3 h-3 mr-1" /> Yes</Badge>
                        ) : (
                          <Badge variant="outline" size="sm">No</Badge>
                        )}
                        {project.is_urgent && <Badge variant="danger" size="sm" className="ml-1">Urgent</Badge>}
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-500">
                        {format(new Date(project.created_at), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditModal(project)}>
                            <PencilIcon className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setShowDeleteModal(true)}>
                            <TrashIcon className="w-4 h-4" />
                          </Button>
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
                    Showing {(filters.page - 1) * filters.page_size + 1} to {Math.min(filters.page * filters.page_size, data.total)} of {data.total} projects
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

      {/* Edit Project Modal */}
      {selectedProject && (
        <Modal
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          title="Edit Project"
          description={`Editing: ${selectedProject.title}`}
          size="lg"
        >
          <div className="space-y-4">
            <Select
              label="Status"
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'open', label: 'Open' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'completed', label: 'Completed' },
                { value: 'closed', label: 'Closed' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value as ProjectStatus })}
            />
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_featured"
                checked={editForm.is_featured}
                onChange={(e) => setEditForm({ ...editForm, is_featured: e.target.checked })}
                className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
              />
              <label htmlFor="is_featured" className="text-sm font-medium text-secondary-700">Featured Project</label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_urgent"
                checked={editForm.is_urgent}
                onChange={(e) => setEditForm({ ...editForm, is_urgent: e.target.checked })}
                className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
              />
              <label htmlFor="is_urgent" className="text-sm font-medium text-secondary-700">Urgent</label>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setSelectedProject(null)}>Cancel</Button>
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
          if (selectedProject) {
            deleteProject(selectedProject.id);
          }
        }}
        title="Delete Project"
        message={`Are you sure you want to delete "${selectedProject?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}