import { forwardRef, HTMLAttributes } from 'react';
import { clsx } from 'clsx';

export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
export type HeadingSize = 'display' | 'display-sm' | 'headline-1' | 'headline-2' | 'headline-3' | 'headline-4' | 'headline-5' | 'headline-6';

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: HeadingLevel;
  size?: HeadingSize;
  weight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  color?: 'primary' | 'muted' | 'subtle' | 'accent' | 'inverse';
  align?: 'left' | 'center' | 'right';
  gradient?: boolean;
  children: React.ReactNode;
}

const sizeClasses: Record<HeadingSize, string> = {
  'display': 'text-display',
  'display-sm': 'text-display-sm',
  'headline-1': 'text-headline-1',
  'headline-2': 'text-headline-2',
  'headline-3': 'text-headline-3',
  'headline-4': 'text-headline-4',
  'headline-5': 'text-headline-5',
  'headline-6': 'text-headline-6',
};

const weightClasses = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
};

const colorClasses = {
  primary: 'text-primary',
  muted: 'text-muted',
  subtle: 'text-subtle',
  accent: 'text-accent',
  inverse: 'text-inverse',
};

const alignClasses = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const levelToDefaultSize: Record<HeadingLevel, HeadingSize> = {
  h1: 'headline-1',
  h2: 'headline-2',
  h3: 'headline-3',
  h4: 'headline-4',
  h5: 'headline-5',
  h6: 'headline-6',
};

export const Heading = forwardRef<HTMLHeadingElement | null, HeadingProps>(
  ({ as: Level = 'h2', size, weight = 'bold', color = 'primary', align = 'left', gradient = false, className, children, ...props }, ref) => {
    const level = Level;
    const defaultSize = levelToDefaultSize[level];
    const resolvedSize = size || defaultSize;

    return (
      <Level
        ref={ref}
        className={clsx(
          'font-heading tracking-tight',
          sizeClasses[resolvedSize],
          weightClasses[weight],
          colorClasses[color],
          alignClasses[align],
          gradient && 'text-gradient-accent',
          className
        )}
        {...props}
      >
        {children}
      </Level>
    );
  }
);

Heading.displayName = 'Heading';