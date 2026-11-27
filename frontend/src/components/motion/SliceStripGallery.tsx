'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CinemaMedia } from '@/components/ui/CinemaMedia';

interface SliceItem {
  id: string;
  number: string;
  discipline: string;
  subtitle: string;
  image: string;
  href: string;
}

const sliceItems: SliceItem[] = [
  {
    id: 'slice-1',
    number: '01',
    discipline: 'BRUTALIST SPATIAL SYSTEMS',
    subtitle: 'Raw concrete geometries defining civic presence',
    image: '/media/arch-01.jpg',
    href: '/talent?category=architecture',
  },
  {
    id: 'slice-2',
    number: '02',
    discipline: 'MINIMALIST MUSEUM ARCHITECTURE',
    subtitle: 'Light, shadow, and void as primary materials',
    image: '/media/arch-02.jpg',
    href: '/talent?category=architecture',
  },
  {
    id: 'slice-3',
    number: '03',
    discipline: 'BRUTALIST EDUCATIONAL MONUMENTS',
    subtitle: 'Monolithic forms serving collective knowledge',
    image: '/media/arch-03.jpg',
    href: '/talent?category=architecture',
  },
  {
    id: 'slice-4',
    number: '04',
    discipline: 'MINIMALIST SACRED GEOMETRIES',
    subtitle: 'Spiritual space through material reduction',
    image: '/media/arch-04.jpg',
    href: '/talent?category=architecture',
  },
  {
    id: 'slice-5',
    number: '05',
    discipline: 'BRUTALIST HOUSING COMPLEXES',
    subtitle: 'Modular habitats as urban sculpture',
    image: '/media/arch-05.jpg',
    href: '/talent?category=architecture',
  },
  {
    id: 'slice-6',
    number: '06',
    discipline: 'MUSEUM ARCHITECTURE AS SCULPTURE',
    subtitle: 'Titanium curves folding into the city fabric',
    image: '/media/arch-06.jpg',
    href: '/talent?category=architecture',
  },
  {
    id: 'slice-7',
    number: '07',
    discipline: 'BRUTALIST CULTURAL INFRASTRUCTURE',
    subtitle: 'Concrete megastructures housing the arts',
    image: '/media/arch-07.jpg',
    href: '/talent?category=architecture',
  },
  {
    id: 'slice-8',
    number: '08',
    discipline: 'MINIMALIST ART ISLAND ARCHITECTURE',
    subtitle: 'Site-specific pavilions in dialogue with nature',
    image: '/media/arch-08.jpg',
    href: '/talent?category=architecture',
  },
];

export function SliceStripGallery() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sliceRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeIndex === null) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (prev === null ? 0 : Math.min((prev ?? 0) + 1, sliceItems.length - 1)));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (prev === null ? 0 : Math.max((prev ?? 0) - 1, 0)));
      } else if (e.key === 'Escape') {
        setActiveIndex(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex]);

  const handleSliceClick = useCallback((index: number) => {
    setActiveIndex((prev) => (prev === index ? null : index));
  }, []);

  const handleSliceMouseEnter = useCallback((index: number) => {
    if (!isMobile) {
      setActiveIndex(index);
    }
  }, [isMobile]);

  const handleSliceMouseLeave = useCallback(() => {
    if (!isMobile) {
      setActiveIndex(null);
    }
  }, [isMobile]);

  const activeItem = useMemo(() => sliceItems[activeIndex ?? 0], [activeIndex]);

  return (
    <section
      ref={containerRef}
      className="relative py-14 md:py-20 px-4 md:px-8 border-b border-white/15 overflow-hidden"
      data-lenis-prevent
    >
      {/* Precision Tick-Mark Ruler & Active Index Readout */}
      <div className="flex items-center justify-between mb-8 md:mb-12 px-2 md:px-0">
        {/* Tick marks - precision ruler */}
        <div className="flex items-center gap-1 md:gap-1.5 flex-1 md:mr-8" aria-hidden="true" role="img" aria-label="Slice position indicator">
          {Array.from({ length: 32 }).map((_, i) => (
            <motion.div
              key={`tick-${i}`}
              className="h-px w-1 md:w-1.5 bg-white/10"
              style={{
                opacity: i % 4 === 0 ? 0.6 : 0.25,
                transform: `scaleY(${i % 4 === 0 ? 1.8 : 1})`,
              }}
              animate={{
                opacity: activeIndex !== null && i === Math.floor((activeIndex / (sliceItems.length - 1)) * 31) ? 1 : (i % 4 === 0 ? 0.6 : 0.25),
                scaleY: activeIndex !== null && i === Math.floor((activeIndex / (sliceItems.length - 1)) * 31) ? 2.5 : (i % 4 === 0 ? 1.8 : 1),
              }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            />
          ))}
          {/* Active tick indicator */}
          {activeIndex !== null && (
            <motion.div
              className="absolute h-px w-1.5 md:w-2 bg-white"
              style={{
                left: `${(activeIndex / (sliceItems.length - 1)) * 100}%`,
                transform: 'translateX(-50%) scaleY(3)',
                opacity: 1,
              }}
              animate={{
                left: `${(activeIndex / (sliceItems.length - 1)) * 100}%`,
              }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />
          )}
        </div>

        {/* Active index readout */}
        <div className="flex items-center gap-3 font-mono text-xs md:text-sm text-[var(--color-text-muted)] tracking-wider uppercase whitespace-nowrap flex-shrink-0">
          <span className="text-[var(--color-white)] font-medium">
            {activeIndex !== null ? String(activeIndex + 1).padStart(2, '0') : '—'}
          </span>
          <span className="hidden sm:inline">/</span>
          <span className="hidden sm:inline">{String(sliceItems.length).padStart(2, '0')}</span>
        </div>
      </div>

      {/* Monumental Split-Typography Header Row */}
      <div className="flex items-baseline justify-between gap-8 mb-8 md:mb-10 px-2 md:px-0">
        <div className="flex-1 min-w-0">
          <motion.span
            className="font-display font-extrabold tracking-[-0.03em] leading-[0.9] text-white text-[clamp(1.5rem,4vw,3rem)] md:text-[clamp(2rem,5vw,4rem)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            SELECTED
          </motion.span>
        </div>
        <div className="flex flex-col items-end gap-1 min-w-[200px]">
          <motion.span
            className="font-display font-extrabold tracking-[-0.03em] leading-[0.9] text-white text-[clamp(1.5rem,4vw,3rem)] md:text-[clamp(2rem,5vw,4rem)] text-right"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          >
            ARCHIVE
          </motion.span>
          <AnimatePresence mode="wait">
            <motion.p
              key={activeIndex ?? 'none'}
              className="font-mono text-xs md:text-sm text-[var(--color-text-subtle)] tracking-wider uppercase text-right"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeIndex !== null ? `${activeItem.number} — ${activeItem.discipline}` : 'HOVER A SLICE TO REVEAL'}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Slice Strip - Horizontal Accordion */}
      <div
        className="flex items-stretch gap-1.5 md:gap-1.5 overflow-x-auto scrollbar-hide pb-4 md:pb-0"
        style={{ width: '100%', maxWidth: '100vw' }}
        role="list"
        aria-label="Architectural discipline slices"
      >
        {sliceItems.map((item, index) => {
          const isActive = activeIndex === index;
          const isMobileCollapsed = isMobile && !isActive;

          return (
            <motion.div
              key={item.id}
              ref={(el) => { sliceRefs.current[index] = el; }}
              className={`relative flex-shrink-0 flex flex-col overflow-hidden ${
                isMobile
                  ? 'h-[300px] min-w-[44px]'
                  : 'h-[440px] min-w-[80px]'
              }`}
              style={{
                // Desktop: flex-1 collapsed, flex-[4.5] expanded
                // Mobile: min-w-[44px] collapsed, flex-1 expanded
                flex: isActive ? (isMobile ? 1 : 4.5) : 1,
                minWidth: isMobileCollapsed ? '44px' : undefined,
              }}
              role="listitem"
              onClick={() => handleSliceClick(index)}
              onMouseEnter={() => handleSliceMouseEnter(index)}
              onMouseLeave={handleSliceMouseLeave}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSliceClick(index);
                }
              }}
              aria-selected={isActive}
              aria-controls={`slice-content-${index}`}
              aria-expanded={isActive}
              aria-label={`${item.number}. ${item.discipline}`}
              layout
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            >
              {/* Slice Background Image - Pure, borderless, edge-to-edge */}
              <div
                className="absolute inset-0 z-0"
                aria-hidden="true"
              >
                <CinemaMedia
                  src={item.image}
                  aspectRatio={isMobile ? 3 / 4 : 16 / 20}
                  className="w-full h-full object-cover"
                  priority={isActive}
                />
                {/* Subtle dark gradient only for active slice readability - no text overlay on inactive */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/60 via-transparent to-transparent pointer-events-none" />
                )}
                {/* Active slice edge glow */}
                {isActive && (
                  <div className="absolute inset-0 border-l border-r border-white/30 pointer-events-none" />
                )}
              </div>

              {/* Mobile collapsed indicator - only number visible */}
              {isMobileCollapsed && (
                <div className="relative z-10 flex items-center justify-center h-full">
                  <span className="font-mono text-xs md:text-sm tracking-wider text-white/70 writing-mode vertical-rl text-orientation: mixed">
                    {item.number}
                  </span>
                </div>
              )}

              {/* Active slice content overlay - only visible when expanded */}
              <AnimatePresence mode="wait">
                {isActive && (
                  <motion.div
                    key="active-content"
                    id={`slice-content-${index}`}
                    className="relative z-10 flex flex-col justify-end h-full p-6 md:p-8 lg:p-10 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                  >
                    <div className="w-full max-w-full">
                      <p className="font-mono text-xs md:text-sm text-white/50 tracking-wider uppercase mb-2 md:mb-3">
                        {item.number} / {sliceItems.length}
                      </p>
                      <p className="font-display font-bold text-white uppercase leading-[0.9] tracking-[-0.02em] text-[clamp(1.25rem,3vw,2.5rem)] md:text-[clamp(1.75rem,4vw,3.5rem)] mb-4 md:mb-6">
                        {item.discipline}
                      </p>
                      <p className="font-[Instrument_Serif] italic font-light text-white/70 leading-relaxed tracking-[0.01em] text-sm md:text-base max-w-xs md:max-w-md mb-6 md:mb-8">
                        {item.subtitle}
                      </p>
                      <a
                        href={item.href}
                        className="inline-flex items-center justify-center gap-2 border border-white px-5 py-3 font-mono text-xs md:text-sm uppercase tracking-[0.18em] hover:bg-white hover:text-black transition-colors min-h-[48px] w-full sm:w-auto pointer-events-auto"
                      >
                        EXPLORE
                        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

export { SliceStripGallery as default };