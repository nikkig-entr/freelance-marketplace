import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  dot?: boolean;
  dotColor?: string;
}

export function Badge({
  children,
  variant = 'primary',
  size = 'md',
  className,
  dot,
  dotColor,
}: BadgeProps) {
  const variantClasses = {
    primary: 'bg-amber/10 text-amber border border-amber/20',
    success: 'bg-teal/10 text-teal border border-teal/20',
    warning: 'bg-amber/10 text-amber border border-amber/20',
    danger: 'bg-danger-500/10 text-danger-500 border border-danger-500/20',
    secondary: 'bg-white/[0.05] text-muted border border-white/[0.1]',
    outline: 'bg-transparent text-cream border border-white/[0.15]',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {dot && (
        <span
          className={clsx('w-1.5 h-1.5 rounded-full', dotColor)}
          style={{ backgroundColor: dotColor }}
        />
      )}
      {children}
    </span>
  );
}

export function StatusBadge({
  status,
  size = 'md',
  className,
}: {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const statusConfig: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    draft: { label: 'Draft', variant: 'secondary' },
    open: { label: 'Open', variant: 'success' },
    in_progress: { label: 'In Progress', variant: 'primary' },
    in_review: { label: 'In Review', variant: 'warning' },
    completed: { label: 'Completed', variant: 'success' },
    cancelled: { label: 'Cancelled', variant: 'danger' },
    disputed: { label: 'Disputed', variant: 'danger' },
    pending: { label: 'Pending', variant: 'warning' },
    accepted: { label: 'Accepted', variant: 'success' },
    rejected: { label: 'Rejected', variant: 'danger' },
    withdrawn: { label: 'Withdrawn', variant: 'secondary' },
    shortlisted: { label: 'Shortlisted', variant: 'primary' },
    active: { label: 'Active', variant: 'success' },
    past_due: { label: 'Past Due', variant: 'warning' },
    unpaid: { label: 'Unpaid', variant: 'danger' },
    trialing: { label: 'Trialing', variant: 'primary' },
    incomplete: { label: 'Incomplete', variant: 'warning' },
    incomplete_expired: { label: 'Expired', variant: 'danger' },
    processing: { label: 'Processing', variant: 'primary' },
    failed: { label: 'Failed', variant: 'danger' },
  };

  const config = statusConfig[status] || { label: status, variant: 'secondary' };

  return <Badge variant={config.variant} size={size} className={className}>{config.label}</Badge>;
}

export function PlanBadge({
  plan,
  size = 'md',
  className,
}: {
  plan: 'starter' | 'pro' | 'agency';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const planConfig: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    starter: { label: 'Starter', variant: 'secondary' },
    pro: { label: 'Pro', variant: 'primary' },
    agency: { label: 'Agency', variant: 'success' },
  };

  const config = planConfig[plan];

  return <Badge variant={config.variant} size={size} className={className}>{config.label}</Badge>;
}