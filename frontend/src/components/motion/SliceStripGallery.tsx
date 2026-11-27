'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CinemaMedia } from '@/components/ui/CinemaMedia';

interface SliceItem {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  image: string;
  href: string;
}

const sliceItems: SliceItem[] = [
  {
    id: 'slice-1',
    number: '01',
    title: 'ARCHITECTURE &\nSPATIAL',
    subtitle: 'Architects, urban planners, spatial designers — mastering the built environment',
    image: '/media/arch-01.jpg',
    href: '/talent?category=architecture',
  },
  {
    id: 'slice-2',
    number: '02',
    title: 'DIGITAL PRODUCT\nSYSTEMS',
    subtitle: 'Product designers, design systems engineers, UX architects — systematic digital craft',
    image: '/media/arch-02.jpg',
    href: '/talent?category=digital-product',
  },
  {
    id: 'slice-3',
    number: '03',
    title: 'CREATIVE\nDIRECTION',
    subtitle: 'Art directors, brand strategists, creative technologists — vision made tangible',
    image: '/media/arch-03.jpg',
    href: '/talent?category=creative-direction',
  },
  {
    id: 'slice-4',
    number: '04',
    title: 'ENGINEERING &\nWEBGL',
    subtitle: 'Creative developers, WebGL engineers, three.js specialists — code as craft',
    image: '/media/arch-04.jpg',
    href: '/talent?category=engineering',
  },
  {
    id: 'slice-5',
    number: '05',
    title: 'INTERIOR &\nENVIRONMENT',
    subtitle: 'Interior architects, environmental designers, exhibit designers — space as experience',
    image: '/media/arch-01.jpg',
    href: '/talent?category=interior',
  },
  {
    id: 'slice-6',
    number: '06',
    title: 'BRAND &\nIDENTITY',
    subtitle: 'Brand architects, identity systems, typographic designers — visual language',
    image: '/media/arch-02.jpg',
    href: '/talent?category=brand',
  },
  {
    id: 'slice-7',
    number: '07',
    title: 'MOTION &\nINTERACTION',
    subtitle: 'Motion designers, interaction architects, prototypists — behavior as design',
    image: '/media/arch-03.jpg',
    href: '/talent?category=motion',
  },
  {
    id: 'slice-8',
    number: '08',
    title: 'RESEARCH &\nSTRATEGY',
    subtitle: 'Design researchers, strategists, futurists — insight driving innovation',
    image: '/media/arch-04.jpg',
    href: '/talent?category=research',
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

  return (
    <section
      ref={containerRef}
      className="relative py-14 md:py-20 px-4 md:px-8 border-b border-white/15 overflow-hidden"
      data-lenis-prevent
    >
      {/* Top Precision Tick-Mark Ruler & Active Index Readout */}
      <div className="flex items-center justify-between mb-8 md:mb-12 px-2 md:px-0">
        {/* Tick marks - precision ruler */}
        <div className="flex items-center gap-1 md:gap-2 flex-1 md:mr-8" aria-hidden="true">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={`tick-${i}`}
              className="h-px w-1 md:w-2 bg-white/10"
              style={{
                opacity: i % 4 === 0 ? 0.6 : 0.3,
                transform: `scaleY(${i % 4 === 0 ? 1.5 : 1})`,
              }}
            />
          ))}
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

      {/* Slice Strip - Horizontal Accordion */}
      <div
        className="flex items-stretch gap-0 md:gap-1 overflow-x-auto scrollbar-hide pb-4 md:pb-0"
        style={{ width: '100%', maxWidth: '100vw' }}
        role="list"
        aria-label="Discipline slices"
      >
        {sliceItems.map((item, index) => {
          const isActive = activeIndex === index;
          const isMobileCollapsed = isMobile && !isActive;

          return (
            <motion.div
              key={item.id}
              ref={(el) => { sliceRefs.current[index] = el; }}
              className={`relative flex-shrink-0 flex flex-col overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isMobile
                  ? 'h-[280px] min-w-[44px] md:min-w-[60px]'
                  : 'h-[420px] min-w-[80px]'
              }`}
              style={{
                // Desktop: flex-1 collapsed, flex-[3.5] expanded
                // Mobile: min-w-[44px] collapsed, flex-1 expanded
                flex: isActive ? (isMobile ? 1 : 3.5) : 1,
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
            >
              {/* Slice Background Image */}
              <div
                className="absolute inset-0 z-0"
                aria-hidden="true"
              >
                <CinemaMedia
                  src={item.image}
                  aspectRatio={4 / 5}
                  className="w-full h-full object-cover"
                />
                {/* Dark overlay for text readability */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-[#050505]/90 via-[#050505]/40 to-transparent"
                  style={{ opacity: isActive ? 0.7 : 0.5 }}
                />
                {/* Active glow edge */}
                {isActive && (
                  <div className="absolute inset-0 border-l-2 border-r-2 border-white/60 pointer-events-none" />
                )}
              </div>

              {/* Slice Content - Typography split around active slice */}
              <div
                id={`slice-content-${index}`}
                className="relative z-10 flex flex-col justify-between h-full p-4 md:p-6 lg:p-8"
              >
                {/* Top: Number & Title */}
                <div className="mb-auto">
                  <div className="font-mono text-[var(--color-text-subtle)] text-xs md:text-sm tracking-wider uppercase mb-2 md:mb-3">
                    {item.number}
                  </div>
                  <AnimatePresence mode="wait">
                    {isActive ? (
                      <motion.h3
                        key="expanded"
                        className="font-heading font-bold text-[var(--color-white)] uppercase leading-[0.9] tracking-[-0.02em] text-[clamp(1.25rem,3vw,2.5rem)] md:text-[clamp(1.75rem,4vw,3.5rem)]"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      >
                        {item.title}
                      </motion.h3>
                    ) : (
                      <motion.h3
                        key="collapsed"
                        className="font-heading font-bold text-[var(--color-white)] uppercase leading-[0.9] tracking-[-0.02em] text-[clamp(1rem,2.5vw,1.5rem)] md:text-[clamp(1.25rem,3vw,2rem)] writing-mode vertical-rl text-orientation: mixed"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      >
                        {item.title.replace(/\n/g, ' ')}
                      </motion.h3>
                    )}
                  </AnimatePresence>
                </div>

                {/* Bottom: Subtitle & CTA - Only visible when active */}
                <AnimatePresence mode="wait">
                  {isActive && (
                    <motion.div
                      key="subtitle"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                      className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-white/15"
                    >
                      <p className="font-[Instrument_Serif] italic font-light text-[var(--color-text-muted)] leading-relaxed tracking-[0.01em] text-sm md:text-base mb-4 md:mb-6 max-w-xs md:max-w-md">
                        {item.subtitle}
                      </p>
                      <a
                        href={item.href}
                        className="inline-flex items-center justify-center gap-2 border border-white px-4 py-2.5 font-mono text-xs md:text-sm uppercase tracking-[0.18em] hover:bg-white hover:text-black transition-colors min-h-[44px] w-full sm:w-auto"
                      >
                        EXPLORE →
                      </a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile collapsed indicator */}
              {isMobileCollapsed && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[var(--color-text-subtle)] pointer-events-none">
                  <span className="font-mono text-xs tracking-wider">{item.number}</span>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M19 12l-7 7-7-7" />
                  </svg>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

export { SliceStripGallery as default };