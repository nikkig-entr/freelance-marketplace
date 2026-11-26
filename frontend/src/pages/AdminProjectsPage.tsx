import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { api, adminService } from '@/services/api';
import { Project, ProjectStatus } from '@/types';
import { formatDate, formatCurrency } from '@/utils/format';
import toast from 'react-hot-toast';

interface PaginatedProjects {
  items: Project[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

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

const statusColors: Record<ProjectStatus, 'primary' | 'secondary' | 'outline' | 'danger'> = {
  draft: 'secondary',
  open: 'primary',
  in_progress: 'primary',
  in_review: 'secondary',
  completed: 'primary',
  cancelled: 'danger',
  disputed: 'danger',
};

export function AdminProjectsPage() {
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
    queryFn: () => adminService.getProjects(filters) as Promise<PaginatedProjects>,
  });

  const { mutate: updateProject } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Project> }) => api.patch(`/admin/projects/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      toast.success('Project updated!');
      setSelectedProject(null);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Failed to update project');
    },
  });

  const { mutate: deleteProject } = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      toast.success('Project deleted!');
      setShowDeleteModal(false);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Failed to delete project');
    },
  });

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
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

  const hasActiveFilters = (['status', 'search'] as const).some(key => filters[key]);

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
      return `${formatCurrency(project.budget_min)} - ${formatCurrency(project.budget_max)}`;
    } else if (project.budget_min) {
      return `From ${formatCurrency(project.budget_min)}`;
    } else if (project.budget_max) {
      return `Up to ${formatCurrency(project.budget_max)}`;
    }
    return 'Negotiable';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[var(--color-text)]">Project Management</h1>
          <p className="mt-1 text-[var(--color-text-muted)]">
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
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-4 px-6 py-4">
                <div className="h-4 bg-[var(--color-surface-muted)] rounded w-48" />
                <div className="h-4 bg-[var(--color-surface-muted)] rounded w-32 ml-auto" />
              </div>
            ))}
          </div>
        ) : data?.items.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-[var(--color-text-subtle)]" />
            <h3 className="text-lg font-medium text-[var(--color-text)] mb-1">No projects found</h3>
            <p className="text-[var(--color-text-muted)] mb-4">
              {hasActiveFilters ? 'Try adjusting your filters' : 'No projects yet'}
            </p>
            {hasActiveFilters && <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--color-surface-muted)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Budget</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Bids</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Views</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Featured</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {data?.items.map((project) => (
                    <tr key={project.id} className="hover:bg-[var(--color-surface-muted)]">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-[var(--color-text)] truncate max-w-xs">{project.title}</p>
                          <p className="text-sm text-[var(--color-text-muted)] truncate max-w-xs">{project.category}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[var(--color-text)]">{project.client?.full_name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={statusColors[project.status]} size="sm">
                          {project.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-[var(--color-text)]">{budgetText(project)}</td>
                      <td className="px-6 py-4 text-[var(--color-text)]">{project.bids_count}</td>
                      <td className="px-6 py-4 text-[var(--color-text)]">{project.views_count}</td>
                      <td className="px-6 py-4">
                        {project.is_featured ? (
                          <Badge variant="secondary" size="sm"><StarIcon className="w-3 h-3 mr-1" /> Yes</Badge>
                        ) : (
                          <Badge variant="outline" size="sm">No</Badge>
                        )}
                        {project.is_urgent && <Badge variant="danger" size="sm" className="ml-1">Urgent</Badge>}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--color-text-muted)]">
                        {formatDate(project.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditModal(project)}>
                            <PencilIcon className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => { setSelectedProject(project); setShowDeleteModal(true); }}>
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
              <div className="border-t border-[var(--color-border)] px-6 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[var(--color-text-muted)]">
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
                className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]"
              />
              <label htmlFor="is_featured" className="text-sm font-medium text-[var(--color-text)]">Featured Project</label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_urgent"
                checked={editForm.is_urgent}
                onChange={(e) => setEditForm({ ...editForm, is_urgent: e.target.checked })}
                className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]"
              />
              <label htmlFor="is_urgent" className="text-sm font-medium text-[var(--color-text)]">Urgent</label>
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