import { useState, useEffect } from 'react';
import { Link, useSearch, useNavigate } from '@tanstack/react-router';
import { api } from '../../services/api';
import { Project, ProjectStatus, formatCurrency, getStatusColor } from '../../types';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpDownIcon,
  BriefcaseIcon,
  ClockIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface ProjectFilters {
  search?: string;
  status?: ProjectStatus;
  category_id?: number;
  skills?: string[];
  budget_min?: number;
  budget_max?: number;
  is_fixed_price?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

export function ProjectsPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/projects' });
  const [projects, setProjects] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ProjectFilters>({
    search: search.search || '',
    status: 'open',
    sort_by: 'created_at',
    sort_order: 'desc',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<Array<{id: number; name: string}>>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const newFilters = { ...filters, page, page_size: pageSize };
    setFilters(newFilters);
    search(newFilters);
  }, [page, pageSize]);

  useEffect(() => {
    fetchProjects();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data.items || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const data = await api.getProjects(filters);
      setProjects(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.total_pages || 0);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'open',
      sort_by: 'created_at',
      sort_order: 'desc',
    });
    setPage(1);
  };

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => value && key !== 'page' && key !== 'page_size' && key !== 'sort_by' && key !== 'sort_order'
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="mt-1 text-gray-600">Find your next project</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link to="/projects/create" className="btn-primary flex items-center justify-center gap-2">
              <PlusIcon className="w-5 h-5" />
              Post Project
            </Link>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="card p-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="search"
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search projects..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-3 lg:hidden">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-secondary flex items-center gap-2 ${showFilters ? 'ring-2 ring-primary-500' : ''}`}
              >
                <FunnelIcon className="w-5 h-5" />
                Filters
              </button>
            </div>
          </form>

          {/* Desktop Filters */}
          <div className={`lg:flex lg:items-center lg:justify-between mt-4 ${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="flex flex-wrap items-center gap-4">
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="input w-auto py-2"
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="completed">Completed</option>
              </select>

              <select
                value={filters.category_id || ''}
                onChange={(e) => handleFilterChange('category_id', e.target.value ? parseInt(e.target.value) : undefined)}
                className="input w-auto py-2"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              <select
                value={filters.sort_by || 'created_at'}
                onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                className="input w-auto py-2"
              >
                <option value="created_at">Newest First</option>
                <option value="budget_min">Budget: Low to High</option>
                <option value="budget_max">Budget: High to Low</option>
                <option value="deadline_days">Deadline: Soonest</option>
                <option value="bid_count">Most Bids</option>
              </select>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.is_fixed_price || false}
                  onChange={(e) => handleFilterChange('is_fixed_price', e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-600">Fixed Price Only</span>
              </label>
            </div>

            {hasActiveFilters && (
              <button onClick={clearFilters} className="btn-ghost text-sm flex items-center gap-1">
                <XMarkIcon className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filters Sidebar */}
          {showFilters && (
            <aside className="lg:hidden w-64 flex-shrink-0">
              <div className="card p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Filters</h3>
                  <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600">
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="label">Status</label>
                    <select
                      value={filters.status || ''}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="input"
                    >
                      <option value="">All Statuses</option>
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="in_review">In Review</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Category</label>
                    <select
                      value={filters.category_id || ''}
                      onChange={(e) => handleFilterChange('category_id', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="input"
                    >
                      <option value="">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Sort By</label>
                    <select
                      value={filters.sort_by || 'created_at'}
                      onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                      className="input"
                    >
                      <option value="created_at">Newest First</option>
                      <option value="budget_min">Budget: Low to High</option>
                      <option value="budget_max">Budget: High to Low</option>
                      <option value="deadline_days">Deadline: Soonest</option>
                      <option value="bid_count">Most Bids</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.is_fixed_price || false}
                      onChange={(e) => handleFilterChange('is_fixed_price', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-600">Fixed Price Only</span>
                  </label>
                </div>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="w-full btn-danger text-sm">
                    Clear All Filters
                  </button>
                )}
              </div>
            </aside>
          )}

          {/* Projects Grid */}
          <main className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card p-6 animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="flex gap-4">
                      <div className="h-6 bg-gray-200 rounded w-20" />
                      <div className="h-6 bg-gray-200 rounded w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-16">
                <BriefcaseIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No projects found</h3>
                <p className="mt-1 text-gray-500">Try adjusting your search or filters</p>
                <button onClick={clearFilters} className="mt-4 btn-secondary">
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <Link
                      key={project.id}
                      to={`/projects/${project.id}`}
                      className="card-hover p-6"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">{project.title}</h3>
                        <span className={`badge ${getStatusColor(project.status)} flex-shrink-0`}>
                          {project.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">{project.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.skills.slice(0, 4).map((skill) => (
                          <span key={skill} className="badge badge-gray">{skill}</span>
                        ))}
                        {project.skills.length > 4 && (
                          <span className="badge badge-gray">+{project.skills.length - 4}</span>
                        )}
                      </div>
                      <div className="border-t border-gray-200 pt-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">{formatCurrency(project.budget_min)}</span>
                          {project.budget_max && (
                            <span className="text-gray-500">- {formatCurrency(project.budget_max)}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            {project.is_fixed_price ? (
                              <CurrencyDollarIcon className="w-4 h-4" />
                            ) : (
                              <ClockIcon className="w-4 h-4" />
                            )}
                            {project.is_fixed_price ? 'Fixed Price' : 'Hourly'}
                          </span>
                          {project.deadline_days && (
                            <span className="flex items-center gap-1">
                              <ClockIcon className="w-4 h-4" />
                              {project.deadline_days} days
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 pt-2 border-t border-gray-100">
                          <span className="flex items-center gap-1">
                            <MapPinIcon className="w-4 h-4" />
                            {project.bid_count} bids
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="btn-secondary px-3 py-2"
                    >
                      Previous
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                              page === pageNum
                                ? 'bg-primary-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="btn-secondary px-3 py-2"
                    >
                      Next
                    </button>
                  </nav>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

// Need to import PlusIcon
import { PlusIcon } from '@heroicons/react/24/outline';