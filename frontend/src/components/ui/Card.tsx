import { clsx } from 'clsx';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  bordered?: boolean;
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({ children, className, hover = false, padding = 'md', bordered = true }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-white rounded-xl transition-shadow duration-200',
        bordered && 'border border-secondary-200',
        hover && 'hover:shadow-card-hover cursor-pointer',
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, action }: {
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div className={clsx('flex items-center justify-between mb-4', className)}>
      <div>{children}</div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardTitle({ children, className, subtitle }: {
  children: ReactNode;
  className?: string;
  subtitle?: ReactNode;
}) {
  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-secondary-900">{children}</h3>
      {subtitle && <p className="mt-0.5 text-sm text-secondary-500">{subtitle}</p>}
    </div>
  );
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx('', className)}>{children}</div>;
}

export function CardFooter({ children, className, divided = true }: {
  children: ReactNode;
  className?: string;
  divided?: boolean;
}) {
  return (
    <div className={clsx('mt-4 pt-4 flex items-center', divided && 'border-t border-secondary-200', className)}>
      {children}
    </div>
  );
}

export function CardGrid({ children, columns = 3, gap = 6, className }: {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: number;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        'grid gap-6',
        {
          1: 'grid-cols-1',
          2: 'grid-cols-1 md:grid-cols-2',
          3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
          4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        }[columns],
        className
      )}
      style={{ gap: `${gap}px` }}
    >
      {children}
    </div>
  );
}