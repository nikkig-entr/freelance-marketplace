import { useState, useEffect, useCallback } from 'react';
import { Link, useSearch } from '@tanstack/react-router';
import { projectService } from '@/services/api';
import { Project, ProjectStatus, formatCurrency, formatDate } from '@/types';
import {
  ArrowLeftIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  EyeIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface PaginatedProjects {
  items: Project[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

interface MyProjectsSearch {
  status?: ProjectStatus;
  search?: string;
}

interface FiltersState {
  status?: ProjectStatus;
  search?: string;
  page?: number;
}

function getStatusBadge(status: ProjectStatus) {
  const labels: Record<ProjectStatus, string> = {
    open: 'Open',
    in_progress: 'In Progress',
    in_review: 'In Review',
    completed: 'Completed',
    cancelled: 'Cancelled',
    disputed: 'Disputed',
    draft: 'Draft',
  };
  return (
    <span className="inline-flex items-center px-3 py-1 text-sm font-mono text-[var(--color-text)] border border-white/15">
      {labels[status] || status}
    </span>
  );
}

export function MyProjectsPage() {
  const search = useSearch({ strict: false }) as MyProjectsSearch;
  const [projects, setProjects] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FiltersState>({
    status: search.status,
    search: search.search || '',
    page: 1,
  });
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = { ...filters, page, page_size: pageSize };
      const data = await projectService.list<PaginatedProjects>(params);
      setProjects(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.total_pages || 0);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  }, [filters, page, pageSize]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }
    setDeletingId(id);
    try {
      await projectService.delete(String(id));
      toast.success('Project deleted');
      fetchProjects();
    } catch {
      toast.error('Failed to delete project');
    } finally {
      setDeletingId(null);
    }
  };

  const handlePublish = async (id: number) => {
    try {
      await projectService.publish(String(id));
      toast.success('Project published!');
      fetchProjects();
    } catch {
      toast.error('Failed to publish project');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
          <div className="flex items-center gap-4">
            <Link to="/projects" className="text-[var(--color-text-subtle)] hover:text-[var(--color-text)] transition-colors">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="font-heading font-bold text-[var(--color-text)] text-[clamp(2rem,4vw,3rem)] tracking-tight">My Projects</h1>
              <p className="mt-1 text-[var(--color-text-muted)] font-[Instrument_Serif] italic">Manage your posted projects</p>
            </div>
          </div>
          <Link to="/projects/create" className="border border-white px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors flex items-center gap-2">
            <PlusIcon className="w-5 h-5" />
            New Project
          </Link>
        </div>

        {/* Filters */}
        <div className="border border-white/15 p-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-subtle)]" />
              <input
                type="search"
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                placeholder="Search your projects..."
                className="w-full pl-10 pr-4 py-2.5 bg-transparent border border-white/15 text-[var(--color-text)] placeholder-[var(--color-text-subtle)] focus:ring-0 focus:border-white"
              />
            </div>
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as ProjectStatus | undefined, page: 1 })}
                className="border border-white/15 bg-transparent px-4 py-2.5 text-[var(--color-text)] appearance-none focus:ring-0 focus:border-white"
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="disputed">Disputed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Projects Table */}
        <div className="border border-white/15 overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-4 px-6 py-4 border-b border-white/15">
                  <div className="h-12 w-12 bg-white/10" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/10 w-1/3" />
                    <div className="h-3 bg-white/10 w-1/4" />
                  </div>
                  <div className="h-6 bg-white/10 w-24" />
                  <div className="h-6 bg-white/10 w-20" />
                  <div className="h-6 bg-white/10 w-24" />
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-white/10 flex items-center justify-center mx-auto mb-4">
                <MagnifyingGlassIcon className="w-8 h-8 text-[var(--color-text-subtle)]" />
              </div>
              <h3 className="font-heading font-medium text-[var(--color-text)] text-xl">No projects found</h3>
              <p className="mt-1 text-[var(--color-text-muted)]">Get started by creating your first project</p>
              <Link to="/projects/create" className="mt-4 inline-flex items-center gap-2 border border-white px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors">
                <PlusIcon className="w-5 h-5" />
                Create Project
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-white/15">
                    <tr>
                      <th className="px-6 py-4 text-left font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Project</th>
                      <th className="px-6 py-4 text-left font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Status</th>
                      <th className="px-6 py-4 text-left font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Budget</th>
                      <th className="px-6 py-4 text-left font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Bids</th>
                      <th className="px-6 py-4 text-left font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Posted</th>
                      <th className="px-6 py-4 text-right font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/15">
                    {projects.map((project) => (
                      <tr key={project.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <Link
                            to="/projects/$projectId"
                            params={{ projectId: String(project.id) }}
                            search={{ tab: 'details' }}
                            className="font-medium text-[var(--color-text)] hover:text-white transition-colors"
                          >
                            {project.title}
                          </Link>
                          <p className="text-sm text-[var(--color-text-muted)] truncate max-w-xs mt-1">{project.description}</p>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(project.status)}
                        </td>
                        <td className="px-6 py-4 text-[var(--color-text)] font-mono">
                          {project.budget_min !== null ? formatCurrency(project.budget_min) : 'N/A'}
                          {project.budget_max !== null && ` - ${formatCurrency(project.budget_max)}`}
                        </td>
                        <td className="px-6 py-4 text-[var(--color-text)] font-mono tabular-nums">{project.bids_count}</td>
                        <td className="px-6 py-4 text-[var(--color-text-muted)] font-mono">{formatDate(project.created_at)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to="/projects/$projectId"
                              params={{ projectId: String(project.id) }}
                              search={{ tab: 'details' }}
                              className="p-2 text-[var(--color-text-muted)] hover:text-white hover:bg-white/5 transition-colors rounded-none"
                              title="View"
                            >
                              <EyeIcon className="w-5 h-5" />
                            </Link>
                            {project.status === 'draft' && (
                              <>
                                <Link
                                  to="/projects/$projectId/edit"
                                  params={{ projectId: String(project.id) }}
                                  search={{ tab: 'details' }}
                                  className="p-2 text-[var(--color-text-muted)] hover:text-white hover:bg-white/5 transition-colors rounded-none"
                                  title="Edit"
                                >
                                  <PencilIcon className="w-5 h-5" />
                                </Link>
                                <button
                                  onClick={() => handlePublish(project.id)}
                                  className="p-2 text-white hover:bg-white/5 transition-colors rounded-none"
                                  title="Publish"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                  </svg>
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDelete(project.id)}
                              disabled={deletingId === project.id}
                              className="p-2 text-[var(--color-gray-500)] hover:text-white hover:bg-white/5 transition-colors rounded-none"
                              title="Delete"
                            >
                              {deletingId === project.id ? (
                                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                              ) : (
                                <TrashIcon className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="px-6 py-4 border-t border-white/15 flex items-center justify-between">
                  <p className="font-mono text-xs text-[var(--color-text-muted)]">
                    Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} projects
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}