'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { CinemaMedia } from '@/components/ui/CinemaMedia';

const indexItems = [
  {
    id: 'idx-1',
    number: '01',
    category: 'Architecture & Spatial',
    title: 'Architecture & Spatial',
    subtitle: 'Architects, urban planners, spatial designers — mastering the built environment',
    image: '/media/arch-01.jpg',
    href: '/talent?category=architecture',
  },
  {
    id: 'idx-2',
    number: '02',
    category: 'Digital Product Systems',
    title: 'Digital Product Systems',
    subtitle: 'Product designers, design systems engineers, UX architects — systematic digital craft',
    image: '/media/arch-02.jpg',
    href: '/talent?category=digital-product',
  },
  {
    id: 'idx-3',
    number: '03',
    category: 'Creative Direction',
    title: 'Creative Direction',
    subtitle: 'Art directors, brand strategists, creative technologists — vision made tangible',
    image: '/media/arch-03.jpg',
    href: '/talent?category=creative-direction',
  },
  {
    id: 'idx-4',
    number: '04',
    category: 'Engineering & WebGL',
    title: 'Engineering & WebGL',
    subtitle: 'Creative developers, WebGL engineers, three.js specialists — code as craft',
    image: '/media/arch-04.jpg',
    href: '/talent?category=engineering',
  },
];

export function InteractiveIndexSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const prefersReducedMotion = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Parallax transforms for each item
  const { scrollXProgress } = useScroll({
    target: trackRef,
    offset: ['start end', 'end start'],
  });

  const itemTransforms = indexItems.map((_, index) => {
    const speed = 0.15 + index * 0.02;
    return useTransform(scrollXProgress, [0, 1], [`${index * 15}%`, `${index * 15 - speed * 100}%`]);
  });

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
      className="relative min-h-screen flex items-center overflow-hidden border-t border-white/15"
      data-lenis-prevent
    >
      <div className="container w-full">
        {/* Full-screen vertical list */}
        <div
          ref={trackRef}
          className="relative flex flex-col h-full w-full"
          style={{ width: '100%' }}
        >
          {indexItems.map((item, index) => {
            const itemX = itemTransforms[index];
            const isHovered = hoveredIndex === index;
            const isAdjacentHovered = hoveredIndex !== null && hoveredIndex !== index;

            return (
              <motion.div
                key={item.id}
                className="relative flex items-center border-b border-white/15 group"
                style={{
                  height: '25vh',
                  minHeight: '180px',
                  maxHeight: '250px',
                  opacity: isAdjacentHovered ? 0.2 : 1,
                  transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Left Content - Number + Title */}
                <div className="absolute left-8 lg:left-12 z-10 w-[35%] max-w-[400px] pointer-events-none">
                  <div className="font-mono text-xs text-[var(--color-text-subtle)] tracking-wider uppercase mb-2">
                    {item.number}
                  </div>
                  <h3 className="font-heading font-bold text-[var(--color-text)] uppercase tracking-[-0.02em] leading-[0.95] text-[clamp(2rem,4vw,3.5rem)]">
                    {item.title}
                  </h3>
                  <p className="font-[Instrument_Serif] italic font-light text-[var(--color-text-muted)] leading-relaxed tracking-[0.01em] text-[clamp(0.875rem,1.5vw,1.125rem)] mt-2 max-w-[380px]">
                    {item.subtitle}
                  </p>
                </div>

                {/* Right Preview - Pure image, no text, no overlay */}
                <motion.div
                  className="absolute right-8 lg:right-12 w-[40%] max-w-[500px] h-[200px] pointer-events-none"
                  style={{
                    willChange: 'transform',
                    x: prefersReducedMotion ? 0 : itemX,
                    opacity: isHovered ? 1 : 0,
                    transform: prefersReducedMotion
                      ? undefined
                      : `translateX(${itemX.get()}px) scale(${isHovered ? 1 : 0.95})`,
                    transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <CinemaMedia
                    src={item.image}
                    aspectRatio={4 / 3}
                    className="w-full h-full rounded-none"
                  />
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[var(--color-text-subtle)] font-mono text-xs tracking-wider uppercase" style={{
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1.2s'
        }}>
          <svg className="w-4 h-4 animate-bounce" style={{ animationDuration: '2s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
          <span>Scroll to explore</span>
        </div>
      </div>
    </section>
  );
}

export { InteractiveIndexSection as default };