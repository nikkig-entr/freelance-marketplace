'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useAnimationControls, animate } from 'framer-motion';
import { useLenis } from '@/hooks/useLenis';

interface ScrollArchitectureRailProps {
  /** Custom selector for the scroll container (unused - kept for API compatibility) */
  target?: string;
}

/**
 * Scroll Architecture Rail - Fixed Right-Edge Progress Ruler
 *
 * Museum-grade scroll indicator using Lenis for buttery smooth progress tracking.
 * Only visible on desktop (xl: 1280px+).
 *
 * Features:
 * - 1px architectural hairline ruler (h-36 = 144px)
 * - Live sliding white indicator with spring physics
 * - Real-time percentage readout in JetBrains Mono
 * - Mix-blend-mode: difference for perfect visibility on any background
 * - Fades in after 100px scroll
 */
export function ScrollArchitectureRail({ target: _target }: ScrollArchitectureRailProps = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const lenis = useLenis();
  const controls = useAnimationControls();
  const progressRef = useRef(0);

  // Spring configuration for buttery smooth indicator
  const springConfig = {
    stiffness: 180,
    damping: 35,
    mass: 0.8,
  };

  // Percentage spring - slightly more responsive
  const percentageSpringConfig = {
    stiffness: 160,
    damping: 30,
    mass: 0.6,
  };

  // Update progress from Lenis scroll
  useEffect(() => {
    if (!lenis) return;

    const handleScroll = () => {
      const scrollProgress = lenis.limit > 0 ? lenis.scroll / lenis.limit : 0;
      const clampedProgress = Math.max(0, Math.min(1, scrollProgress));
      progressRef.current = clampedProgress;
      setProgress(clampedProgress);

      // Update visibility
      setIsVisible(lenis.scroll > 100);
    };

    lenis.on('scroll', handleScroll);
    // Initial check
    handleScroll();

    return () => lenis.off('scroll', handleScroll);
  }, [lenis]);

  // Framer Motion spring animation for the indicator position
  useEffect(() => {
    const springProgress = animate(progressRef.current, progress, {
      ...springConfig,
      duration: 0.8,
    });

    return () => springProgress.stop();
  }, [progress]);

  // Framer Motion spring for percentage text
  const [displayPercentage, setDisplayPercentage] = useState(0);
  useEffect(() => {
    const springPercentage = animate(displayPercentage, progress, {
      ...percentageSpringConfig,
      duration: 0.6,
      onUpdate: (latest) => setDisplayPercentage(latest),
    });

    return () => springPercentage.stop();
  }, [progress]);

  // Visibility animation
  useEffect(() => {
    if (isVisible) {
      controls.start({ opacity: 1 });
    } else {
      controls.start({ opacity: 0 });
    }
  }, [isVisible, controls]);

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

  const percentage = Math.round(displayPercentage * 100);
  const percentageStr = percentage < 10 ? `00${percentage}%` : percentage < 100 ? `0${percentage}%` : '100%';

  return (
    <motion.div
      className="fixed right-6 top-1/2 -translate-y-1/2 z-30 flex flex-col items-end gap-4 pointer-events-none mix-blend-difference xl:flex"
      animate={controls}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      role="img"
      aria-label="Scroll progress indicator"
      aria-hidden="true"
      style={{ willChange: 'transform, opacity' }}
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

        {/* Live sliding white indicator - spring animated */}
        <motion.div
          className="absolute left-0 w-px h-6 bg-white rounded-none"
          style={{
            originY: 0,
            y: progress,
            transform: 'translateY(-50%)',
          }}
          animate={{ y: progress }}
          transition={springConfig}
        />

        {/* Top cap */}
        <div className="absolute -top-1 left-[-2px] w-[5px] h-[5px] border border-white/15 rounded-none" />

        {/* Bottom cap */}
        <div className="absolute bottom-1 left-[-2px] w-[5px] h-[5px] border border-white/15 rounded-none" />
      </div>

      {/* Real-time percentage readout - JetBrains Mono */}
      <motion.span
        className="font-mono text-[10px] tracking-[0.15em] text-white/70 whitespace-nowrap select-none text-right"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {percentageStr}
      </motion.span>

      {/* Scroll direction hint - subtle */}
      <motion.div
        className="flex flex-col items-end gap-1 opacity-30"
        animate={{ y: [0, 4, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/40">SCROLL</span>
        <svg className="w-3 h-3 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </motion.div>
    </motion.div>
  );
}

export default ScrollArchitectureRail;