import { clsx } from 'clsx';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <svg
      className={clsx('animate-spin text-[var(--color-accent)]', sizeClasses[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
      role="status"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
      <LoadingSpinner size="lg" />
    </div>
  );
}

export function CardLoader() {
  return (
    <div className="card animate-pulse">
      <div className="card-header">
        <div className="h-6 w-3/4 bg-[var(--color-surface-hover)] rounded animate-pulse" />
      </div>
      <div className="card-body space-y-4">
        <div className="h-4 w-full bg-[var(--color-surface-hover)] rounded animate-pulse" />
        <div className="h-4 w-2/3 bg-[var(--color-surface-hover)] rounded animate-pulse" />
        <div className="h-4 w-1/2 bg-[var(--color-surface-hover)] rounded animate-pulse" />
      </div>
    </div>
  );
}

export function ListLoader(count = 5) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardLoader key={i} />
      ))}
    </div>
  );
}