'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';
import { CinemaMedia } from '@/components/ui/CinemaMedia';

const manifestoText = `We believe the future of architectural practice is not a marketplace — it's a partnership. Every project posted, every proposal sent, every milestone reached is a step toward a world where talent finds its match without friction, where clients find craft without compromise, and where the best work rises on merit alone.`;

export function EditorialSplitSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const prefersReducedMotion = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll progress for parallax
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const imagesY = useTransform(scrollYProgress, [0, 1], ['0%', '-20%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);

  // Mouse/touch move handler for parallax tilt
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;

    const rect = imageRef.current?.getBoundingClientRect();
    if (!rect) return;

    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;

    setMousePosition({ x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) });
  }, [prefersReducedMotion]);

  const handleMouseLeave = useCallback(() => {
    if (!prefersReducedMotion) {
      setMousePosition({ x: 0.5, y: 0.5 });
    }
  }, [prefersReducedMotion]);

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

  // Calculate transform values for parallax tilt
  const tiltX = (mousePosition.y - 0.5) * 8; // -4deg to +4deg
  const tiltY = (mousePosition.x - 0.5) * -8; // +4deg to -4deg
  const scale = 1.02 + Math.abs(mousePosition.x - 0.5) * 0.02 + Math.abs(mousePosition.y - 0.5) * 0.02; // 1.02 to 1.04

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
            01 / Editorial Manifesto
          </span>
        </div>

        {/* Horizontal Scroll Container - 12 column Swiss grid */}
        <div
          className="grid grid-cols-1 lg:grid-cols-12 border-b border-white/15"
          style={{ width: '100%' }}
        >
          {/* Left Column - Manifesto Text (span 5) */}
          <motion.div
            className="lg:col-span-5 lg:border-r border-white/15 p-6 md:p-12 flex flex-col justify-between gap-10"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
              transition: 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s, transform 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
              y: prefersReducedMotion ? 0 : textY,
            }}
          >
            {/* Header */}
            <div>
              <span className="font-mono text-xs text-[var(--color-text-subtle)] tracking-wider uppercase mb-6 block">
                01 / EDITORIAL MANIFESTO
              </span>
              <h2 className="font-[Instrument_Serif] italic font-light text-white leading-[0.95] tracking-[-0.01em] text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
                {manifestoText}
              </h2>
            </div>

            {/* View Roster Button */}
            <div className="pt-4">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-3 border border-white px-6 py-3.5 font-mono text-xs md:text-sm uppercase tracking-[0.18em] hover:bg-white hover:text-black transition-colors min-h-[48px] w-full sm:w-auto"
              >
                VIEW ROSTER
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </motion.div>

          {/* Right Column - Parallax Image + Manifesto (span 7) */}
          <motion.div
            className="lg:col-span-7 p-6 md:p-12 flex flex-col gap-8"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
              transition: 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1) 0.4s, transform 1s cubic-bezier(0.16, 1, 0.3, 1) 0.4s',
              y: prefersReducedMotion ? 0 : imagesY,
            }}
          >
            {/* Interactive Parallax Frame */}
            <div
              ref={imageRef}
              className="relative aspect-[16/10] w-full overflow-hidden"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onTouchMove={handleMouseMove}
              onTouchEnd={handleMouseLeave}
              data-cursor="EXPLORE"
            >
              <motion.div
                className="absolute inset-0"
                style={{
                  transform: prefersReducedMotion ? 'none' : `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${scale})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  willChange: 'transform',
                }}
              >
                <CinemaMedia
                  src="/media/arch-01.jpg"
                  aspectRatio={16 / 10}
                  className="w-full h-full object-cover"
                  priority={true}
                />
              </motion.div>
            </div>

            {/* Constrained Manifesto Text - 2 columns, proper spacing, no clipping */}
            <div className="w-full max-w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 text-[var(--color-text-muted)] leading-relaxed tracking-[0.01em] text-base md:text-lg">
              <p className="font-[Instrument_Serif] italic font-light">
                We believe the future of architectural practice is not a marketplace — it&apos;s a partnership.
              </p>
              <p className="font-[Instrument_Serif] italic font-light">
                Every project posted, every proposal sent, every milestone reached is a step toward a world where talent finds its match without friction.
              </p>
              <p className="font-[Instrument_Serif] italic font-light md:col-span-2">
                Where clients find craft without compromise, and where the best work rises on merit alone.
              </p>
              <p className="font-mono text-xs tracking-wider uppercase text-[var(--color-text-subtle)] md:col-span-2 pt-4 border-t border-white/15">
                FreelanceHub — 2026
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export { EditorialSplitSection as default };