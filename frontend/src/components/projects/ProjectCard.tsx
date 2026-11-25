import { Link } from '@tanstack/react-router';
import { CurrencyDollarIcon, ClockIcon } from '@heroicons/react/24/outline';
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

  const cardContent = (
    <Card hover onClick={handleClick} className="h-full">
      <div className="flex items-start justify-between mb-3">
        <Badge variant="primary" size="sm">{project.category}</Badge>
        <StatusBadge status={project.status} size="sm" />
      </div>
      <h3 className="font-semibold text-[var(--color-text)] mb-2 line-clamp-2">{project.title}</h3>
      <p className="text-[var(--color-text-muted)] text-sm mb-4 line-clamp-2">{project.description}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {project.tags.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="outline" size="sm">{tag}</Badge>
        ))}
        {project.tags.length > 3 && (
          <Badge variant="outline" size="sm">+{project.tags.length - 3} more</Badge>
        )}
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <CurrencyDollarIcon className="w-5 h-5 text-[var(--color-text-subtle)]" />
          <span className="font-medium text-[var(--color-text)]">{budgetText}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[var(--color-text-subtle)]">
          <ClockIcon className="w-4 h-4" />
          <span>{project.bids_count} bids</span>
        </div>
      </div>
    </Card>
  );

  if (href) {
    return <Link to={href}><Card hover className="h-full" asChild>{cardContent}</Card></Link>;
  }

  return cardContent;
}