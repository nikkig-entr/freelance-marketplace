import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
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
    primary: 'bg-[var(--color-white)] text-[var(--color-text-inverse)] border border-[var(--color-white)]',
    secondary: 'glass text-[var(--color-text-muted)] border-[var(--glass-border)]',
    outline: 'bg-transparent text-[var(--color-text)] border border-[var(--color-border)]',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-medium rounded-none border',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {dot && (
        <span
          className={clsx('w-1.5 h-1.5 rounded-full', dotColor)}
          style={{ backgroundColor: dotColor || 'var(--color-white)' }}
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
    open: { label: 'Open', variant: 'primary' },
    in_progress: { label: 'In Progress', variant: 'primary' },
    in_review: { label: 'In Review', variant: 'secondary' },
    completed: { label: 'Completed', variant: 'primary' },
    cancelled: { label: 'Cancelled', variant: 'outline' },
    disputed: { label: 'Disputed', variant: 'outline' },
    pending: { label: 'Pending', variant: 'secondary' },
    accepted: { label: 'Accepted', variant: 'primary' },
    rejected: { label: 'Rejected', variant: 'outline' },
    withdrawn: { label: 'Withdrawn', variant: 'secondary' },
    shortlisted: { label: 'Shortlisted', variant: 'primary' },
    active: { label: 'Active', variant: 'primary' },
    past_due: { label: 'Past Due', variant: 'outline' },
    unpaid: { label: 'Unpaid', variant: 'outline' },
    trialing: { label: 'Trialing', variant: 'primary' },
    incomplete: { label: 'Incomplete', variant: 'secondary' },
    incomplete_expired: { label: 'Expired', variant: 'outline' },
    processing: { label: 'Processing', variant: 'primary' },
    failed: { label: 'Failed', variant: 'outline' },
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
    agency: { label: 'Agency', variant: 'primary' },
  };

  const config = planConfig[plan];

  return <Badge variant={config.variant} size={size} className={className}>{config.label}</Badge>;
}