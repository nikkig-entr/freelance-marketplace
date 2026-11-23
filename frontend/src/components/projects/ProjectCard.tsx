import { Link } from 'react-router-dom';
import { CurrencyDollarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { Card } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
  href?: string;
}

export function ProjectCard({ project, onClick, href }: ProjectCardProps) {
  const budgetText = project.budget_min && project.budget_max
    ? `$${(project.budget_min / 100).toLocaleString()} - $${(project.budget_max / 100).toLocaleString()}`
    : project.budget_min
    ? `From $${(project.budget_min / 100).toLocaleString()}`
    : project.budget_max
    ? `Up to $${(project.budget_max / 100).toLocaleString()}`
    : 'Negotiable';

  const handleClick = () => {
    if (href) return;
    onClick?.();
  };

  return (
    <Card hover onClick={handleClick} className="h-full" as={href ? 'a' : undefined} href={href}>
      <div className="flex items-start justify-between mb-3">
        <Badge variant="primary" size="sm">{project.category}</Badge>
        <StatusBadge status={project.status} size="sm" />
      </div>
      <h3 className="font-semibold text-secondary-900 mb-2 line-clamp-2">{project.title}</h3>
      <p className="text-secondary-600 text-sm mb-4 line-clamp-2">{project.description}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {project.tags.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="outline" size="sm">{tag}</Badge>
        ))}
        {project.tags.length > 3 && (
          <Badge variant="outline" size="sm">+{project.tags.length - 3} more</Badge>
        )}
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-secondary-200">
        <div className="flex items-center gap-2">
          <CurrencyDollarIcon className="w-5 h-5 text-secondary-400" />
          <span className="font-medium text-secondary-900">{budgetText}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-secondary-500">
          <ClockIcon className="w-4 h-4" />
          <span>{project.bids_count} bids</span>
        </div>
      </div>
    </Card>
  );
}