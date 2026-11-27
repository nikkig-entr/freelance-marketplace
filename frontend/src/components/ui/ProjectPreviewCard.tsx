'use client';

import { useState, useRef } from 'react';
import { Link } from '@tanstack/react-router';
import { Project, formatCurrency } from '@/types';
import { ClockIcon, CurrencyDollarIcon, MapPinIcon } from '@heroicons/react/24/outline';

interface ProjectPreviewCardProps {
  project: Project;
  onHover?: (project: Project | null, position: { x: number; y: number } | null) => void;
}

const projectImages = [
  '/media/projects/projects-code.jpg',
  '/media/projects/projects-design.jpg',
  '/media/hero/hero-main.jpg',
  '/media/hero/hero-code.jpg',
  '/media/bento/bento-remote-work.jpg',
  '/media/bento/bento-escrow.jpg',
];

export function ProjectPreviewCard({ project, onHover }: ProjectPreviewCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect && onHover) {
      onHover(project, { x: rect.right + 24, y: rect.top });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (onHover) {
      onHover(null, null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onHover && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      onHover(project, { x: e.clientX + 24, y: e.clientY - rect.top });
    }
  };

  return (
    <Link
      ref={cardRef}
      to="/projects/$projectId"
      params={{ projectId: String(project.id) }}
      search={{ tab: 'details' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      className={`
        relative group glass-card-hover p-6 transition-all duration-300
        ${isHovered ? 'ring-1 ring-[var(--color-white)]/20 scale-[1.01] z-10' : ''}
      `}
      aria-label={`View project: ${project.title}`}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="text-headline-6 font-bold text-[var(--color-text)] line-clamp-2 flex-1 pr-4 transition-colors duration-300 group-hover:text-[var(--color-white)]">
          {project.title}
        </h3>
        <span className="badge badge-primary flex-shrink-0 transition-all duration-300">
          {project.status.replace('_', ' ')}
        </span>
      </div>
      <p className="text-body-sm text-[var(--color-text-muted)] line-clamp-3 mb-4 transition-opacity duration-300">
        {project.description}
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        {(project.skills || []).slice(0, 3).map((skill) => (
          <span key={skill} className="badge badge-outline text-xs">
            {skill}
          </span>
        ))}
        {(project.skills || []).length > 3 && (
          <span className="badge badge-outline text-xs text-[var(--color-text-subtle)]">
            +{(project.skills || []).length - 3}
          </span>
        )}
      </div>
      <div className="border-t border-[var(--color-border)] pt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--color-text-muted)] flex items-center gap-1">
            {project.is_fixed_price ? (
              <CurrencyDollarIcon className="w-4 h-4" />
            ) : (
              <ClockIcon className="w-4 h-4" />
            )}
            {project.is_fixed_price ? 'Fixed Price' : 'Hourly'}
          </span>
          {project.budget_min !== null && (
            <span className="font-medium text-[var(--color-text)]">
              {project.budget_max !== null
                ? `${formatCurrency(project.budget_min)} – ${formatCurrency(project.budget_max)}`
                : formatCurrency(project.budget_min)}
            </span>
          )}
        </div>
        {project.deadline_days && (
          <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
            <span className="flex items-center gap-1">
              <ClockIcon className="w-4 h-4" />
              {project.deadline_days} days
            </span>
            <span className="flex items-center gap-1">
              <MapPinIcon className="w-4 h-4" />
              {project.bids_count ?? project.bid_count ?? 0} bids
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

interface PreviewTooltipProps {
  project: Project | null;
  position: { x: number; y: number } | null;
  containerRef: React.RefObject<HTMLDivElement>;
}

export function PreviewTooltip({ project, position, containerRef }: PreviewTooltipProps) {
  if (!project || !position || !containerRef.current) return null;

  const containerRect = containerRef.current.getBoundingClientRect();
  const previewImage = projectImages[project.id % projectImages.length];

  // Calculate position relative to container
  const x = position.x - containerRect.left;
  const y = position.y - containerRect.top;

  // Keep tooltip within viewport
  const tooltipWidth = 320;
  const tooltipHeight = 200;
  const finalX = Math.min(x, containerRect.width - tooltipWidth - 24);
  const finalY = Math.min(y, containerRect.height - tooltipHeight - 24);

  return (
    <div
      className="fixed z-50 pointer-events-none animate-in animate-slide-up duration-200"
      style={{
        left: containerRect.left + finalX,
        top: containerRect.top + finalY,
        width: tooltipWidth,
        height: tooltipHeight,
      }}
      aria-hidden="true"
    >
      <div className="glass-strong rounded-none overflow-hidden shadow-xl border border-[var(--color-white)]/10 w-full h-full">
        <div className="aspect-video relative overflow-hidden">
          <img
            src={previewImage}
            alt=""
            className="w-full h-full object-cover transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)]/90 via-[var(--color-bg)]/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="font-semibold text-[var(--color-text)] text-sm line-clamp-1">{project.title}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1 font-mono">
              {project.is_fixed_price ? 'Fixed' : 'Hourly'} • {project.budget_min !== null ? formatCurrency(project.budget_min) : '—'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProjectPreviewList({ projects }: { projects: Project[] }) {
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleHover = (project: Project | null, position: { x: number; y: number } | null) => {
    setHoveredProject(project);
    setHoverPosition(position);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectPreviewCard
            key={project.id}
            project={project}
            onHover={handleHover}
          />
        ))}
      </div>
      <PreviewTooltip
        project={hoveredProject}
        position={hoverPosition}
        containerRef={containerRef}
      />
    </div>
  );
}

export { ProjectPreviewList as default };