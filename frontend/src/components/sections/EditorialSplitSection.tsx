'use client';

import { useRef, useEffect, useState } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';
import { CinemaMedia } from '@/components/ui/CinemaMedia';

const manifestoText = `We believe the future of architectural practice is not a marketplace — it's a partnership. Every project posted, every proposal sent, every milestone reached is a step toward a world where talent finds its match without friction, where clients find craft without compromise, and where the best work rises on merit alone.`;

export function EditorialSplitSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const { scrollXProgress } = useScroll({
    target: trackRef,
    offset: ['start end', 'end start'],
  });

  const imagesX = useTransform(scrollXProgress, [0, 1], ['0%', '-30%']);
  const textX = useTransform(scrollXProgress, [0, 1], ['0%', '15%']);

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
      className="relative py-20 lg:py-32 overflow-hidden border-t border-white/15"
      data-lenis-prevent
    >
      <div className="container">
        {/* Section Label */}
        <div className="mb-12 lg:mb-16" style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s'
        }}>
          <span className="font-mono text-xs text-[var(--color-text-subtle)] tracking-wider uppercase">
            Editorial
          </span>
        </div>

        {/* Horizontal Scroll Container - 2 column grid */}
        <div
          ref={trackRef}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 border-b border-white/15 pb-16"
          style={{ width: '100%' }}
        >
          {/* Left Column - Manifesto Text (span 6) */}
          <motion.div
            className="lg:col-span-6 pt-4 lg:pt-8"
            style={{
              opacity: isVisible ? 1 : 0,
              willChange: 'transform',
              transition: isVisible ? 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s' : 'none',
              x: prefersReducedMotion ? 0 : textX,
            }}
          >
            <p className="font-[Instrument_Serif] italic font-light text-[var(--color-text-muted)] leading-relaxed tracking-[0.01em] text-[clamp(1.125rem,2.5vw,1.5rem)] mb-12">
              {manifestoText}
            </p>

            {/* Accent line */}
            <div className="w-16 h-px bg-[var(--color-text-subtle)] mb-6" />
            <p className="font-mono text-xs text-[var(--color-text-subtle)] tracking-wider uppercase">
              FreelanceHub — 2026
            </p>
          </motion.div>

          {/* Right Column - Video (span 6) */}
          <motion.div
            className="lg:col-span-6 relative"
            style={{
              opacity: isVisible ? 1 : 0,
              willChange: 'transform',
              transition: isVisible ? 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1) 0.5s' : 'none',
              x: prefersReducedMotion ? 0 : imagesX,
            }}
          >
            <CinemaMedia
              src="/media/studio-reel.mp4"
              poster="/media/arch-02.jpg"
              autoPlay={true}
              muted={true}
              loop={true}
              playsInline={true}
              aspectRatio={16 / 9}
              className="w-full h-full"
            />
          </motion.div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[var(--color-text-subtle)] font-mono text-xs tracking-wider uppercase" style={{
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1.2s'
        }}>
          <svg className="w-4 h-4 animate-bounce" style={{ animationDuration: '2s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12l-7 7-7-7" />
          </svg>
          <span>Drag or scroll horizontally</span>
        </div>
      </div>
    </section>
  );
}

export { EditorialSplitSection as default };