import { ReactNode } from 'react';

interface AmbientBackgroundProps {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  opacity?: 'subtle' | 'default' | 'strong';
  position?: 'center' | 'top-center';
}

const sizeClasses = {
  sm: 'w-[400px] h-[400px]',
  md: 'w-[600px] h-[600px]',
  lg: 'w-[700px] h-[700px]',
  xl: 'w-[800px] h-[800px]',
};

const opacityClasses = {
  subtle: 'bg-[var(--color-accent)]/1',
  default: 'bg-[var(--color-accent)]/2',
  strong: 'bg-[var(--color-accent)]/3',
};

const positionClasses = {
  center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  'top-center': 'top-0 left-1/2 -translate-x-1/2',
};

export function AmbientBackground({
  children,
  size = 'lg',
  opacity = 'default',
  position = 'top-center',
}: AmbientBackgroundProps) {
  return (
    <div className="relative">
      {/* Subtle ambient depth */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div
          className={`
            absolute rounded-full blur-[150px]
            ${sizeClasses[size]}
            ${opacityClasses[opacity]}
            ${positionClasses[position]}
          `}
        />
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}