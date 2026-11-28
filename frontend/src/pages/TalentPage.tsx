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
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { EditorialText } from '@/components/ui/EditorialText';
import { IndexListSkeleton } from '@/components/ui/IndexList';

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

  const indexListItems = talent.map((freelancer, i) => ({
    id: freelancer.id,
    index: (page - 1) * pageSize + i + 1,
    title: freelancer.full_name || 'Freelancer',
    subtitle: freelancer.skills?.slice(0, 3).join(', ') || 'No skills listed',
    href: `/profile/${freelancer.id}`,
  }));

  // Swiss Index Row Component - lusion.co style arrow motion
  function SwissIndexRow({ item }: { item: typeof indexListItems[0] }) {
    const [isHovered, setIsHovered] = useState(false);
    const rowRef = useRef<HTMLAnchorElement>(null);

    return (
      <Link
        ref={rowRef}
        to={item.href}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          relative flex items-center gap-4 py-4 px-6
          border-b border-white/15 last:border-0
          transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${isHovered ? 'bg-white/5 border-white/40' : ''}
        `}
        aria-label={`View ${item.title}`}
        style={{
          gridColumn: '1 / -1',
          minHeight: '72px',
        }}
      >
        <span
          className="font-mono text-headline-5 font-extrabold text-[var(--color-text-subtle)] tabular-nums w-10 text-right select-none transition-all duration-300"
          aria-hidden="true"
        >
          {String(item.index).padStart(2, '0')}
        </span>
        <div className="flex-1 min-w-0 overflow-hidden pr-12">
          <p className="font-heading font-semibold text-[var(--color-text)] text-headline-6 leading-snug truncate transition-colors duration-300">
            {item.title}
          </p>
          {item.subtitle && (
            <p className="mt-1 text-body-sm text-[var(--color-text-muted)] line-clamp-1 truncate transition-colors duration-300">
              {item.subtitle}
            </p>
          )}
        </div>
        {/* lusion.co style arrow - slides on hover */}
        <div
          className={`
            absolute right-6 top-1/2 -translate-y-1/2
            w-10 h-10 flex items-center justify-center
            border border-white/15 rounded-none
            transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${isHovered ? 'bg-white text-black border-white' : 'bg-transparent text-[var(--color-text-subtle)] opacity-0'}
          `}
          style={{
            transform: isHovered
              ? 'translate(-50%, -50%) scale(1)'
              : 'translate(-50%, -50%) scale(0.8)',
            opacity: isHovered ? 1 : 0,
          }}
          aria-hidden="true"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </Link>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Hero Header - Monochrome Swiss Grid */}
      <header className="relative pt-16 pb-20 lg:pt-24 lg:pb-28 overflow-hidden border-b border-white/15">
        <div className="container relative">
          <div className="max-w-3xl">
            {/* Section label */}
            <div className="mb-6" style={{ opacity: 1, transform: 'translateY(0)', transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
              <span className="font-mono text-xs text-[var(--color-text-subtle)] tracking-wider uppercase">
                [ 02 / TALENT ARCHIVE ]
              </span>
            </div>

            {/* Monumental Headline - Constrained display, no clipping */}
            <h1 className="font-heading font-extrabold text-[var(--color-white)] uppercase tracking-[-0.03em] leading-[0.92] text-[clamp(2.2rem,5.8vw,6rem)] break-words max-w-full mb-6 animate-slide-up delay-1">
              <span>Find</span>
              <br />
              <span>Talent</span>
            </h1>

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

            {/* Search Bar - Minimal border-bottom style */}
            <form onSubmit={handleSearch} className="relative max-w-2xl">
              <div className="bg-transparent border-b border-white/30 focus-within:border-white transition-colors">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-subtle)]" aria-hidden="true" />
                  <input
                    type="search"
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search freelancers by skill, name, or keyword…"
                    className="w-full pl-12 pr-4 py-4 bg-transparent border-0 text-[var(--color-text)] placeholder-[var(--color-text-subtle)] text-lg focus:outline-none font-sans min-h-[48px]"
                    aria-label="Search freelancers"
                  />
                </div>
              </div>
            </form>

            {/* Filter Toggle + Stats */}
            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
                <span className="font-mono text-[var(--color-white)] text-lg">{talent.length || 0}</span>
                <span>freelancers available</span>
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
                {/* Role Filter */}
                <div>
                  <label className="input-label text-[var(--color-text-muted)]">Role</label>
                  <Select
                    value={filters.role || ''}
                    onChange={(e) => handleFilterChange('role', e.target.value as UserRole)}
                    options={roleOptions}
                    className="mt-1.5 border-b border-white/30 bg-transparent text-[var(--color-text)] focus:border-white min-h-[48px]"
                  />
                </div>

                {/* Skills Filter - Sharp 1px-bordered rectangular pills */}
                <div className="lg:col-span-5">
                  <label className="input-label text-[var(--color-text-muted)]">Skills</label>
                  <div className="mt-1.5 flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2">
                    <button
                      type="button"
                      onClick={() => handleFilterChange('skills', [])}
                      className={`px-4 py-2.5 min-h-[44px] font-mono text-[11px] uppercase tracking-[0.2em] border transition-all duration-200 whitespace-nowrap ${
                        !filters.skills?.length
                          ? 'bg-white text-black border-white'
                          : 'bg-transparent text-[var(--color-text)] border-white/20 hover:border-white/40'
                      }`}
                    >
                      All
                    </button>
                    {skills.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => {
                          const current = filters.skills || [];
                          const updated = current.includes(skill)
                            ? current.filter((s) => s !== skill)
                            : [...current, skill];
                          handleFilterChange('skills', updated);
                        }}
                        className={`px-4 py-2.5 min-h-[44px] font-mono text-[11px] uppercase tracking-[0.2em] border transition-all duration-200 whitespace-nowrap ${
                          filters.skills?.includes(skill)
                            ? 'bg-white text-black border-white'
                            : 'bg-transparent text-[var(--color-text)] border-white/20 hover:border-white/40'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
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

                {/* Hourly Rate Range */}
                <div className="lg:col-span-2">
                  <label className="input-label text-[var(--color-text-muted)]">Hourly Rate (USD)</label>
                  <div className="mt-1.5 flex items-center gap-3 flex-wrap">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.hourly_rate_min || ''}
                      onChange={(e) => handleFilterChange('hourly_rate_min', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full sm:w-1/2 text-sm border-b border-white/30 bg-transparent text-[var(--color-text)] focus:border-white min-h-[48px]"
                    />
                    <span className="text-[var(--color-text-subtle)]">—</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.hourly_rate_max || ''}
                      onChange={(e) => handleFilterChange('hourly_rate_max', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full sm:w-1/2 text-sm border-b border-white/30 bg-transparent text-[var(--color-text)] focus:border-white min-h-[48px]"
                    />
                  </div>
                </div>

                {/* Availability Filter */}
                <div className="flex items-end">
                  <label className="input-label text-[var(--color-text-muted)] block w-full">Availability</label>
                  <Select
                    value={filters.availability || ''}
                    onChange={(e) => handleFilterChange('availability', e.target.value)}
                    options={availabilityOptions}
                    className="mt-1.5 w-full border-b border-white/30 bg-transparent text-[var(--color-text)] focus:border-white min-h-[48px]"
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
            <div className="border border-white/15 bg-[var(--color-surface)]">
              <div className="p-6 border-b border-white/15 flex items-center justify-between">
                <h3 className="font-semibold text-[var(--color-text)]">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="text-[var(--color-text-subtle)] hover:text-[var(--color-white)] p-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="input-label text-[var(--color-text-muted)]">Role</label>
                  <Select
                    value={filters.role || ''}
                    onChange={(e) => handleFilterChange('role', e.target.value as UserRole)}
                    options={roleOptions}
                    className="mt-1.5 border-b border-white/30 bg-transparent text-[var(--color-text)] focus:border-white min-h-[48px]"
                  />
                </div>
                <div>
                  <label className="input-label text-[var(--color-text-muted)]">Skills</label>
                  <div className="mt-1.5 flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2">
                    <button
                      type="button"
                      onClick={() => handleFilterChange('skills', [])}
                      className={`px-4 py-2.5 min-h-[44px] font-mono text-[11px] uppercase tracking-[0.2em] border transition-all duration-200 whitespace-nowrap ${
                        !filters.skills?.length
                          ? 'bg-white text-black border-white'
                          : 'bg-transparent text-[var(--color-text)] border-white/20 hover:border-white/40'
                      }`}
                    >
                      All
                    </button>
                    {skills.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => {
                          const current = filters.skills || [];
                          const updated = current.includes(skill)
                            ? current.filter((s) => s !== skill)
                            : [...current, skill];
                          handleFilterChange('skills', updated);
                        }}
                        className={`px-4 py-2.5 min-h-[44px] font-mono text-[11px] uppercase tracking-[0.2em] border transition-all duration-200 whitespace-nowrap ${
                          filters.skills?.includes(skill)
                            ? 'bg-white text-black border-white'
                            : 'bg-transparent text-[var(--color-text)] border-white/20 hover:border-white/40'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
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
                  <label className="input-label text-[var(--color-text-muted)]">Hourly Rate</label>
                  <div className="mt-1.5 flex items-center gap-3 flex-wrap">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.hourly_rate_min || ''}
                      onChange={(e) => handleFilterChange('hourly_rate_min', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full sm:w-1/2 text-sm border-b border-white/30 bg-transparent text-[var(--color-text)] focus:border-white min-h-[48px]"
                    />
                    <span className="text-[var(--color-text-subtle)]">—</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.hourly_rate_max || ''}
                      onChange={(e) => handleFilterChange('hourly_rate_max', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full sm:w-1/2 text-sm border-b border-white/30 bg-transparent text-[var(--color-text)] focus:border-white min-h-[48px]"
                    />
                  </div>
                </div>
                <div>
                  <label className="input-label text-[var(--color-text-muted)]">Availability</label>
                  <Select
                    value={filters.availability || ''}
                    onChange={(e) => handleFilterChange('availability', e.target.value)}
                    options={availabilityOptions}
                    className="mt-1.5 w-full border-b border-white/30 bg-transparent text-[var(--color-text)] focus:border-white min-h-[48px]"
                  />
                </div>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters} fullWidth className="pt-2 border-t border-white/15 border-white/30 text-[var(--color-text)] hover:bg-white hover:text-black min-h-[48px]">
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
                <h3 className="text-[clamp(1.25rem,2.5vw,1.75rem)] font-bold text-[var(--color-text)] mb-2">No freelancers found</h3>
                <p className="text-[var(--color-text-muted)] mb-6 max-w-md mx-auto">
                  {hasActiveFilters ? 'Try adjusting your search or filters to find more talent' : 'No freelancers available at the moment. Check back soon!'}
                </p>
                {hasActiveFilters && <Button variant="outline" onClick={clearFilters} className="border-white/30 text-[var(--color-text)] hover:bg-white hover:text-black min-h-[48px]">Clear Filters</Button>}
              </div>
            ) : (
              <>
                {/* Desktop Results Count */}
                <div className="hidden lg:flex items-center justify-between mb-6 pb-4 border-b border-white/15">
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Showing <span className="font-mono text-[var(--color-white)] font-medium">{(page - 1) * pageSize + 1}</span>–<span className="font-mono text-[var(--color-white)] font-medium">{Math.min(page * pageSize, talent.length)}</span> of <span className="font-mono text-[var(--color-white)] font-medium">{talent.length}</span> freelancers
                  </p>
                </div>

                {/* Swiss Architectural Index List - 1px hairline borders, lusion.co arrow motion */}
                <div className="border border-white/15 overflow-hidden">
                  {indexListItems.map((item) => (
                    <SwissIndexRow key={item.id} item={item} />
                  ))}
                </div>

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
    </div>
  );
}