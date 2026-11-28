'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

interface ScrollArchitectureRailProps {
  /** Custom selector for the scroll container (unused - kept for API compatibility) */
  target?: string;
}

/**
 * Scroll Architecture Rail - Fixed Right-Edge Progress Ruler
 *
 * Museum-grade scroll indicator using Framer Motion's useScroll + useSpring.
 * Only visible on desktop (xl: 1280px+).
 *
 * Features:
 * - 1px architectural hairline ruler (h-36 = 144px)
 * - Live sliding white indicator with spring physics (stiffness: 160, damping: 30, mass: 0.2)
 * - Real-time percentage readout in JetBrains Mono via direct ref.textContent (ZERO React re-renders)
 * - Mix-blend-mode: difference for perfect visibility on any background
 * - Fades in after 100px scroll
 */
export function ScrollArchitectureRail({ target: _target }: ScrollArchitectureRailProps = {}) {
  const indicatorRef = useRef<HTMLDivElement>(null);
  const percentageRef = useRef<HTMLSpanElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  // Framer Motion scroll tracking - no React state
  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ['start start', 'end end'],
  });

  // Spring for indicator position (scaleY)
  const indicatorSpring = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 30,
    mass: 0.2,
  });

  // Spring for percentage display
  const percentageSpring = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 30,
    mass: 0.2,
  });

  // Visibility spring - fades in after 100px scroll
  const visibilitySpring = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 30,
    mass: 0.2,
  });

  // Direct DOM updates - ZERO React re-renders
  useEffect(() => {
    const unsubscribeIndicator = indicatorSpring.on('change', (latest: number) => {
      if (indicatorRef.current) {
        indicatorRef.current.style.scale = `1 ${latest}`;
        indicatorRef.current.style.transformOrigin = 'center top';
      }
    });

    const unsubscribePercentage = percentageSpring.on('change', (latest: number) => {
      if (percentageRef.current) {
        const percentage = Math.round(latest * 100);
        percentageRef.current.textContent =
          percentage < 10 ? `00${percentage}%` : percentage < 100 ? `0${percentage}%` : '100%';
      }
    });

    const unsubscribeVisibility = visibilitySpring.on('change', (latest: number) => {
      if (railRef.current) {
        railRef.current.style.opacity = latest > 0.05 ? '1' : '0';
      }
    });

    return () => {
      unsubscribeIndicator();
      unsubscribePercentage();
      unsubscribeVisibility();
    };
  }, [indicatorSpring, percentageSpring, visibilitySpring]);

  // Hide on mobile / small screens
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1280);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (!isDesktop || typeof window === 'undefined') {
    return null;
  }

  return (
    <motion.div
      ref={railRef}
      className="fixed right-6 top-1/2 -translate-y-1/2 z-30 flex flex-col items-end gap-4 pointer-events-none mix-blend-difference xl:flex"
      initial={{ opacity: 0 }}
      style={{ willChange: 'transform, opacity', opacity: 0 }}
      role="img"
      aria-label="Scroll progress indicator"
      aria-hidden="true"
    >
      {/* Vertical 1px architectural progress ruler */}
      <div className="relative w-px h-36 bg-white/15" aria-hidden="true">
        {/* Subtle tick marks every 25% */}
        {[0.25, 0.5, 0.75].map((tick) => (
          <div
            key={tick}
            className="absolute left-[-3px] w-[4px] h-px bg-white/20"
            style={{ top: `${tick * 100}%`, transform: 'translateY(-50%)' }}
          />
        ))}

        {/* Live sliding white indicator - spring animated via ref */}
        <div
          ref={indicatorRef}
          className="absolute left-0 w-px h-6 bg-white rounded-none"
          style={{
            transform: 'scaleY(0)',
            transformOrigin: 'center top',
          }}
        />

        {/* Top cap */}
        <div className="absolute -top-1 left-[-2px] w-[5px] h-[5px] border border-white/15 rounded-none" />

        {/* Bottom cap */}
        <div className="absolute bottom-1 left-[-2px] w-[5px] h-[5px] border border-white/15 rounded-none" />
      </div>

      {/* Real-time percentage readout - JetBrains Mono, direct ref updates */}
      <span
        ref={percentageRef}
        className="font-mono text-[10px] tracking-[0.15em] text-white/70 whitespace-nowrap select-none text-right"
      >
        000%
      </span>

      {/* Scroll direction hint - subtle */}
      <div className="flex flex-col items-end gap-1 opacity-30">
        <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/40">SCROLL</span>
        <svg className="w-3 h-3 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </motion.div>
  );
}

export default ScrollArchitectureRail;