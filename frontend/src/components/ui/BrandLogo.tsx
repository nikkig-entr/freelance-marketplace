'use client';

import { forwardRef } from 'react';

interface BrandLogoProps extends React.SVGAttributes<SVGSVGElement> {
  size?: number;
  strokeWidth?: number;
}

/**
 * Bespoke Geometric Compass Monogram
 * - 48x48 viewBox for perfect scaling
 * - 2px stroke (configurable via strokeWidth prop)
 * - Zero fill, pure stroke geometry
 * - Architectural precision: cardinal axes + diagonal bisectors
 * - Center diamond = convergence point (marketplace meeting place)
 * - 8 outer vertices = 8 architectural photos / 8 directions
 */
export const BrandLogo = forwardRef<SVGSVGElement, BrandLogoProps>(
  (
    {
      size = 48,
      strokeWidth = 2,
      className = '',
      style,
      'aria-label': ariaLabel = 'FreelanceHub',
      ...props
    },
    ref
  ) => {
    const viewBox = '0 0 48 48';
    const center = 24;
    const outerRadius = 20;    // Outer circle radius
    const innerRadius = 12;    // Inner diamond radius
    const cardinalRadius = 16; // Cardinal points radius

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox={viewBox}
        fill="none"
        aria-label={ariaLabel}
        role="img"
        className={`shrink-0 transition-opacity duration-300 ${className}`}
        style={{
          ...style,
          strokeWidth: strokeWidth,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }}
        {...props}
      >
        {/* Outer Circle - The Boundary */}
        <circle
          cx={center}
          cy={center}
          r={outerRadius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
        />

        {/* Cardinal Axes - N/S/E/W Crosshair */}
        <line
          x1={center}
          y1={center - outerRadius}
          x2={center}
          y2={center + outerRadius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
          opacity="0.6"
        />
        <line
          x1={center - outerRadius}
          y1={center}
          x2={center + outerRadius}
          y2={center}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
          opacity="0.6"
        />

        {/* Diagonal Bisectors - NE/NW/SE/SW */}
        <line
          x1={center - cardinalRadius * 0.7071}
          y1={center - cardinalRadius * 0.7071}
          x2={center + cardinalRadius * 0.7071}
          y2={center + cardinalRadius * 0.7071}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
          opacity="0.4"
        />
        <line
          x1={center + cardinalRadius * 0.7071}
          y1={center - cardinalRadius * 0.7071}
          x2={center - cardinalRadius * 0.7071}
          y2={center + cardinalRadius * 0.7071}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
          opacity="0.4"
        />

        {/* Center Diamond - Convergence Point */}
        <path
          d={`M ${center} ${center - innerRadius}
             L ${center + innerRadius} ${center}
             L ${center} ${center + innerRadius}
             L ${center - innerRadius} ${center}
             Z`}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
        />

        {/* 8 Outer Vertices - The 8 Directions / 8 Photos */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x = center + outerRadius * Math.cos(rad);
          const y = center + outerRadius * Math.sin(rad);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={strokeWidth * 1.5}
              fill="currentColor"
              opacity={0.8}
            />
          );
        })}

        {/* Subtle inner ring - depth indicator */}
        <circle
          cx={center}
          cy={center}
          r={innerRadius * 0.5}
          stroke="currentColor"
          strokeWidth={strokeWidth * 0.5}
          vectorEffect="non-scaling-stroke"
          opacity="0.3"
        />
      </svg>
    );
  }
);

BrandLogo.displayName = 'BrandLogo';

/**
 * Wordmark variant - Logo + "FREELANCEHUB" text
 * Used in footer and mobile drawer header
 */
export function BrandWordmark({
  size = 32,
  gap = 12,
  className = '',
  style,
  ...restProps
}: {
  size?: number;
  gap?: number;
  className?: string;
  style?: React.CSSProperties;
} & Omit<BrandLogoProps, 'size'>) {
  // Only pass valid div props (filter out SVG-specific props)
  const divProps: React.HTMLAttributes<HTMLDivElement> = {
    style,
    ...restProps,
  } as React.HTMLAttributes<HTMLDivElement>;

  return (
    <div className={`inline-flex items-center gap-${gap / 4} ${className}`} {...divProps}>
      <BrandLogo size={size} {...restProps} />
      <span className="font-mono text-xs tracking-[0.35em] uppercase text-[var(--color-text)] select-none">
        FREELANCEHUB
      </span>
    </div>
  );
}

/**
 * Minimal variant - Just the logo mark
 * Used in header, preloader, favicon contexts
 */
export function BrandMark({
  size = 48,
  className = '',
  ...props
}: {
  size?: number;
  className?: string;
} & Omit<BrandLogoProps, 'size'>) {
  return <BrandLogo size={size} className={className} {...props} />;
}

export default BrandLogo;