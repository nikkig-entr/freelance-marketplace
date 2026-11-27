'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { projectService } from '@/services/api';
import { Project, ProjectStatus } from '@/types';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { MonumentalHeadline } from '@/components/ui/MonumentalHeadline';
import { EditorialText } from '@/components/ui/EditorialText';
import { IndexList, IndexListSkeleton } from '@/components/ui/IndexList';

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

interface ProjectsSearch {
  search?: string;
  status?: ProjectStatus;
  category_id?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

const sortOptions = [
  { value: 'created_at:desc', label: 'Newest First' },
  { value: 'budget_min:asc', label: 'Budget: Low to High' },
  { value: 'budget_max:desc', label: 'Budget: High to Low' },
  { value: 'deadline_days:asc', label: 'Deadline: Soonest' },
  { value: 'bids_count:desc', label: 'Most Bids' },
];

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'in_review', label: 'In Review' },
  { value: 'completed', label: 'Completed' },
];

export function ProjectsPage() {
  const search = useSearch({ from: '/projects' }) as ProjectsSearch;
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
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
  const filtersRef = useRef<HTMLDivElement>(null);
  const [filtersHeight, setFiltersHeight] = useState(0);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await projectService.getCategories<{ items: Array<{id: number; name: string}> }>();
      setCategories(data.items || []);
    } catch {
      console.error('Failed to fetch categories');
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = { ...filters, page, page_size: pageSize };
      const data = await projectService.list<{ items: Project[]; total: number; total_pages: number }>(params);
      setProjects(data.items || []);
      setTotalPages(data.total_pages || 0);
    } catch {
      console.error('Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  }, [filters, page, pageSize]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const newFilters = { ...filters, page, page_size: pageSize };
    setFilters(newFilters);
    navigate({ to: '/projects', search: newFilters as ProjectsSearch });
  }, [filters, page, pageSize, navigate]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleFilterChange = (key: string, value: string | number | boolean | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
    setPage(1);
  };

  const clearFilters = () => {
    const clearedFilters: ProjectFilters = {
      search: '',
      status: 'open',
      sort_by: 'created_at',
      sort_order: 'desc',
    };
    setFilters(clearedFilters);
    setPage(1);
    navigate({ to: '/projects', search: clearedFilters });
  };

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => value && key !== 'page' && key !== 'page_size' && key !== 'sort_by' && key !== 'sort_order'
  );

  useEffect(() => {
    if (filtersRef.current) {
      setFiltersHeight(filtersRef.current.scrollHeight);
    }
  }, [showFilters, filters, categories]);

  const indexListItems = projects.map((project, i) => ({
    id: project.id,
    index: (page - 1) * pageSize + i + 1,
    title: project.title,
    subtitle: project.description?.slice(0, 120),
    href: `/projects/${project.id}`,
    search: { tab: 'details' },
  }));

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Hero Header - Monochrome Swiss Grid */}
      <header className="relative pt-16 pb-20 lg:pt-24 lg:pb-28 overflow-hidden border-b border-white/15">
        <div className="container relative">
          <div className="max-w-3xl">
            {/* Section label */}
            <div className="mb-6" style={{ opacity: 1, transform: 'translateY(0)', transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
              <span className="font-mono text-xs text-[var(--color-text-subtle)] tracking-wider uppercase">
                [ 01 / PROJECTS CATALOG ]
              </span>
            </div>

            {/* Monumental Headline - Constrained display, no clipping */}
            <MonumentalHeadline
              splitBy="lines"
              delay={0.1}
              stagger={0.12}
              duration={1.3}
              parallax={true}
              parallaxStrength={0.06}
              maskAnimation={true}
              className="mb-6"
            >
              Discover
              Projects
            </MonumentalHeadline>

            {/* Editorial subheadline */}
            <EditorialText
              size="lg"
              animated={true}
              hoverReroll={true}
              rerollText="Filter by skill, budget, timeline. Find your match."
              className="max-w-2xl mb-10"
            >
              Browse thousands of open projects. Filter by expertise, budget, and timeline.
            </EditorialText>

            {/* Search Bar - Minimal border-bottom style */}
            <form onSubmit={handleSearch} className="relative max-w-2xl">
              <div className="bg-transparent border-b border-white/30 focus-within:border-white transition-colors">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-subtle)]" aria-hidden="true" />
                  <input
                    type="search"
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search projects, skills, technologies…"
                    className="w-full pl-12 pr-4 py-4 bg-transparent border-0 text-[var(--color-text)] placeholder-[var(--color-text-subtle)] text-lg focus:outline-none font-sans min-h-[48px]"
                    aria-label="Search projects"
                  />
                </div>
              </div>
            </form>

            {/* Filter Toggle + Stats */}
            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
                <span className="font-mono text-[var(--color-white)] text-lg">{projects.length || 0}</span>
                <span>projects found</span>
                {hasActiveFilters && (
                  <span className="flex items-center gap-1.5 px-3 py-1 border border-white/15 bg-transparent min-h-[44px]">
                    <span className="text-[var(--color-white)] font-medium text-xs">Active filters</span>
                    <button onClick={clearFilters} className="text-[var(--color-text-muted)] hover:text-[var(--color-white)] min-h-[44px] min-w-[44px] flex items-center" aria-label="Clear filters">
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </span>
                )}
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                leftIcon={<FunnelIcon className="w-4 h-4" />}
                className="hidden sm:flex border-white/30 text-[var(--color-text)] hover:bg-white hover:text-black min-h-[48px]"
              >
                Filters
                <ChevronDownIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Filters Panel - Collapsible */}
      <div className="container pb-8">
        <div
          ref={filtersRef}
          className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${showFilters ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 pointer-events-none'}`}
          style={{ maxHeight: showFilters ? `${filtersHeight}px` : '0' }}
        >
          <div className="border border-white/15 bg-[var(--color-surface)]">
            <div className="p-6 lg:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
                {/* Status Filter */}
                <div>
                  <label className="input-label text-[var(--color-text-muted)]">Status</label>
                  <Select
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    options={statusOptions}
                    className="mt-1.5 border-b border-white/30 bg-transparent text-[var(--color-text)] focus:border-white min-h-[48px]"
                  />
                </div>

                {/* Category Filter */}
                <div>
                  <label className="input-label text-[var(--color-text-muted)]">Category</label>
                  <Select
                    value={filters.category_id || ''}
                    onChange={(e) => handleFilterChange('category_id', e.target.value ? parseInt(e.target.value) : undefined)}
                    options={[{ value: '', label: 'All Categories' }, ...categories.map(c => ({ value: String(c.id), label: c.name }))]}
                    className="mt-1.5 border-b border-white/30 bg-transparent text-[var(--color-text)] focus:border-white min-h-[48px]"
                  />
                </div>

                {/* Sort Filter */}
                <div>
                  <label className="input-label text-[var(--color-text-muted)]">Sort By</label>
                  <Select
                    value={`${filters.sort_by}:${filters.sort_order}`}
                    onChange={(e) => {
                      const [sort_by, sort_order] = e.target.value.split(':');
                      handleFilterChange('sort_by', sort_by);
                      handleFilterChange('sort_order', sort_order as 'asc' | 'desc');
                    }}
                    options={sortOptions}
                    className="mt-1.5 border-b border-white/30 bg-transparent text-[var(--color-text)] focus:border-white min-h-[48px]"
                  />
                </div>

                {/* Budget Range */}
                <div className="lg:col-span-2">
                  <label className="input-label text-[var(--color-text-muted)]">Budget Range</label>
                  <div className="mt-1.5 flex items-center gap-3 flex-wrap">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.budget_min || ''}
                      onChange={(e) => handleFilterChange('budget_min', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full sm:w-1/2 text-sm border-b border-white/30 bg-transparent text-[var(--color-text)] focus:border-white min-h-[48px]"
                    />
                    <span className="text-[var(--color-text-subtle)]">—</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.budget_max || ''}
                      onChange={(e) => handleFilterChange('budget_max', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full sm:w-1/2 text-sm border-b border-white/30 bg-transparent text-[var(--color-text)] focus:border-white min-h-[48px]"
                    />
                  </div>
                </div>

                {/* Fixed Price Checkbox */}
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer w-full">
                    <input
                      type="checkbox"
                      checked={filters.is_fixed_price || false}
                      onChange={(e) => handleFilterChange('is_fixed_price', e.target.checked)}
                      className="w-4 h-4 rounded-none border-white/30 text-white focus:ring-2 focus:ring-white bg-transparent min-w-[20px] min-h-[20px]"
                    />
                    <span className="text-sm text-[var(--color-text)]">Fixed Price Only</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <main className="container pb-16 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Mobile Filters Sidebar */}
          <aside className="lg:col-span-3 lg:sticky lg:top-24 lg:self-start hidden lg:block">
            <div className="border border-white/15 bg-[var(--color-surface)]">
              <div className="p-6 border-b border-white/15 flex items-center justify-between">
                <h3 className="font-semibold text-[var(--color-text)]">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="text-[var(--color-text-subtle)] hover:text-[var(--color-white)] p-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="input-label text-[var(--color-text-muted)]">Status</label>
                  <Select
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    options={statusOptions}
                    className="mt-1.5 border-b border-white/30 bg-transparent text-[var(--color-text)] focus:border-white min-h-[48px]"
                  />
                </div>
                <div>
                  <label className="input-label text-[var(--color-text-muted)]">Category</label>
                  <Select
                    value={filters.category_id || ''}
                    onChange={(e) => handleFilterChange('category_id', e.target.value ? parseInt(e.target.value) : undefined)}
                    options={[{ value: '', label: 'All Categories' }, ...categories.map(c => ({ value: String(c.id), label: c.name }))]}
                    className="mt-1.5 border-b border-white/30 bg-transparent text-[var(--color-text)] focus:border-white min-h-[48px]"
                  />
                </div>
                <div>
                  <label className="input-label text-[var(--color-text-muted)]">Sort By</label>
                  <Select
                    value={`${filters.sort_by}:${filters.sort_order}`}
                    onChange={(e) => {
                      const [sort_by, sort_order] = e.target.value.split(':');
                      handleFilterChange('sort_by', sort_by);
                      handleFilterChange('sort_order', sort_order as 'asc' | 'desc');
                    }}
                    options={sortOptions}
                    className="mt-1.5 border-b border-white/30 bg-transparent text-[var(--color-text)] focus:border-white min-h-[48px]"
                  />
                </div>
                <div>
                  <label className="input-label text-[var(--color-text-muted)]">Budget</label>
                  <div className="mt-1.5 flex items-center gap-3 flex-wrap">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.budget_min || ''}
                      onChange={(e) => handleFilterChange('budget_min', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full sm:w-1/2 text-sm border-b border-white/30 bg-transparent text-[var(--color-text)] focus:border-white min-h-[48px]"
                    />
                    <span className="text-[var(--color-text-subtle)]">—</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.budget_max || ''}
                      onChange={(e) => handleFilterChange('budget_max', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full sm:w-1/2 text-sm border-b border-white/30 bg-transparent text-[var(--color-text)] focus:border-white min-h-[48px]"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.is_fixed_price || false}
                    onChange={(e) => handleFilterChange('is_fixed_price', e.target.checked)}
                    className="w-4 h-4 rounded-none border-white/30 text-white focus:ring-2 focus:ring-white bg-transparent min-w-[20px] min-h-[20px]"
                  />
                  <span className="text-sm text-[var(--color-text)]">Fixed Price Only</span>
                </label>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters} fullWidth className="pt-2 border-t border-white/15 border-white/30 text-[var(--color-text)] hover:bg-white hover:text-black min-h-[48px]">
                    Clear All Filters
                  </Button>
                )}
              </div>
            </div>
          </aside>

          {/* Projects List - Clean index layout, stacks on mobile */}
          <section className="lg:col-span-9">
            {isLoading ? (
              <IndexListSkeleton count={6} />
            ) : (
              <>
                {/* Desktop Results Count */}
                <div className="hidden lg:flex items-center justify-between mb-6 pb-4 border-b border-white/15">
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Showing <span className="font-mono text-[var(--color-white)] font-medium">{(page - 1) * pageSize + 1}</span>–<span className="font-mono text-[var(--color-white)] font-medium">{Math.min(page * pageSize, projects.length)}</span> of <span className="font-mono text-[var(--color-white)] font-medium">{projects.length}</span> projects
                  </p>
                </div>

                {/* Index-style Project List - Clean, no horizontal overflow */}
                <IndexList
                  items={indexListItems}
                  emptyMessage="No projects found"
                  emptyDescription={hasActiveFilters ? 'Try adjusting your search or filters to find more projects' : 'No open projects at the moment. Check back soon!'}
                />

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav className="mt-10 lg:mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      leftIcon={<ChevronDownIcon className="w-4 h-4 rotate-180" />}
                      className="border-white/30 text-[var(--color-text)] hover:bg-white hover:text-black min-h-[44px] min-w-[44px]"
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1 hidden sm:flex">
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
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? 'primary' : 'ghost'}
                            size="sm"
                            onClick={() => setPage(pageNum)}
                            className="w-10 h-10 text-sm font-mono min-h-[44px] min-w-[44px]"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      rightIcon={<ChevronDownIcon className="w-4 h-4" />}
                      className="border-white/30 text-[var(--color-text)] hover:bg-white hover:text-black min-h-[44px] min-w-[44px]"
                    >
                      Next
                    </Button>
                  </nav>
                )}

                {/* Mobile Pagination */}
                <div className="lg:hidden mt-8 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    leftIcon={<ChevronDownIcon className="w-4 h-4 rotate-180" />}
                    className="border-white/30 text-[var(--color-text)] hover:bg-white hover:text-black min-h-[44px] min-w-[44px]"
                  >
                    Previous
                  </Button>
                  <span className="text-sm font-mono text-[var(--color-text-muted)] px-4">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    rightIcon={<ChevronDownIcon className="w-4 h-4" />}
                    className="border-white/30 text-[var(--color-text)] hover:bg-white hover:text-black min-h-[44px] min-w-[44px]"
                  >
                    Next
                  </Button>
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      {/* Mobile Filters Button */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <Button
          variant="primary"
          size="lg"
          onClick={() => setShowFilters(true)}
          leftIcon={<FunnelIcon className="w-5 h-5" />}
          className="shadow-xl border-white bg-white text-black hover:bg-white/90 min-h-[56px]"
        >
          Filters {hasActiveFilters && <Badge className="ml-2 border-white bg-white text-black">Active</Badge>}
        </Button>
      </div>
    </div>
  );
}