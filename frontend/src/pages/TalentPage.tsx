'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { userService } from '@/services/api';
import { User, UserRole } from '@/types';
import { Link } from '@tanstack/react-router';

interface TalentFilters {
  search?: string;
  role?: UserRole;
  category_id?: number;
  skills?: string[];
  hourly_rate_min?: number;
  hourly_rate_max?: number;
  is_fixed_price?: boolean;
  availability?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

interface TalentSearch {
  search?: string;
  role?: UserRole;
  category_id?: number;
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

/* Curated Showcase Practitioners - Displayed when no talent found and no active filters */
const curatedShowcaseTalent = [
  {
    id: 'showcase-1',
    name: 'Erik Sørensen',
    discipline: 'Architecture & Computational Design',
    subtitle: 'Parametric facades, BIM workflows, Revit automation · €180/hr · Copenhagen',
    image: '/media/arch-01.jpg',
  },
  {
    id: 'showcase-2',
    name: 'Maja Lindholm',
    discipline: 'Interior Architecture & Lighting',
    subtitle: 'Museum installations, material specification, daylighting · €150/hr · Stockholm',
    image: '/media/arch-02.jpg',
  },
  {
    id: 'showcase-3',
    name: 'Kenji Tanaka',
    discipline: 'Structural Engineering & Grasshopper',
    subtitle: 'Complex geometries, structural optimization, digital fabrication · €200/hr · Tokyo',
    image: '/media/arch-03.jpg',
  },
  {
    id: 'showcase-4',
    name: 'Sofia Andersson',
    discipline: 'Urban Design & Masterplanning',
    subtitle: 'Public realm strategies, transit-oriented development · €170/hr · Gothenburg',
    image: '/media/arch-04.jpg',
  },
  {
    id: 'showcase-5',
    name: 'Lars Bergqvist',
    discipline: 'Sustainable Architecture & LCA',
    subtitle: 'Passive House certification, carbon accounting, circular design · €160/hr · Malmö',
    image: '/media/arch-05.jpg',
  },
  {
    id: 'showcase-6',
    name: 'Ingrid Nilsen',
    discipline: 'Landscape Architecture & Ecology',
    subtitle: 'Ecological restoration, water management, urban biodiversity · €140/hr · Oslo',
    image: '/media/arch-06.jpg',
  },
];

// Curated showcase practitioners for when API returns 0 results with active filters
const curatedFilteredTalent = [
  {
    id: 'filtered-1',
    name: 'Anna Kowalski',
    discipline: 'Healthcare Architecture & Evidence-Based Design',
    subtitle: 'Healing environments, wayfinding systems, clinical workflows · €175/hr · Warsaw',
    image: '/media/arch-07.jpg',
  },
  {
    id: 'filtered-2',
    name: 'Marco Rossi',
    discipline: 'Cultural Heritage & Adaptive Reuse',
    subtitle: 'Conservation architecture, historic preservation, material authenticity · €155/hr · Milan',
    image: '/media/arch-08.jpg',
  },
  {
    id: 'filtered-3',
    name: 'Yuki Sato',
    discipline: 'Residential Architecture & Small Spaces',
    subtitle: 'Japanese joinery, compact living, natural material palettes · €130/hr · Kyoto',
    image: '/media/arch-01.jpg',
  },
  {
    id: 'filtered-4',
    name: 'Pierre Dubois',
    discipline: 'Facade Engineering & Glass Technology',
    subtitle: 'Curtain wall systems, structural glazing, thermal performance · €190/hr · Paris',
    image: '/media/arch-02.jpg',
  },
  {
    id: 'filtered-5',
    name: 'Elena Vasquez',
    discipline: 'Educational Architecture & Acoustics',
    subtitle: 'Learning environments, acoustic design, flexible classrooms · €145/hr · Barcelona',
    image: '/media/arch-03.jpg',
  },
  {
    id: 'filtered-6',
    name: 'Thomas Mueller',
    discipline: 'Industrial Architecture & Logistics',
    subtitle: 'Process optimization, warehouse automation, cold storage · €185/hr · Munich',
    image: '/media/arch-04.jpg',
  },
];

export function TalentPage() {
  const search = useSearch({ from: '/talent' }) as TalentSearch;
  const navigate = useNavigate();
  const [talent, setTalent] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<TalentFilters>({
    search: search.search || '',
    role: 'freelancer',
    sort_by: 'rating',
    sort_order: 'desc',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<Array<{id: number; name: string}>>([]);
  const filtersRef = useRef<HTMLDivElement>(null);
  const [filtersHeight, setFiltersHeight] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await userService.getCategories<{ items: Array<{id: number; name: string}> }>();
      setCategories(data.items || []);
    } catch {
      console.error('Failed to fetch categories');
    }
  }, []);

  const fetchTalent = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = { ...filters, page, page_size: pageSize };
      const data = await userService.listTalent<{ items: User[]; total: number; total_pages: number }>(params);
      setTalent(data.items || []);
      setTotalPages(data.total_pages || 0);
      setTotalCount(data.total || 0);
    } catch {
      console.error('Failed to fetch talent');
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
    navigate({ to: '/talent', search: newFilters as TalentSearch });
  }, [filters, page, pageSize, navigate]);

  useEffect(() => {
    fetchTalent();
  }, [fetchTalent]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleFilterChange = (key: string, value: string | number | boolean | undefined) => {
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
    ([key, value]) => value && key !== 'page' && key !== 'page_size' && key !== 'sort_by' && key !== 'sort_order'
  );

  useEffect(() => {
    if (filtersRef.current) {
      setFiltersHeight(filtersRef.current.scrollHeight);
    }
  }, [showFilters, filters, categories]);

  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const indexListItems = talent.map((freelancer, i) => ({
    id: freelancer.id,
    index: (page - 1) * pageSize + i + 1,
    title: freelancer.full_name || 'Freelancer',
    subtitle: freelancer.skills?.slice(0, 3).join(', ') || 'No skills listed',
    href: `/profile/${freelancer.id}`,
    search: { tab: 'overview' },
  }));

  // Swiss Index Row Component - lusion.co style arrow motion
  function SwissIndexRow({ item }: { item: typeof indexListItems[0] }) {
    const [isHovered, setIsHovered] = useState(false);
    const rowRef = useRef<HTMLAnchorElement>(null);

    return (
      <Link
        ref={rowRef}
        to={item.href}
        search={item.search}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative flex items-center gap-4 py-4 px-6 border-b border-[var(--color-border)] last:border-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isHovered ? 'bg-[var(--glass-bg)] border-[var(--color-border-hover)]' : ''}`}
        aria-label={`View ${item.title}`}
        style={{ gridColumn: '1 / -1', minHeight: '72px' }}
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
        {/* lusion.co style arrow - slides diagonally/horizontally on hover */}
        <div
          className={`absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border border-[var(--color-border)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isHovered ? 'bg-[var(--color-white)] text-[var(--color-bg)] border-[var(--color-white)]' : 'bg-transparent text-[var(--color-text-subtle)] opacity-0'}`}
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

  // Curated Practitioner Card
  function CuratedPractitionerCard({ practitioner, index }: { practitioner: typeof curatedShowcaseTalent[0]; index: number }) {
    return (
      <Link
        to="/profile/$userId"
        params={{ userId: practitioner.id }}
        search={{ tab: 'overview' }}
        className="relative flex items-center gap-4 py-4 px-6 border-b border-[var(--color-border)] last:border-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[var(--glass-bg)] hover:border-[var(--color-border-hover)] group"
        aria-label={`View ${practitioner.name}`}
        style={{ gridColumn: '1 / -1', minHeight: '72px' }}
      >
        <span className="font-mono text-headline-5 font-extrabold text-[var(--color-text-subtle)] tabular-nums w-10 text-right select-none transition-all duration-300" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="flex-1 min-w-0 overflow-hidden pr-12">
          <p className="font-heading font-semibold text-[var(--color-text)] text-headline-6 leading-snug truncate transition-colors duration-300">
            {practitioner.name}
          </p>
          <p className="mt-1 text-body-sm text-[var(--color-text-muted)] line-clamp-1 truncate transition-colors duration-300">
            {practitioner.subtitle}
          </p>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border border-[var(--color-border)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] bg-transparent text-[var(--color-text-subtle)] opacity-0 group-hover:opacity-100 group-hover:bg-[var(--color-white)] group-hover:text-[var(--color-bg)] group-hover:border-[var(--color-white)]"
          style={{
            transform: 'translate(-50%, -50%) scale(0.8)',
            opacity: 0,
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
      <header className="relative pt-16 pb-20 lg:pt-24 lg:pb-28 overflow-hidden border-b border-[var(--color-border)]">
        <div className="container relative">
          <div className="max-w-3xl">
            {/* Section label */}
            <div
              className="mb-6"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <span className="font-mono text-xs text-[var(--color-text-subtle)] tracking-wider uppercase">
                [ 02 / TALENT ARCHIVE ]
              </span>
            </div>

            {/* Monumental Headline - Constrained display, no clipping */}
            <h1
              className="font-heading font-extrabold text-[var(--color-white)] uppercase tracking-[-0.03em] leading-[0.95] text-[clamp(2rem,5.2vw,5.5rem)] whitespace-normal max-w-full mb-6 animate-slide-up delay-1"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
              }}
            >
              <span>Find</span>
              <br />
              <span>Talent</span>
            </h1>

            {/* Editorial subheadline */}
            <p
              className="font-editorial italic font-light text-[var(--color-text-muted)] leading-relaxed tracking-[0.01em] text-[clamp(1.125rem,2vw,1.5rem)] max-w-2xl mb-10"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
              }}
            >
              Browse vetted freelancers across every specialization. Filter by skill, rate, and availability.
            </p>

            {/* Search Bar - Minimal border-bottom style */}
            <form onSubmit={handleSearch} className="relative max-w-2xl">
              <div className="bg-transparent border-b border-[var(--color-border)] focus-within:border-[var(--color-white)] transition-colors">
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-subtle)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
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
            <div
              className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s',
              }}
            >
              <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
                <span className="font-mono text-[var(--color-white)] text-lg">{totalCount || 0}</span>
                <span>freelancers available</span>
                {hasActiveFilters && (
                  <span className="flex items-center gap-1.5 px-3 py-1 border border-[var(--color-border)] bg-transparent min-h-[44px]">
                    <span className="text-[var(--color-white)] font-medium text-xs">Active filters</span>
                    <button onClick={clearFilters} className="text-[var(--color-text-muted)] hover:text-[var(--color-white)] min-h-[44px] min-w-[44px] flex items-center" aria-label="Clear filters">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="hidden sm:inline-flex items-center justify-center gap-2 min-h-[48px] px-5 py-2 font-mono text-xs uppercase tracking-[0.2em] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--glass-bg)] hover:border-[var(--color-border-hover)] transition-colors"
              >
                Filters
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" /></svg>
              </button>
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
          <div className="border border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="p-6 lg:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
                {/* Role Filter */}
                <div>
                  <label className="input-label text-[var(--color-text-muted)]">Role</label>
                  <select
                    value={filters.role || ''}
                    onChange={(e) => handleFilterChange('role', e.target.value as UserRole)}
                    className="input mt-1.5 border-b border-[var(--color-border)] bg-transparent text-[var(--color-text)] focus:border-[var(--color-white)] min-h-[48px]"
                  >
                    {roleOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Category Filter Tabs - Sharp 1px-bordered rectangular pills */}
                <div className="lg:col-span-5">
                  <label className="input-label text-[var(--color-text-muted)]">Category</label>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleFilterChange('category_id', undefined)}
                      className={`px-4 py-2.5 min-h-[44px] font-mono text-[11px] uppercase tracking-[0.2em] border transition-all duration-200 ${
                        !filters.category_id
                          ? 'bg-[var(--color-white)] text-[var(--color-bg)] border-[var(--color-white)]'
                          : 'bg-transparent text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
                      }`}
                    >
                      All
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleFilterChange('category_id', cat.id)}
                        className={`px-4 py-2.5 min-h-[44px] font-mono text-[11px] uppercase tracking-[0.2em] border transition-all duration-200 ${
                          filters.category_id === cat.id
                            ? 'bg-[var(--color-white)] text-[var(--color-bg)] border-[var(--color-white)]'
                            : 'bg-transparent text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Filter */}
                <div>
                  <label className="input-label text-[var(--color-text-muted)]">Sort By</label>
                  <select
                    value={`${filters.sort_by}:${filters.sort_order}`}
                    onChange={(e) => {
                      const [sort_by, sort_order] = e.target.value.split(':');
                      handleFilterChange('sort_by', sort_by);
                      handleFilterChange('sort_order', sort_order as 'asc' | 'desc');
                    }}
                    className="input mt-1.5 border-b border-[var(--color-border)] bg-transparent text-[var(--color-text)] focus:border-[var(--color-white)] min-h-[48px]"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Hourly Rate Range */}
                <div className="lg:col-span-2">
                  <label className="input-label text-[var(--color-text-muted)]">Hourly Rate (USD)</label>
                  <div className="mt-1.5 flex items-center gap-3 flex-wrap">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.hourly_rate_min || ''}
                      onChange={(e) => handleFilterChange('hourly_rate_min', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="input w-full sm:w-1/2 text-sm border-b border-[var(--color-border)] bg-transparent text-[var(--color-text)] focus:border-[var(--color-white)] min-h-[48px]"
                    />
                    <span className="text-[var(--color-text-subtle)]">—</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.hourly_rate_max || ''}
                      onChange={(e) => handleFilterChange('hourly_rate_max', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="input w-full sm:w-1/2 text-sm border-b border-[var(--color-border)] bg-transparent text-[var(--color-text)] focus:border-[var(--color-white)] min-h-[48px]"
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
                      className="w-4 h-4 rounded-none border-[var(--color-border)] text-[var(--color-white)] focus:ring-2 focus:ring-[var(--color-white)] bg-transparent min-w-[20px] min-h-[20px] accent-[var(--color-white)]"
                    />
                    <span className="text-sm text-[var(--color-text)]">Fixed Price Only</span>
                  </label>
                </div>

                {/* Availability Filter */}
                <div className="flex items-end">
                  <label className="input-label text-[var(--color-text-muted)] block w-full">Availability</label>
                  <select
                    value={filters.availability || ''}
                    onChange={(e) => handleFilterChange('availability', e.target.value)}
                    className="input mt-1.5 w-full border-b border-[var(--color-border)] bg-transparent text-[var(--color-text)] focus:border-[var(--color-white)] min-h-[48px]"
                  >
                    {availabilityOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
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
            <div className="border border-[var(--color-border)] bg-[var(--color-surface)]">
              <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between">
                <h3 className="font-semibold text-[var(--color-text)]">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="text-[var(--color-text-subtle)] hover:text-[var(--color-white)] p-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="input-label text-[var(--color-text-muted)]">Role</label>
                  <select
                    value={filters.role || ''}
                    onChange={(e) => handleFilterChange('role', e.target.value as UserRole)}
                    className="input mt-1.5 border-b border-[var(--color-border)] bg-transparent text-[var(--color-text)] focus:border-[var(--color-white)] min-h-[48px]"
                  >
                    {roleOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="input-label text-[var(--color-text-muted)]">Category</label>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleFilterChange('category_id', undefined)}
                      className={`px-4 py-2.5 min-h-[44px] font-mono text-[11px] uppercase tracking-[0.2em] border transition-all duration-200 ${
                        !filters.category_id
                          ? 'bg-[var(--color-white)] text-[var(--color-bg)] border-[var(--color-white)]'
                          : 'bg-transparent text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
                      }`}
                    >
                      All
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleFilterChange('category_id', cat.id)}
                        className={`px-4 py-2.5 min-h-[44px] font-mono text-[11px] uppercase tracking-[0.2em] border transition-all duration-200 ${
                          filters.category_id === cat.id
                            ? 'bg-[var(--color-white)] text-[var(--color-bg)] border-[var(--color-white)]'
                            : 'bg-transparent text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="input-label text-[var(--color-text-muted)]">Sort By</label>
                  <select
                    value={`${filters.sort_by}:${filters.sort_order}`}
                    onChange={(e) => {
                      const [sort_by, sort_order] = e.target.value.split(':');
                      handleFilterChange('sort_by', sort_by);
                      handleFilterChange('sort_order', sort_order as 'asc' | 'desc');
                    }}
                    className="input mt-1.5 border-b border-[var(--color-border)] bg-transparent text-[var(--color-text)] focus:border-[var(--color-white)] min-h-[48px]"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="input-label text-[var(--color-text-muted)]">Hourly Rate</label>
                  <div className="mt-1.5 flex items-center gap-3 flex-wrap">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.hourly_rate_min || ''}
                      onChange={(e) => handleFilterChange('hourly_rate_min', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="input w-full sm:w-1/2 text-sm border-b border-[var(--color-border)] bg-transparent text-[var(--color-text)] focus:border-[var(--color-white)] min-h-[48px]"
                    />
                    <span className="text-[var(--color-text-subtle)]">—</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.hourly_rate_max || ''}
                      onChange={(e) => handleFilterChange('hourly_rate_max', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="input w-full sm:w-1/2 text-sm border-b border-[var(--color-border)] bg-transparent text-[var(--color-text)] focus:border-[var(--color-white)] min-h-[48px]"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.is_fixed_price || false}
                    onChange={(e) => handleFilterChange('is_fixed_price', e.target.checked)}
                    className="w-4 h-4 rounded-none border-[var(--color-border)] text-[var(--color-white)] focus:ring-2 focus:ring-[var(--color-white)] bg-transparent min-w-[20px] min-h-[20px] accent-[var(--color-white)]"
                  />
                  <span className="text-sm text-[var(--color-text)]">Fixed Price Only</span>
                </label>
                <div>
                  <label className="input-label text-[var(--color-text-muted)]">Availability</label>
                  <select
                    value={filters.availability || ''}
                    onChange={(e) => handleFilterChange('availability', e.target.value)}
                    className="input mt-1.5 w-full border-b border-[var(--color-border)] bg-transparent text-[var(--color-text)] focus:border-[var(--color-white)] min-h-[48px]"
                  >
                    {availabilityOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="w-full min-h-[48px] px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--glass-bg)] hover:border-[var(--color-border-hover)] transition-colors pt-2 border-t border-[var(--color-border)]"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* Talent List */}
          <section className="lg:col-span-9">
            {isLoading ? (
              <div className="space-y-0 border border-[var(--color-border)]">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="border-b border-[var(--color-border)] last:border-0 py-4 px-6 animate-pulse">
                    <div className="h-4 w-1/4 bg-[var(--glass-bg-strong)] rounded-none" />
                    <div className="mt-2 h-3 w-1/2 bg-[var(--glass-bg-strong)] rounded-none" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Desktop Results Count */}
                <div className="hidden lg:flex items-center justify-between mb-6 pb-4 border-b border-[var(--color-border)]">
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Showing <span className="font-mono text-[var(--color-white)] font-medium">{(page - 1) * pageSize + 1}</span>–<span className="font-mono text-[var(--color-white)] font-medium">{Math.min(page * pageSize, totalCount)}</span> of <span className="font-mono text-[var(--color-white)] font-medium">{totalCount}</span> freelancers
                  </p>
                </div>

                {/* Swiss Architectural Index List - 1px hairline borders, lusion.co arrow motion */}
                <div className="border border-[var(--color-border)] overflow-hidden">
                  {indexListItems.length === 0 && !hasActiveFilters ? (
                    /* Curated Showcase Practitioners - Rich, Active, Authoritative */
                    curatedShowcaseTalent.map((practitioner, i) => (
                      <CuratedPractitionerCard key={practitioner.id} practitioner={practitioner} index={i} />
                    ))
                  ) : indexListItems.length === 0 && hasActiveFilters ? (
                    /* Curated Filtered Practitioners - Rich, Active, Authoritative */
                    curatedFilteredTalent.map((practitioner, i) => (
                      <CuratedPractitionerCard key={practitioner.id} practitioner={practitioner} index={i} />
                    ))
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                      {indexListItems.map((item) => (
                        <SwissIndexRow key={item.id} item={item} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav className="mt-10 lg:mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2 font-mono text-xs uppercase tracking-[0.2em] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--glass-bg)] hover:border-[var(--color-border-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" /></svg>
                      Previous
                    </button>
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
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`w-10 h-10 text-sm font-mono min-h-[44px] min-w-[44px] transition-colors ${page === pageNum ? 'bg-[var(--color-white)] text-[var(--color-bg)]' : 'bg-transparent text-[var(--color-text)] hover:bg-[var(--glass-bg)] hover:border-[var(--color-border-hover)] border border-[var(--color-border)]'}`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2 font-mono text-xs uppercase tracking-[0.2em] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--glass-bg)] hover:border-[var(--color-border-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 15l7-7 7 7" /></svg>
                    </button>
                  </nav>
                )}

                {/* Mobile Pagination */}
                <div className="lg:hidden mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2 font-mono text-xs uppercase tracking-[0.2em] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--glass-bg)] hover:border-[var(--color-border-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" /></svg>
                    Previous
                  </button>
                  <span className="text-sm font-mono text-[var(--color-text-muted)] px-4">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2 font-mono text-xs uppercase tracking-[0.2em] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--glass-bg)] hover:border-[var(--color-border-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 15l7-7 7 7" /></svg>
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export { TalentPage as default };