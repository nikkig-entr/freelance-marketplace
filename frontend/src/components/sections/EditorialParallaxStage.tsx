'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from '@tanstack/react-router';
import { CinemaMedia } from '@/components/ui/CinemaMedia';
import { SplitTextReveal } from '@/components/motion/SplitTextReveal';
import { useLenis } from '@/hooks/useLenis';

export function EditorialParallaxStage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Scroll progress from Lenis
  useEffect(() => {
    if (!lenis) return;

    const handleScroll = () => {
      const progress = lenis.limit > 0 ? lenis.scroll / lenis.limit : 0;
      setScrollProgress(Math.max(0, Math.min(1, progress)));
    };

    lenis.on('scroll', handleScroll);
    handleScroll();

    return () => lenis.off('scroll', handleScroll);
  }, [lenis]);

  // Intersection observer for entrance animation
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Calculate transforms based on scroll progress
  const translateX1 = reduceMotion ? 0 : scrollProgress * -40; // -40%
  const translateX2 = reduceMotion ? 0 : scrollProgress * 40;  // 40%
  const photo1Y = reduceMotion ? 0 : (scrollProgress - 0.5) * 120; // 60% to -60%
  const photo2Y = reduceMotion ? 0 : (scrollProgress - 0.3) * 120; // -40% to 80%

  return (
    <section
      ref={containerRef}
      className="relative border-t border-[var(--color-border)] w-full"
      data-lenis-prevent
      style={{ willChange: 'transform' }}
    >
      {/* Parallax Container */}
      <div className="relative" style={{ willChange: 'transform' }}>
        {/* BACKGROUND LAYER: B&W Photography with vertical parallax */}
        <div className="absolute inset-0 -z-10 pointer-events-none" aria-hidden="true" style={{ willChange: 'transform' }}>
          {/* Photo 1: arch-01 - moves up */}
          <motion.div
            className="absolute left-0 top-0 w-full h-full"
            style={{
              y: `${photo1Y}%`,
              transform: `translateY(${photo1Y}%)`,
              willChange: 'transform',
            }}
          >
            <CinemaMedia
              src="/media/arch-01.jpg"
              aspectRatio={16 / 9}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Photo 2: arch-02 - moves down */}
          <motion.div
            className="absolute left-0 top-0 w-full h-full"
            style={{
              y: `${photo2Y}%`,
              transform: `translateY(${photo2Y}%)`,
              willChange: 'transform',
            }}
          >
            <CinemaMedia
              src="/media/arch-02.jpg"
              aspectRatio={16 / 9}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>

        {/* MIDDLE LAYER: Hollow display typography bands - opposing horizontal scroll */}
        <div className="relative h-[60vh] min-h-[400px] max-h-[550px] flex items-center justify-center overflow-hidden pointer-events-none" style={{ willChange: 'transform' }}>
          {/* Band 1: SELECTED ARCHIVE - hollow, moves left */}
          <motion.div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-max whitespace-nowrap"
            style={{
              x: `${translateX1}%`,
              transform: `translateX(${translateX1}%)`,
              willChange: 'transform',
            }}
          >
            <h2 className="font-heading font-extrabold uppercase tracking-[-0.02em] leading-[0.85] text-[clamp(4rem,12vw,14rem)] text-transparent -webkit-text-stroke-[1px]_rgba(255,255,255,0.45) select-none">
              SELECTED ARCHIVE&nbsp;&nbsp;SELECTED ARCHIVE&nbsp;&nbsp;SELECTED ARCHIVE
            </h2>
          </motion.div>

          {/* Band 2: INDEPENDENT PRACTICE - hollow, moves right */}
          <motion.div
            className="absolute right-0 top-1/2 -translate-y-1/2 w-max whitespace-nowrap"
            style={{
              x: `${translateX2}%`,
              transform: `translateX(${translateX2}%)`,
              willChange: 'transform',
            }}
          >
            <h2 className="font-heading font-extrabold uppercase tracking-[-0.02em] leading-[0.85] text-[clamp(4rem,12vw,14rem)] text-transparent -webkit-text-stroke-[1px]_rgba(255,255,255,0.45) select-none text-right">
              INDEPENDENT PRACTICE&nbsp;&nbsp;INDEPENDENT PRACTICE&nbsp;&nbsp;INDEPENDENT PRACTICE
            </h2>
          </motion.div>
        </div>
      </div>

      {/* EDITORIAL MANIFESTO - Clean 12-column grid with hairlines */}
      <div className="container relative z-10 border-b border-[var(--color-border)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 py-16 md:py-20">
          {/* Left Column - Editorial Manifesto (span 5) */}
          <div className="lg:col-span-5 pt-4 lg:pt-8">
            <div
              className="mb-8 lg:mb-12"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <span className="font-mono text-xs text-[var(--color-text-subtle)] tracking-wider uppercase block mb-4">
                [ 01 / PRACTICE ]
              </span>
              <SplitTextReveal
                splitBy="lines"
                delay={0.2}
                stagger={0.1}
                duration={1}
                ease={[0.16, 1, 0.3, 1] as const}
                as="h3"
                className="font-editorial italic font-light text-[var(--color-text-muted)] leading-[0.95] text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
              >
                We believe the future
                <br />
                of architectural practice
                <br />
                is a partnership
              </SplitTextReveal>
            </div>

            <p
              className="font-editorial italic font-light text-[var(--color-text-muted)] leading-relaxed tracking-[0.01em] text-[clamp(1.125rem,2vw,1.5rem)] mb-12 max-w-none"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
              }}
            >
              Every project posted, every proposal sent, every milestone reached is a step toward a world where talent finds its match without friction, where clients find craft without compromise, and where the best work rises on merit alone.
            </p>

            {/* Architectural hairline divider */}
            <div
              className="w-16 h-px bg-[var(--color-text-subtle)] mb-6"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
              }}
            />
            <Link
              to="/projects"
              className="inline-flex items-center justify-center gap-2 border border-[var(--color-white)] px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-text)] hover:bg-[var(--color-white)] hover:text-[var(--color-bg)] transition-all duration-300 min-h-[48px] w-full sm:w-auto"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s',
              }}
            >
              VIEW ROSTER
            </Link>
          </div>

          {/* Right Column - Cinema Frame (span 7) */}
          <div
            className="lg:col-span-7 relative"
            data-cursor="PLAY REEL"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
              transition: 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1) 0.15s',
            }}
          >
            <div className="aspect-[16/10] w-full overflow-hidden">
              <CinemaMedia
                src="/media/arch-03.jpg"
                aspectRatio={16 / 10}
                className="w-full h-full object-cover rounded-none"
              />
            </div>

            {/* Precision grid hairlines overlay */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              {/* Vertical hairlines */}
              <div className="absolute inset-0 flex justify-between px-4">
                {[...Array(11)].map((_, i) => (
                  <div key={i} className="w-px h-full bg-white/5" style={{ left: `${(i + 1) / 12 * 100}%` }} />
                ))}
              </div>
              {/* Horizontal hairlines */}
              <div className="absolute inset-0 flex flex-col justify-between py-4">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="h-px w-full bg-white/5" style={{ top: `${(i + 1) / 8 * 100}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export { EditorialParallaxStage as default };