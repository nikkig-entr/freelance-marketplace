'use client';

import { forwardRef, SVGProps } from 'react';

interface BrandLogoProps extends Omit<SVGProps<SVGSVGElement>, 'children' | 'viewBox'> {
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

export const BrandLogo = forwardRef<SVGSVGElement, BrandLogoProps>(
  (
    {
      size = 48,
      showWordmark = false,
      className = '',
      style,
      ...props
    },
    ref
  ) => (
    <svg
      ref={ref}
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={className}
      style={{ ...style, flexShrink: 0 }}
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {/* Outer architectural compass ring - 1px precision stroke */}
      <circle
        cx="24"
        cy="24"
        r="22"
        stroke="#FFFFFF"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Crosshair axes - architectural precision */}
      <g stroke="#FFFFFF" strokeWidth="0.75" strokeLinecap="round" opacity="0.6">
        {/* Vertical axis */}
        <line x1="24" y1="6" x2="24" y2="14" />
        <line x1="24" y1="34" x2="24" y2="42" />
        {/* Horizontal axis */}
        <line x1="6" y1="24" x2="14" y2="24" />
        <line x1="34" y1="24" x2="42" y2="24" />
      </g>

      {/* Isometric stepped monolith silhouette - architectural core */}
      <g stroke="#FFFFFF" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Base platform */}
        <path d="M14 32 L34 32" />
        <path d="M16 30 L32 30" />
        <path d="M18 28 L30 28" />
        <path d="M20 26 L28 26" />

        {/* Central tower - stepped elevation */}
        <path d="M22 26 L22 14" />
        <path d="M26 26 L26 16" />
        <path d="M20 26 L20 18" />

        {/* Top capstone */}
        <path d="M19 14 L27 14" />
        <path d="M20 12 L26 12" />
        <path d="M21 10 L25 10" />
        <path d="M22 8 L24 8" />

        {/* Right wing - receding steps */}
        <path d="M26 26 L32 26" />
        <path d="M28 24 L32 24" />
        <path d="M30 22 L32 22" />

        {/* Left wing - receding steps */}
        <path d="M20 26 L14 26" />
        <path d="M18 24 L14 24" />
        <path d="M16 22 L14 22" />
      </g>

      {/* Central crosshair intersection - precision anchor */}
      <circle
        cx="24"
        cy="21"
        r="1.5"
        fill="#FFFFFF"
        opacity="0.9"
      />

      {showWordmark && (
        <g transform="translate(24, 52)" className="brand-wordmark">
          <text
            x="0"
            y="0"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#FFFFFF"
            fontFamily="'JetBrains Mono', 'Fira Code', monospace"
            fontSize="4.2"
            fontWeight="600"
            letterSpacing="0.12em"
            textLength="120"
            lengthAdjust="spacingAndGlyphs"
          >
            FREELANCEHUB
          </text>
        </g>
      )}
    </svg>
  )
);

BrandLogo.displayName = 'BrandLogo';

export default BrandLogo;