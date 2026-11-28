'use client';

import { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export function ScrollArchitectureRail() {
  const [isVisible, setIsVisible] = useState(false);

  // Framer Motion scroll values
  const { scrollYProgress } = useScroll();

  // Spring-smoothed progress for buttery indicator
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.8,
  });

  // Percentage readout
  const percentage = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 25,
    mass: 0.6,
  });

  // Show only after some scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (typeof window === 'undefined' || window.innerWidth < 1280) {
    return null;
  }

  return (
    <motion.div
      className="fixed right-3 top-1/2 -translate-y-1/2 z-30 flex-col items-center gap-3 pointer-events-none mix-blend-difference hidden xl:flex"
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      role="img"
      aria-label="Scroll progress indicator"
    >
      {/* Vertical 1px architectural progress ruler */}
      <div className="relative w-px h-36 bg-white/20" aria-hidden="true">
        {/* Live sliding white indicator */}
        <motion.div
          className="absolute left-0 w-px h-6 bg-white"
          style={{
            originY: 0,
            y: smoothProgress,
            transform: 'translateY(-50%)',
          }}
        />
      </div>

      {/* Real-time percentage readout - JetBrains Mono */}
      <motion.span
        className="font-mono text-[10px] tracking-[0.15em] text-white/60 whitespace-nowrap select-none"
        style={{
          transform: percentage.get() < 0.01 ? 'translateY(0)' : 'translateY(0)',
        }}
      >
        {percentage.get() * 100 < 10
          ? `00${Math.round(percentage.get() * 100)}%`
          : percentage.get() * 100 < 100
          ? `0${Math.round(percentage.get() * 100)}%`
          : '100%'}
      </motion.span>
    </motion.div>
  );
}

export default ScrollArchitectureRail;