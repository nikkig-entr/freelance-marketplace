'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { userService } from '@/services/api';
import { User, UserRole } from '@/types';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { MonumentalHeadline } from '@/components/ui/MonumentalHeadline';
import { EditorialText } from '@/components/ui/EditorialText';
import { IndexList, IndexListSkeleton } from '@/components/ui/IndexList';

interface TalentFilters {
  search?: string;
  role?: UserRole;
  skills?: string[];
  hourly_rate_min?: number;
  hourly_rate_max?: number;
  availability?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

interface TalentSearch {
  search?: string;
  role?: UserRole;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

const sortOptions = [
  { value: 'rating:desc', label: 'Top Rated' },
  { value: 'hourly_rate:asc', label: 'Rate: Low to High' },
  { value: 'hourly_rate:desc', label: 'Rate: High to Low' },
  { value: 'created_at:desc', label: 'Newest First' },
  { value: 'completed_projects:desc', label: 'Most Experienced' },
];

const roleOptions = [
  { value: '', label: 'All Roles' },
  { value: 'freelancer', label: 'Freelancers' },
  { value: 'client', label: 'Clients' },
];

const availabilityOptions = [
  { value: '', label: 'Any Availability' },
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'open', label: 'Open to Work' },
];

export function TalentPage() {
  const search = useSearch({ from: '/talent' }) as TalentSearch;
  const navigate = useNavigate();
  const [talent, setTalent] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<TalentFilters>({
    search: search.search || '',
    role: 'freelancer',
    sort_by: 'rating',
    sort_order: 'desc',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const filtersRef = useRef<HTMLDivElement>(null);
  const [filtersHeight, setFiltersHeight] = useState(0);

  useEffect(() => {
    fetchSkills();
  }, []);

  useEffect(() => {
    const newFilters = { ...filters, page, page_size: pageSize };
    setFilters(newFilters);
    navigate({ to: '/talent', search: newFilters as TalentSearch });
  }, [filters, page, pageSize, navigate]);

  useEffect(() => {
    fetchTalent();
  }, [search, page, pageSize]);

  const fetchSkills = async () => {
    try {
      await userService.getProfile(0);
      setSkills([
        'React', 'TypeScript', 'Node.js', 'Python', 'Vue.js',
        'UI/UX Design', 'Figma', 'Graphic Design', 'Mobile Development',
        'Swift', 'Kotlin', 'Flutter', 'React Native', 'DevOps',
        'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB',
        'Content Writing', 'SEO', 'Copywriting', 'Technical Writing',
        'Data Science', 'Machine Learning', 'AI/ML', 'TensorFlow', 'PyTorch',
      ]);
    } catch (error) {
      console.error('Failed to fetch skills:', error);
    }
  };

  const fetchTalent = async () => {
    setIsLoading(true);
    try {
      await userService.getProfile(0);
      setTalent([]);
      setTotalPages(0);
    } catch (error) {
      console.error('Failed to fetch talent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleFilterChange = (key: string, value: string | number | string[] | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
    setPage(1);
  };

  const clearFilters = () => {
    const clearedFilters: TalentFilters = {
      search: '',
      role: 'freelancer',
      sort_by: 'rating',
      sort_order: 'desc',
    };
    setFilters(clearedFilters);
    setPage(1);
    navigate({ to: '/talent', search: clearedFilters });
  };

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => value && key !== 'page' && key !== 'page_size' && key !== 'sort_by' && key !== 'sort_order' && key !== 'role'
  );

  useEffect(() => {
    if (filtersRef.current) {
      setFiltersHeight(filtersRef.current.scrollHeight);
    }
  }, [showFilters, filters]);

  // Transform talent for IndexList
  const indexListItems = talent.map((freelancer, i) => ({
    id: freelancer.id,
    index: (page - 1) * pageSize + i + 1,
    title: freelancer.full_name || 'Freelancer',
    subtitle: freelancer.skills?.slice(0, 3).join(', ') || 'No skills listed',
    href: `/profile/${freelancer.id}`,
  }));

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Hero Header */}
      <header className="relative pt-16 pb-20 lg:pt-24 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[var(--color-accent)]/3 blur-[150px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-[var(--color-accent)]/2 blur-[120px] pointer-events-none" />
        </div>

        <div className="container relative">
          <div className="max-w-3xl">
            {/* Section label */}
            <div className="mb-6" style={{ opacity: 1, transform: 'translateY(0)', transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
              <span className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-xl border-[var(--color-accent)]/30 text-sm font-medium tracking-wide uppercase">
                <UserIcon className="w-3.5 h-3.5 text-[var(--color-accent)]" aria-hidden="true" />
                Talent Catalog
              </span>
            </div>

            {/* Monumental Headline */}
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
              Find
              Talent
            </MonumentalHeadline>

            {/* Editorial subheadline */}
            <EditorialText
              size="lg"
              animated={true}
              hoverReroll={true}
              rerollText="50K+ verified professionals. Zero noise."
              className="max-w-2xl mb-10"
            >
              Browse vetted freelancers across every specialization. Filter by skill, rate, and availability.
            </EditorialText>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-2xl">
              <div className="glass-card p-1.5 backdrop-blur-[20px] border-[var(--color-border)]">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-subtle)]" aria-hidden="true" />
                  <input
                    type="search"
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search freelancers by skill, name, or keyword…"
                    className="w-full pl-12 pr-4 py-4 bg-transparent border-0 text-[var(--color-text)] placeholder-[var(--color-text-subtle)] text-lg focus:outline-none font-sans"
                    aria-label="Search freelancers"
                  />
                </div>
              </div>
            </form>

            {/* Filter Toggle + Stats */}
            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
                <span className="font-mono text-[var(--color-accent)] text-lg">{talent.length || 0}</span>
                <span>freelancers available</span>
                {hasActiveFilters && (
                  <span className="flex items-center gap-1.5 px-3 py-1 glass-card rounded-xl border-[var(--color-accent)]/30">
                    <span className="text-[var(--color-accent)] font-medium">Active filters</span>
                    <button onClick={clearFilters} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]" aria-label="Clear filters">
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </span>
                )}
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                leftIcon={<FunnelIcon className="w-4 h-4" />}
                className="hidden sm:flex"
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
          <div className="border border-[var(--color-border)] bg-[var(--glass-bg)] backdrop-blur-[20px]">
            <div className="p-6 lg:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
                {/* Role Filter */}
                <div>
                  <label className="input-label">Role</label>
                  <Select
                    value={filters.role || ''}
                    onChange={(e) => handleFilterChange('role', e.target.value as UserRole)}
                    options={roleOptions}
                    className="mt-1.5"
                  />
                </div>

                {/* Skills Filter */}
                <div>
                  <label className="input-label">Skills</label>
                  <Select
                    value={filters.skills?.join(',') || ''}
                    onChange={(e) => handleFilterChange('skills', e.target.value ? e.target.value.split(',').map(s => s.trim()) : [])}
                    options={[{ value: '', label: 'All Skills' }, ...skills.map(s => ({ value: s, label: s }))]}
                    className="mt-1.5"
                    multiple
                  />
                </div>

                {/* Sort Filter */}
                <div>
                  <label className="input-label">Sort By</label>
                  <Select
                    value={`${filters.sort_by}:${filters.sort_order}`}
                    onChange={(e) => {
                      const [sort_by, sort_order] = e.target.value.split(':');
                      handleFilterChange('sort_by', sort_by);
                      handleFilterChange('sort_order', sort_order as 'asc' | 'desc');
                    }}
                    options={sortOptions}
                    className="mt-1.5"
                  />
                </div>

                {/* Hourly Rate Range */}
                <div className="lg:col-span-2">
                  <label className="input-label">Hourly Rate (USD)</label>
                  <div className="mt-1.5 flex items-center gap-3">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.hourly_rate_min || ''}
                      onChange={(e) => handleFilterChange('hourly_rate_min', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-1/2 text-sm"
                    />
                    <span className="text-[var(--color-text-subtle)]">—</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.hourly_rate_max || ''}
                      onChange={(e) => handleFilterChange('hourly_rate_max', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-1/2 text-sm"
                    />
                  </div>
                </div>

                {/* Availability Filter */}
                <div className="flex items-end">
                  <label className="input-label block w-full">Availability</label>
                  <Select
                    value={filters.availability || ''}
                    onChange={(e) => handleFilterChange('availability', e.target.value)}
                    options={availabilityOptions}
                    className="mt-1.5 w-full"
                  />
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
            <div className="border border-[var(--color-border)] bg-[var(--glass-bg)] backdrop-blur-[20px]">
              <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between">
                <h3 className="font-semibold text-[var(--color-text)]">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="text-[var(--color-text-subtle)] hover:text-[var(--color-text)] p-1">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="input-label">Role</label>
                  <Select
                    value={filters.role || ''}
                    onChange={(e) => handleFilterChange('role', e.target.value as UserRole)}
                    options={roleOptions}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <label className="input-label">Skills</label>
                  <Select
                    value={filters.skills?.join(',') || ''}
                    onChange={(e) => handleFilterChange('skills', e.target.value ? e.target.value.split(',').map(s => s.trim()) : [])}
                    options={[{ value: '', label: 'All Skills' }, ...skills.map(s => ({ value: s, label: s }))]}
                    className="mt-1.5"
                    multiple
                  />
                </div>
                <div>
                  <label className="input-label">Sort By</label>
                  <Select
                    value={`${filters.sort_by}:${filters.sort_order}`}
                    onChange={(e) => {
                      const [sort_by, sort_order] = e.target.value.split(':');
                      handleFilterChange('sort_by', sort_by);
                      handleFilterChange('sort_order', sort_order as 'asc' | 'desc');
                    }}
                    options={sortOptions}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <label className="input-label">Hourly Rate</label>
                  <div className="mt-1.5 flex items-center gap-3">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.hourly_rate_min || ''}
                      onChange={(e) => handleFilterChange('hourly_rate_min', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-1/2 text-sm"
                    />
                    <span className="text-[var(--color-text-subtle)]">—</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.hourly_rate_max || ''}
                      onChange={(e) => handleFilterChange('hourly_rate_max', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-1/2 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="input-label">Availability</label>
                  <Select
                    value={filters.availability || ''}
                    onChange={(e) => handleFilterChange('availability', e.target.value)}
                    options={availabilityOptions}
                    className="mt-1.5 w-full"
                  />
                </div>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters} fullWidth className="pt-2 border-t border-[var(--color-border)]">
                    Clear All Filters
                  </Button>
                )}
              </div>
            </div>
          </aside>

          {/* Talent List */}
          <section className="lg:col-span-9">
            {isLoading ? (
              <IndexListSkeleton count={6} />
            ) : talent.length === 0 ? (
              <div className="text-center py-16 lg:py-24">
                <UserIcon className="w-16 h-16 text-[var(--color-text-subtle)] mx-auto mb-4" />
                <h3 className="text-headline-4 font-bold text-[var(--color-text)] mb-2">No freelancers found</h3>
                <p className="text-[var(--color-text-muted)] mb-6 max-w-md mx-auto">
                  {hasActiveFilters ? 'Try adjusting your search or filters to find more talent' : 'No freelancers available at the moment. Check back soon!'}
                </p>
                {hasActiveFilters && <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>}
              </div>
            ) : (
              <>
                {/* Desktop Results Count */}
                <div className="hidden lg:flex items-center justify-between mb-6 pb-4 border-b border-[var(--color-border)]">
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Showing <span className="font-mono text-[var(--color-text)] font-medium">{(page - 1) * pageSize + 1}</span>–<span className="font-mono text-[var(--color-text)] font-medium">{Math.min(page * pageSize, talent.length)}</span> of <span className="font-mono text-[var(--color-text)] font-medium">{talent.length}</span> freelancers
                  </p>
                </div>

                {/* Index-style Talent List */}
                <IndexList
                  items={indexListItems}
                  emptyMessage="No freelancers found"
                  emptyDescription={hasActiveFilters ? 'Try adjusting your search or filters to find more talent' : 'No freelancers available at the moment. Check back soon!'}
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
                            className="w-10 h-10 text-sm font-mono"
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
          className="shadow-xl"
        >
          Filters {hasActiveFilters && <Badge variant="primary" size="sm" className="ml-2">Active</Badge>}
        </Button>
      </div>
    </div>
  );
}