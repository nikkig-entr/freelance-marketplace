import { forwardRef, HTMLAttributes } from 'react';
import { clsx } from 'clsx';

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'narrow' | 'wide';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: ContainerSize;
  as?: React.ElementType;
  children: React.ReactNode;
}

const sizeClasses: Record<ContainerSize, string> = {
  sm: 'max-w-[640px]',
  md: 'max-w-[768px]',
  lg: 'max-w-[1024px]',
  xl: 'max-w-[1280px]',
  full: 'max-w-full',
  narrow: 'max-w-[800px]',
  wide: 'max-w-[1600px]',
};

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ size = 'xl', as: Component = 'div', className, children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={clsx(
          'mx-auto px-4 sm:px-6 lg:px-8 xl:px-10',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Container.displayName = 'Container';