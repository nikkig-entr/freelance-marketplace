'use client';

import { Link } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { Hero3DMonolith } from '@/components/canvas/Hero3DMonolith';

export function HeroSection() {
  const [reduceMotion, setReduceMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef({ x: 0, y: 0 });

  // Pointer tracking for magnetic interaction
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      pointerRef.current.x = e.clientX - rect.left - rect.width * 0.5;
      pointerRef.current.y = e.clientY - rect.top - rect.height * 0.5;
    };

    const handleMouseLeave = () => {
      pointerRef.current.x = 0;
      pointerRef.current.y = 0;
    };

    const handleTouchStart = (e: TouchEvent) => {
      const rect = container.getBoundingClientRect();
      const touch = e.touches[0];
      pointerRef.current.x = touch.clientX - rect.left - rect.width * 0.5;
      pointerRef.current.y = touch.clientY - rect.top - rect.height * 0.5;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const rect = container.getBoundingClientRect();
      const touch = e.touches[0];
      pointerRef.current.x = touch.clientX - rect.left - rect.width * 0.5;
      pointerRef.current.y = touch.clientY - rect.top - rect.height * 0.5;
    };

    const handleTouchEnd = () => {
      pointerRef.current.x = 0;
      pointerRef.current.y = 0;
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
      className="relative w-full min-h-[100dvh] bg-[#050505] flex flex-col justify-between overflow-hidden"
      data-lenis-prevent
      style={{ willChange: 'transform' }}
    >
      {/*
         ZERO-CLIPPING HERO Z-INDEX TYPOGRAPHY SANDWICH:
         Layer order (back to front):
         1. Hero3DMonolith (z-[1]) - Real Three.js WebGL sculpture, absolute inset-0
         2. Top HUD metadata (z-[2]) - [ 00 / ARCHITECTURAL TALENT ARCHIVE ] / [ // INDEPENDENT PRACTICE 2026 ]
         3. Bottom monumental typography (z-[2]) - ARCHITECTURAL TALENT / Curated for Excellence with mix-blend-difference
         4. Bottom hairline bar with copy + CTA (z-[2])
      */}

      {/* Layer 1: 3D Monolith Canvas - full bleed, absolute, blends into #050505 */}
      <div className="absolute inset-0 w-full h-full z-[1] pointer-events-none" aria-hidden="true">
        <Hero3DMonolith
          reduceMotion={reduceMotion}
        />
      </div>

      {/* Layer 2: Top HUD Row */}
      <div className="relative z-[2] pt-24 px-4 md:px-8 flex flex-wrap justify-between gap-2 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-neutral-400 pointer-events-none">
        <span>[ 00 / ARCHITECTURAL TALENT ARCHIVE ]</span>
        <span>[ // INDEPENDENT PRACTICE 2026 ]</span>
      </div>

      {/* Layer 3: Bottom Monumental Typography with mix-blend-difference */}
      <div className="relative z-[2] mix-blend-difference px-4 md:px-8 pb-8 mt-auto w-full pointer-events-none">
        {/* Line 1: ARCHITECTURAL TALENT - Syne, extrabold, uppercase, zero-clipping */}
        <h1 className="font-['Syne'] font-extrabold uppercase text-[clamp(1.25rem,3.4vw,4.5rem)] leading-[0.94] tracking-[-0.02em] whitespace-nowrap text-white select-none">
          ARCHITECTURAL TALENT
        </h1>

        {/* Line 2: Curated for Excellence - Instrument Serif, italic */}
        <h2 className="font-['Instrument_Serif'] italic font-normal text-[clamp(1.55rem,4.1vw,5.2rem)] leading-[0.96] tracking-[-0.02em] text-white select-none mt-2">
          Curated for Excellence
        </h2>

        {/* Bottom hairline bar */}
        <div className="border-t border-white/15 pt-6 mt-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pointer-events-auto">
          <p className="max-w-md text-sm text-neutral-400 leading-relaxed font-['Instrument_Serif'] italic">
            Every professional vetted. Every project curated with precision.
          </p>
          <Link
            to="/projects"
            className="inline-flex items-center justify-center gap-2 border border-white px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] text-white hover:bg-white hover:text-[#050505] transition-all duration-300 min-h-[48px] w-full sm:w-auto"
          >
            EXPLORE ARCHIVE →
          </Link>
        </div>
      </div>
    </section>
  );
}

export { HeroSection as default };