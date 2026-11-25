import { forwardRef, HTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { Container, ContainerProps } from './Container';

export type SectionSize = 'sm' | 'md' | 'lg';

interface SectionProps extends HTMLAttributes<HTMLElement> {
  size?: SectionSize;
  container?: boolean | ContainerProps;
  as?: React.ElementType;
  children: React.ReactNode;
}

const sizeClasses: Record<SectionSize, string> = {
  sm: 'py-12 sm:py-16 lg:py-20',
  md: 'py-20 sm:py-24 lg:py-32 xl:py-40',
  lg: 'py-24 sm:py-32 lg:py-40 xl:py-48',
};

export const Section = forwardRef<HTMLElement, SectionProps>(
  ({ size = 'md', container = true, as: Component = 'section', className, children, ...props }, ref) => {
    const content = container
      ? (
        <Container size={typeof container === 'object' ? container.size : undefined} {...(typeof container === 'object' ? container : {})}>
          {children}
        </Container>
      )
      : children;

    return (
      <Component
        ref={ref}
        className={clsx(
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {content}
      </Component>
    );
  }
);

Section.displayName = 'Section';