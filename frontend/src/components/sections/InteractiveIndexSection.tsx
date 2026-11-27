'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@tanstack/react-router';
import { CinemaMedia } from '@/components/ui/CinemaMedia';
import { DualLayerTextRoll } from '@/components/motion/DualLayerTextRoll';

const indexItems = [
  {
    id: 'idx-1',
    number: '01',
    title: 'Architecture & Spatial',
    subtitle: 'Architects, urban planners, spatial designers — mastering the built environment',
    counter: '42 PROJECTS',
    image: '/media/arch-02.jpg',
    href: '/projects',
  },
  {
    id: 'idx-2',
    number: '02',
    title: 'Digital Product Systems',
    subtitle: 'Product designers, design systems engineers, UX architects — systematic digital craft',
    counter: '38 PROJECTS',
    image: '/media/arch-04.jpg',
    href: '/projects',
  },
  {
    id: 'idx-3',
    number: '03',
    title: 'Creative Direction',
    subtitle: 'Art directors, brand strategists, creative technologists — vision made tangible',
    counter: '29 PROJECTS',
    image: '/media/arch-06.jpg',
    href: '/projects',
  },
  {
    id: 'idx-4',
    number: '04',
    title: 'Engineering & WebGL',
    subtitle: 'Creative developers, WebGL engineers, three.js specialists — code as craft',
    counter: '35 PROJECTS',
    image: '/media/arch-08.jpg',
    href: '/projects',
  },
];

export function InteractiveIndexSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mobileExpandedIndex, setMobileExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -20% 0px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={containerRef}
      className="w-full py-16 md:py-24 px-4 md:px-8 border-b border-white/15"
      data-lenis-prevent
    >
      <div className="container w-full">
        {/* Section Header */}
        <div
          className="mb-12 md:mb-16"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <p className="font-mono text-xs text-[var(--color-text-subtle)] tracking-wider uppercase mb-2">
            [ 02 / SELECTED DISCIPLINES & ARCHIVE ]
          </p>
        </div>

        {/* Full-bleed rows */}
        <div className="relative">
          {indexItems.map((item, index) => {
            const isHovered = hoveredIndex === index;
            const isAdjacentHovered = hoveredIndex !== null && hoveredIndex !== index;
            const isMobileExpanded = mobileExpandedIndex === index;
            const isLast = index === indexItems.length - 1;

            return (
              <motion.div
                key={item.id}
                className="relative group"
                style={{
                  opacity: isAdjacentHovered ? 0.2 : 1,
                  transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                onMouseEnter={() => {
                  if (window.matchMedia('(pointer: fine)').matches) {
                    setHoveredIndex(index);
                    setMobileExpandedIndex(null);
                  }
                }}
                onMouseLeave={() => {
                  if (window.matchMedia('(pointer: fine)').matches) {
                    setHoveredIndex(null);
                  }
                }}
                onClick={() => {
                  if (!window.matchMedia('(pointer: fine)').matches) {
                    setMobileExpandedIndex(prev => prev === index ? null : index);
                    setHoveredIndex(null);
                  }
                }}
              >
                {/* Row Content */}
                <Link
                  to={item.href}
                  className="flex items-center justify-between w-full py-8 md:py-10 border-t border-white/15 transition-colors hover:bg-white/[0.02]"
                  style={{
                    paddingRight: window.matchMedia('(min-width: 1024px)').matches && isHovered ? '520px' : '24px',
                  }}
                >
                  {/* Left: Number + Title + Subtitle + Counter */}
                  <div className="flex flex-col gap-3 md:gap-4 min-w-0 pr-8 md:pr-12">
                    <DualLayerTextRoll index={item.number} className="whitespace-nowrap">
                      {item.title}
                    </DualLayerTextRoll>
                    <p className="font-[Instrument_Serif] italic font-light text-[var(--color-text-muted)] leading-relaxed tracking-[0.01em] text-[clamp(0.875rem,1.2vw,1rem)] max-w-[480px]">
                      {item.subtitle}
                    </p>
                    <div className="font-mono text-xs text-[var(--color-text-subtle)] tracking-wider uppercase self-start mt-2">
                      [ {item.counter} → ]
                    </div>
                  </div>

                  {/* Right: Preview Image (desktop hover-only) */}
                  <AnimatePresence mode="wait">
                    {window.matchMedia('(min-width: 1024px)').matches && isHovered && (
                      <motion.div
                        key="preview"
                        initial={{ opacity: 0, scale: 0.95, x: 30 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95, x: 30 }}
                        transition={{
                          opacity: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
                          scale: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                          x: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                        }}
                        className="absolute right-8 lg:right-12 top-1/2 -translate-y-1/2 w-[380px] xl:w-[440px] aspect-[16/10] pointer-events-none z-10"
                        style={{ willChange: 'transform, opacity' }}
                      >
                        <CinemaMedia
                          src={item.image}
                          aspectRatio={16 / 10}
                          className="w-full h-full rounded-none"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Link>

                {/* Mobile expanded preview */}
                <AnimatePresence mode="wait">
                  {!window.matchMedia('(min-width: 1024px)').matches && isMobileExpanded && (
                    <motion.div
                      key={`mobile-preview-${index}`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="mt-6 border-t border-white/15 pt-6 overflow-hidden"
                    >
                      <div className="aspect-[16/9] w-full">
                        <CinemaMedia
                          src={item.image}
                          aspectRatio={16 / 9}
                          className="w-full h-full rounded-none"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Bottom hairline for last row */}
                {isLast && (
                  <div className="border-b border-white/15" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export { InteractiveIndexSection as default };