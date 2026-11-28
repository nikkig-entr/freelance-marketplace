'use client';

import { forwardRef } from 'react';

interface BrandLogoProps extends React.SVGAttributes<SVGSVGElement> {
  size?: number;
  strokeWidth?: number;
}

/**
 * Bespoke Geometric Compass Monogram
 * - 48x48 viewBox for perfect scaling
 * - 1.25px stroke (configurable via strokeWidth prop)
 * - Zero fill, pure stroke geometry
 * - Architectural precision: cardinal axes + diagonal bisectors
 * - Center isometric stepped monolith = convergence point (marketplace meeting place)
 * - 8 outer vertices = 8 architectural photos / 8 directions
 * - Crosshair axes extend 4px beyond circle
 */
export const BrandLogo = forwardRef<SVGSVGElement, BrandLogoProps>(
  (
    {
      size = 32,
      strokeWidth = 1.25,
      className = '',
      style,
      'aria-label': ariaLabel = 'FreelanceHub',
      ...props
    },
    ref
  ) => {
    const viewBox = '0 0 48 48';
    const center = 24;
    const circleRadius = 21;       // Outer circle radius (r="21")
    const axisLength = circleRadius + 4; // Crosshair axes extend 4px beyond circle
    const innerMonolithSize = 10;  // Inner isometric monolith size

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
        {/* Outer Circle - The Boundary (1.25px stroke) */}
        <circle
          cx={center}
          cy={center}
          r={circleRadius}
          stroke="#FFFFFF"
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
        />

        {/* Cardinal Axes - N/S/E/W Crosshair extending 4px beyond circle */}
        <line
          x1={center}
          y1={center - axisLength}
          x2={center}
          y2={center + axisLength}
          stroke="#FFFFFF"
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
          opacity="0.6"
        />
        <line
          x1={center - axisLength}
          y1={center}
          x2={center + axisLength}
          y2={center}
          stroke="#FFFFFF"
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
          opacity="0.6"
        />

        {/* Inner Isometric Stepped Architectural Monolith Silhouette */}
        {/* Stepped monolith - three ascending blocks */}
        <path
          d={`M ${center - innerMonolithSize / 2} ${center + innerMonolithSize / 2}
             L ${center - innerMonolithSize / 2} ${center - innerMonolithSize / 6}
             L ${center - innerMonolithSize / 6} ${center - innerMonolithSize / 6}
             L ${center - innerMonolithSize / 6} ${center - innerMonolithSize / 2}
             L ${center + innerMonolithSize / 6} ${center - innerMonolithSize / 2}
             L ${center + innerMonolithSize / 6} ${center - innerMonolithSize * 5 / 6}
             L ${center + innerMonolithSize / 2} ${center - innerMonolithSize * 5 / 6}
             L ${center + innerMonolithSize / 2} ${center + innerMonolithSize / 2}
             Z`}
          stroke="#FFFFFF"
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
        />

        {/* Monolith center vertical line */}
        <line
          x1={center}
          y1={center - innerMonolithSize * 5 / 6}
          x2={center}
          y2={center + innerMonolithSize / 2}
          stroke="#FFFFFF"
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
          opacity="0.5"
        />

        {/* 8 Outer Vertices - The 8 Directions / 8 Photos */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x = center + circleRadius * Math.cos(rad);
          const y = center + circleRadius * Math.sin(rad);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={strokeWidth * 1.2}
              fill="#FFFFFF"
              opacity={0.8}
            />
          );
        })}

        {/* Subtle inner ring - depth indicator */}
        <circle
          cx={center}
          cy={center}
          r={innerMonolithSize * 0.6}
          stroke="#FFFFFF"
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
 * tracking-[0.28em] as per spec
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
      <span className="font-mono text-xs font-bold tracking-[0.28em] uppercase text-white select-none">
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