import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';
import { Slot } from '@radix-ui/react-slot';

export type CardVariant = 'default' | 'strong' | 'subtle';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  hover?: boolean;
  asChild?: boolean;
}

const paddingClasses: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] border border-[var(--glass-border)]',
  strong: 'bg-[var(--glass-bg-strong)] backdrop-blur-[var(--glass-blur-strong)] border border-[var(--glass-border)]',
  subtle: 'bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] border border-[var(--glass-border)]/50',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      className,
      hover = false,
      padding = 'md',
      variant = 'default',
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'div';

    return (
      <Comp
        ref={ref}
        className={clsx(
          'rounded-2xl transition-all duration-300',
          variantClasses[variant],
          hover && 'hover:border-[var(--glass-border-hover)] hover:bg-[var(--glass-bg-strong)] hover:shadow-[var(--shadow-lg)] cursor-pointer',
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);

Card.displayName = 'Card';

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  action?: ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, className, action, ...props }, ref) => (
    <div ref={ref} className={clsx('flex items-center justify-between mb-4', className)} {...props}>
      <div>{children}</div>
      {action && <div>{action}</div>}
    </div>
  )
);

CardHeader.displayName = 'CardHeader';

export interface CardTitleProps extends HTMLAttributes<HTMLDivElement> {
  subtitle?: ReactNode;
}

export const CardTitle = forwardRef<HTMLDivElement, CardTitleProps>(
  ({ children, className, subtitle, ...props }, ref) => (
    <div ref={ref} className={clsx('', className)} {...props}>
      <h3 className="text-lg font-semibold text-[var(--color-text)]">{children}</h3>
      {subtitle && <span className="mt-0.5 text-caption text-[var(--color-text-muted)]">{subtitle}</span>}
    </div>
  )
);

CardTitle.displayName = 'CardTitle';

export const CardBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={clsx('', className)} {...props}>
      {children}
    </div>
  )
);

CardBody.displayName = 'CardBody';

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  divided?: boolean;
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, className, divided = true, ...props }, ref) => (
    <div ref={ref} className={clsx('mt-4 pt-4 flex items-center', divided && 'border-t border-[var(--color-border)]', className)} {...props}>
      {children}
    </div>
  )
);

CardFooter.displayName = 'CardFooter';

export interface CardGridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4;
  gap?: number;
}

export const CardGrid = forwardRef<HTMLDivElement, CardGridProps>(
  ({ children, columns = 3, gap = 6, className, ...props }, ref) => (
    <div
      ref={ref}
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
      {...props}
    >
      {children}
    </div>
  )
);

CardGrid.displayName = 'CardGrid';