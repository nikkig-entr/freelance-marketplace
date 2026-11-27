'use client';

import { useState, useRef, useEffect } from 'react';

interface DualLayerTextRollProps {
  children: React.ReactNode;
  index: string;
  className?: string;
}

export function DualLayerTextRoll({
  children,
  index,
  className = '',
}: DualLayerTextRollProps) {
  const [isHovering, setIsHovering] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden inline-block ${className}`}
      style={{ perspective: '400px' }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Layer 1 - Default text (slides up and out) */}
      <div
        className="flex items-center gap-3 transition-transform duration-360 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          transform: isHovering ? 'translateY(-100%)' : 'translateY(0)',
          opacity: isHovering ? 0 : 1,
        }}
      >
        <span className="font-mono text-[var(--color-text-subtle)] text-xs tracking-wider">
          {index}
        </span>
        <span className="font-heading font-medium text-[var(--color-text-muted)] uppercase tracking-[0.1em]">
          {children}
        </span>
      </div>

      {/* Layer 2 - Hover text (slides up from bottom) */}
      <div
        className="absolute left-0 top-full flex items-center gap-3 transition-transform duration-360 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          transform: isHovering ? 'translateY(-100%)' : 'translateY(0)',
          opacity: isHovering ? 1 : 0,
          whiteSpace: 'nowrap',
        }}
      >
        <span className="font-mono text-[var(--color-white)] text-xs tracking-wider">
          {index}
        </span>
        <span className="font-heading font-medium text-[var(--color-white)] uppercase tracking-[0.1em]">
          {children}
        </span>
      </div>
    </div>
  );
}

export { DualLayerTextRoll as default };