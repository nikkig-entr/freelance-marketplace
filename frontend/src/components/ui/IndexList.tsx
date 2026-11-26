'use client';

import { useState, useRef, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

export interface IndexListItem {
  id: string | number;
  index: number;
  title: string;
  subtitle?: string;
  href: string;
  search?: Record<string, string>;
  onHover?: () => void;
  onLeave?: () => void;
}

interface IndexListProps {
  items: IndexListItem[];
  emptyMessage?: string;
  emptyDescription?: string;
  columnCount?: 1 | 2 | 3;
  className?: string;
}

function IndexListRow({
  item,
  isHovered,
  onHover,
  onLeave,
}: {
  item: IndexListItem;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  const [textOffset, setTextOffset] = useState(0);
  const textRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isHovered && textRef.current && containerRef.current) {
      const textWidth = textRef.current.scrollWidth;
      const containerWidth = containerRef.current.clientWidth;
      if (textWidth > containerWidth) {
        setTextOffset(-(textWidth - containerWidth + 24));
      }
    } else {
      setTextOffset(0);
    }
  }, [isHovered]);

  const handleMouseEnter = () => {
    onHover();
    if (item.onHover) item.onHover();
  };

  const handleMouseLeave = () => {
    onLeave();
    if (item.onLeave) item.onLeave();
  };

  return (
    <Link
      to={item.href}
      search={item.search}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        relative flex items-center gap-4 py-4 px-0
        transition-all duration-300
        ${isHovered ? 'bg-[var(--glass-bg)]' : ''}
        ${isHovered ? 'pl-2' : ''}
      `}
      aria-label={`View ${item.title}`}
    >
      <span
        className="font-mono text-headline-5 font-extrabold text-[var(--color-text-subtle)] tabular-nums w-14 text-right select-none transition-all duration-300"
        aria-hidden="true"
      >
        {String(item.index).padStart(2, '0')}
      </span>
      <div
        ref={containerRef}
        className="flex-1 min-w-0 overflow-hidden"
        style={{ width: 'calc(100% - 6rem)' }}
      >
        <span
          ref={textRef}
          className="inline-block text-headline-6 font-bold text-[var(--color-text)] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            transform: `translateX(${textOffset}px)`,
            willChange: 'transform',
          }}
        >
          {item.title}
        </span>
        {item.subtitle && (
          <p className="mt-1 text-body-sm text-[var(--color-text-muted)] line-clamp-1">
            {item.subtitle}
          </p>
        )}
      </div>
      <ChevronRightIcon
        className={`
          w-5 h-5 text-[var(--color-text-subtle)]
          transition-all duration-300
          ${isHovered ? 'text-[var(--color-text)] translate-x-2' : 'opacity-0'}
        `}
        aria-hidden="true"
      />
    </Link>
  );
}

export function IndexList({
  items,
  emptyMessage = 'No items found',
  emptyDescription = 'Try adjusting your search or filters',
  columnCount = 1,
  className = '',
}: IndexListProps) {
  const [hoveredId, setHoveredId] = useState<string | number | null>(null);

  if (items.length === 0) {
    return (
      <div className="text-center py-16 lg:py-24">
        <div className="w-16 h-16 text-[var(--color-text-subtle)] mx-auto mb-4">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-headline-4 font-bold text-[var(--color-text)] mb-2">{emptyMessage}</h3>
        <p className="text-[var(--color-text-muted)] mb-6 max-w-md mx-auto">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className={columnCount > 1 ? `grid grid-cols-1 md:grid-cols-${columnCount} gap-0` : ''}>
        {items.map((item) => (
          <div
            key={item.id}
            className={`
              border-b border-[var(--color-border)] last:border-0
              ${columnCount > 1 ? 'border-r border-[var(--color-border)] md:last:border-r-0' : ''}
            `}
          >
            <IndexListRow
              item={item}
              isHovered={hoveredId === item.id}
              onHover={() => setHoveredId(item.id)}
              onLeave={() => setHoveredId(null)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function IndexListSkeleton({ count = 6, columnCount = 1 }: { count?: number; columnCount?: 1 | 2 | 3 }) {
  return (
    <div className={columnCount > 1 ? `grid grid-cols-1 md:grid-cols-${columnCount} gap-0` : ''}>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="border-b border-[var(--color-border)] last:border-0 animate-pulse"
        >
          <div className="flex items-center gap-4 py-4 px-0">
            <span className="font-mono text-headline-5 font-extrabold text-[var(--color-text-subtle)] tabular-nums w-14 text-right">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="flex-1 min-w-0">
              <div className="h-8 bg-[var(--glass-bg-strong)] rounded-none w-3/4" />
              <div className="mt-2 h-5 bg-[var(--glass-bg-strong)] rounded-none w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}