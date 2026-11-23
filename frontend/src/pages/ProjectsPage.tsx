import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, FunnelIcon, ArrowRightIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Card, CardGrid, CardTitle } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { LoadingSpinner, CardLoader, ListLoader } from '@/components/ui/LoadingSpinner';
import { projectService } from '@/services/api';
import { Project, ProjectFilters } from '@/types';
import { ProjectCard } from '@/components/projects';

const categories = [
  'Web Development',
  'Mobile Development',
  'Design & Creative',
  'Writing & Translation',
  'Marketing & Sales',
  'Data Science & AI',
  'DevOps & Engineering',
  'Finance & Accounting',
  'Legal & Admin',
];

const experienceLevels = [
  { value: 'any', label: 'Any Experience' },
  { value: 'junior', label: 'Junior (0-2 years)' },
  { value: 'mid', label: 'Mid (2-5 years)' },
  { value: 'senior', label: 'Senior (5-10 years)' },
  { value: 'expert', label: 'Expert (10+ years)' },
];

const sortOptions = [
  { value: 'created_at', label: 'Newest First' },
  { value: 'budget', label: 'Budget: High to Low' },
  { value: 'deadline', label: 'Deadline: Soonest First' },
  { value: 'bids_count', label: 'Most Bids' },
];

export function ProjectsPage() {
  const [filters, setFilters] = useState<ProjectFilters>({
    page: 1,
    page_size: 12,
    sort_by: 'created_at',
    sort_order: 'desc',
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['projects', filters],
    queryFn: () => projectService.list(filters),
  });

  const handleFilterChange = (key: keyof ProjectFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      page_size: 12,
      sort_by: 'created_at',
      sort_order: 'desc',
    });
  };

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => key !== 'page' && key !== 'page_size' && key !== 'sort_by' && key !== 'sort_order' && value
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-secondary-900">Browse Projects</h1>
          <p className="mt-1 text-secondary-600">
            {data?.total || 0} project{data?.total !== 1 ? 's' : ''} found
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} leftIcon={<FunnelIcon className="w-4 h-4" />}>
            Filters {hasActiveFilters && <Badge variant="primary" size="sm">Active</Badge>}
          </Button>
          <Button asChild leftIcon={<PlusIcon className="w-4 h-4" />}>
            <Link to="/projects/create">Post a Project</Link>
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="animate-slide-down">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 p-6">
            <Input
              label="Search"
              placeholder="Keywords, skills..."
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              leftIcon={<MagnifyingGlassIcon className="w-4 h-4" />}
            />
            <Select
              label="Category"
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              options={[{ value: '', label: 'All Categories' }, ...categories.map((c) => ({ value: c, label: c }))]}
            />
            <Select
              label="Experience"
              value={filters.experience_level || ''}
              onChange={(e) => handleFilterChange('experience_level', e.target.value)}
              options={experienceLevels}
            />
            <Select
              label="Sort By"
              value={`${filters.sort_by}:${filters.sort_order}`}
              onChange={(e) => {
                const [sort_by, sort_order] = e.target.value.split(':');
                handleFilterChange('sort_by', sort_by);
                handleFilterChange('sort_order', sort_order);
              }}
              options={sortOptions.map((o) => ({ value: `${o.value}:desc`, label: o.label }))}
            />
            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} fullWidth>
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Projects Grid */}
      <Card padding="none">
        {isLoading ? (
          <ListLoader count={6} />
        ) : isError ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-danger-50 flex items-center justify-center mx-auto mb-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-danger-500" />
            </div>
            <h3 className="text-lg font-medium text-secondary-900 mb-1">Failed to load projects</h3>
            <p className="text-secondary-600 mb-4">Please try again later.</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        ) : data?.items.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-secondary-100 flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-secondary-400" />
            </div>
            <h3 className="text-lg font-medium text-secondary-900 mb-1">No projects found</h3>
            <p className="text-secondary-600 mb-4">
              {hasActiveFilters ? 'Try adjusting your filters' : 'Be the first to post a project!'}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
            )}
            {!hasActiveFilters && (
              <Button asChild>
                <Link to="/projects/create">Create a Project</Link>
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="p-6">
              <CardGrid columns={3}>
                {data.items.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </CardGrid>
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
    </div>
  );
}