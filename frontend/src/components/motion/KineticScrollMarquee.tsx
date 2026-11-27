'use client';

import { useRef } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';

interface KineticScrollMarqueeProps {
  texts?: string[];
  className?: string;
  speed?: number; // Multiplier for scroll speed
}

export function KineticScrollMarquee({
  texts = [
    'ARCHITECTURAL TALENT ARCHIVE  —  INDEPENDENT PRACTICE 2026  —  ARCHITECTURAL TALENT ARCHIVE  —  INDEPENDENT PRACTICE 2026',
    'ARCHITECTURAL TALENT ARCHIVE  —  INDEPENDENT PRACTICE 2026  —  ARCHITECTURAL TALENT ARCHIVE  —  INDEPENDENT PRACTICE 2026',
  ],
  className = '',
  speed = 1,
}: KineticScrollMarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start end', 'end start'],
  });

  // Two rows moving in opposite directions
  const row1X = useTransform(scrollYProgress, [0, 1], [`0%`, `${-100 * speed}%`]);
  const row2X = useTransform(scrollYProgress, [0, 1], [`${100 * speed}%`, `0%`]);

  return (
    <div
      ref={trackRef}
      className={`relative overflow-hidden w-full border-b border-white/15 py-8 md:py-10 ${className}`}
      data-lenis-prevent
      style={{ width: '100%', maxWidth: '100vw' }}
    >
      {/* Row 1 - Left to Right */}
      <motion.div
        className="flex items-center gap-8 whitespace-nowrap will-change-transform"
        style={{
          x: row1X,
          fontSize: 'clamp(4rem, 10vw, 6.5rem)',
          lineHeight: 1,
          fontWeight: 800,
          fontFamily: "'Unbounded', 'Syne', sans-serif",
          textTransform: 'uppercase',
          letterSpacing: '-0.02em',
          color: '#FFFFFF',
        }}
        aria-hidden="true"
      >
        {texts[0]}
        {texts[0]}
      </motion.div>

      {/* Row 2 - Right to Left */}
      <motion.div
        className="flex items-center gap-8 whitespace-nowrap will-change-transform"
        style={{
          x: row2X,
          fontSize: 'clamp(4rem, 10vw, 6.5rem)',
          lineHeight: 1,
          fontWeight: 800,
          fontFamily: "'Unbounded', 'Syne', sans-serif",
          textTransform: 'uppercase',
          letterSpacing: '-0.02em',
          color: '#FFFFFF',
          marginTop: '0.5em',
        }}
        aria-hidden="true"
      >
        {texts[1]}
        {texts[1]}
      </motion.div>
    </div>
  );
}

export { KineticScrollMarquee as default };