'use client';

import { Link } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { Hero3DMonolith } from '@/components/canvas/Hero3DMonolith';
import { SplitTextReveal } from '@/components/motion/SplitTextReveal';
import { useLenis } from '@/hooks/useLenis';

export function HeroSection() {
  const lenis = useLenis();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Pointer tracking for magnetic interaction
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      setPointer({
        x: e.clientX - rect.left - rect.width * 0.5,
        y: e.clientY - rect.top - rect.height * 0.5,
      });
    };

    const handleMouseLeave = () => {
      setPointer(null);
    };

    const handleTouchStart = (e: TouchEvent) => {
      const rect = container.getBoundingClientRect();
      const touch = e.touches[0];
      setPointer({
        x: touch.clientX - rect.left - rect.width * 0.5,
        y: touch.clientY - rect.top - rect.height * 0.5,
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      const rect = container.getBoundingClientRect();
      const touch = e.touches[0];
      setPointer({
        x: touch.clientX - rect.left - rect.width * 0.5,
        y: touch.clientY - rect.top - rect.height * 0.5,
      });
    };

    const handleTouchEnd = () => {
      setPointer(null);
    };

    container.addEventListener('mousemove', handleMouseMove, { passive: true });
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[100dvh] flex flex-col justify-between pt-16 pb-8 px-4 md:px-8 overflow-hidden"
      data-lenis-prevent
      style={{ willChange: 'transform' }}
    >
      {/*
         3D Z-INDEX TYPOGRAPHY SANDWICH:
         Layer order (back to front):
         1. Hero3DMonolith (z-0) - Real Three.js WebGL sculpture
         2. Monumental typography with mix-blend-difference (z-10) - ARCHITECTURAL TALENT / Curated for Excellence
         3. HUD metadata (z-20) - [ 00 / ... ]
         4. Bottom hairline bar with copy + CTA (z-20)
      */}

      {/* Layer 1: 3D Monolith Canvas - full bleed, blends seamlessly into #050505 */}
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <Hero3DMonolith
          scrollProgress={scrollProgress}
          pointer={pointer}
          reduceMotion={reduceMotion}
        />
      </div>

      {/* Layer 2: Monumental Display Typography with mix-blend-difference */}
      {/* This sits "through" the monolith - letters invert where monolith passes */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 pointer-events-none" style={{ perspective: '1000px' }}>
        <div className="text-center w-full px-4">
          {/* Line 1: ARCHITECTURAL TALENT - Bold Syne/Unbounded uppercase */}
          <h1 className="font-heading font-extrabold uppercase leading-[0.92] tracking-[-0.03em] whitespace-nowrap text-[var(--color-white)] text-[clamp(2rem,5vw,6rem)] mb-4 mix-blend-difference select-none" style={{ transform: 'translateZ(40px)' }}>
            <SplitTextReveal
              splitBy="words"
              delay={0}
              stagger={0.05}
              duration={1.2}
              ease="cubic-bezier(0.16, 1, 0.3, 1)"
              immediate={true}
              as="span"
            >
              ARCHITECTURAL TALENT
            </SplitTextReveal>
          </h1>

          {/* Line 2: Curated for Excellence - Tall italic Instrument Serif */}
          <h2 className="font-editorial italic font-light leading-[0.95] text-[var(--color-white)] text-[clamp(2.25rem,5.5vw,7rem)] mb-2 mix-blend-difference select-none" style={{ transform: 'translateZ(80px)' }}>
            <SplitTextReveal
              splitBy="words"
              delay={0.1}
              stagger={0.05}
              duration={1.2}
              ease="cubic-bezier(0.16, 1, 0.3, 1)"
              immediate={true}
              as="span"
            >
              Curated for Excellence
            </SplitTextReveal>
          </h2>
        </div>
      </div>

      {/* Layer 3: Top HUD Metadata */}
      <div className="relative z-20 flex justify-between font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-text-subtle)] pointer-events-none">
        <span>[ 00 / ARCHITECTURAL TALENT ARCHIVE ]</span>
        <span>[ // INDEPENDENT PRACTICE 2026 ]</span>
      </div>

      {/* Layer 4: Bottom Hairline Bar - Editorial Copy Left + CTA Right */}
      <div className="relative z-20 w-full pointer-events-auto">
        <div className="border-t border-[var(--color-border)] pt-6 mt-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <p className="max-w-md text-sm text-[var(--color-text-muted)] leading-relaxed font-editorial italic">
            Every professional vetted. Every project curated with precision.
          </p>
          <Link
            to="/projects"
            className="inline-flex items-center justify-center gap-2 border border-[var(--color-white)] px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-text)] hover:bg-[var(--color-white)] hover:text-[var(--color-bg)] transition-all duration-300 min-h-[56px] w-full sm:w-auto"
          >
            EXPLORE ARCHIVE →
          </Link>
        </div>
      </div>
    </section>
  );
}

export { HeroSection as default };