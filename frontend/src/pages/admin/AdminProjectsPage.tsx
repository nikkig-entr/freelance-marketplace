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
import { Input, Select } from '@/components/ui/Input';
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
    <div className="min-h-screen bg-[var(--color-bg)] container py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-[var(--color-text)] text-3xl">Project Management</h1>
          <p className="mt-1 text-[var(--color-text-muted)] font-[Instrument_Serif] italic">
            {data?.total || 0} project{data?.total !== 1 ? 's' : ''} found
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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

      {/* Projects Table */}
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
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-[var(--color-text-subtle)]" />
            <h3 className="font-heading font-medium text-[var(--color-text)] text-xl mb-1">No projects found</h3>
            <p className="text-[var(--color-text-muted)] mb-4">
              {hasActiveFilters ? 'Try adjusting your filters' : 'No projects yet'}
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
                    <th className="px-6 py-4 text-left font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Project</th>
                    <th className="px-6 py-4 text-left font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Client</th>
                    <th className="px-6 py-4 text-left font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Status</th>
                    <th className="px-6 py-4 text-left font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Budget</th>
                    <th className="px-6 py-4 text-left font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Bids</th>
                    <th className="px-6 py-4 text-left font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Views</th>
                    <th className="px-6 py-4 text-left font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Featured</th>
                    <th className="px-6 py-4 text-left font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Created</th>
                    <th className="px-6 py-4 text-right font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/15">
                  {data?.items.map((project) => (
                    <tr key={project.id} className="hover:bg-white/5 transition-colors">
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
                        <span className="inline-flex items-center px-3 py-1 text-sm font-mono text-[var(--color-text)] border border-white/15">
                          {project.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[var(--color-text)]">{budgetText(project)}</td>
                      <td className="px-6 py-4 text-[var(--color-text)] font-mono tabular-nums">{project.bids_count}</td>
                      <td className="px-6 py-4 text-[var(--color-text)] font-mono tabular-nums">{project.views_count}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {project.is_featured && (
                            <span className="border border-white/15 px-3 py-1 text-sm font-mono text-[var(--color-text)] flex items-center gap-1">
                              <StarIcon className="w-3 h-3" />
                              Yes
                            </span>
                          )}
                          {project.is_urgent && <span className="border border-white/15 px-3 py-1 text-sm font-mono text-[var(--color-text)]">Urgent</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--color-text-muted)] font-mono">
                        {formatDate(project.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(project)}
                            className="p-2 text-[var(--color-text-muted)] hover:text-white hover:bg-white/5 transition-colors"
                            title="Edit"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => { setSelectedProject(project); setShowDeleteModal(true); }}
                            className="p-2 text-[var(--color-gray-500)] hover:text-white hover:bg-white/5 transition-colors"
                            title="Delete"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
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
                    Showing {(filters.page - 1) * filters.page_size + 1} to {Math.min(filters.page * filters.page_size, data.total)} of {data.total} projects
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
                className="h-4 w-4 border border-white/30 bg-transparent appearance-none"
              />
              <label htmlFor="is_featured" className="text-sm font-medium text-[var(--color-text)]">Featured Project</label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_urgent"
                checked={editForm.is_urgent}
                onChange={(e) => setEditForm({ ...editForm, is_urgent: e.target.checked })}
                className="h-4 w-4 border border-white/30 bg-transparent appearance-none"
              />
              <label htmlFor="is_urgent" className="text-sm font-medium text-[var(--color-text)]">Urgent</label>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-white/15">
              <button
                onClick={() => setSelectedProject(null)}
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