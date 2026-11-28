'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NumericPreloaderProps {
  onComplete: () => void;
}

const PANEL_COUNT = 5;
const COUNTER_DURATION = 650;
const CURTAIN_DURATION = 700;
const STAGGER_DELAY = 60;

export function NumericPreloader({ onComplete }: NumericPreloaderProps) {
  const [counter, setCounter] = useState(0);
  const [isUnmounting, setIsUnmounting] = useState(false);
  const [isUnmounted, setIsUnmounted] = useState(false);
  const panelsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsUnmounted(true);
      onComplete();
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsUnmounted(true);
      onComplete();
      return;
    }

    // Block pointer events initially
    document.body.style.pointerEvents = 'none';

    // Animate counter 000 → 100 over 650ms
    const startTime = performance.now();
    const animateCounter = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / COUNTER_DURATION, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCounter(Math.round(eased * 100));

      if (progress < 1) {
        requestAnimationFrame(animateCounter);
      } else {
        // Counter complete, start curtain retraction
        startCurtainRetraction();
      }
    };

    const startCurtainRetraction = () => {
      const panels = panelsRef.current;
      panels.forEach((panel, index) => {
        if (panel) {
          // Use framer-motion style transitions via requestAnimationFrame
          panel.style.transition = `transform ${CURTAIN_DURATION}ms cubic-bezier(0.76, 0, 0.24, 1)`;
          panel.style.transform = 'translateY(0)';
          panel.style.transitionDelay = `${index * STAGGER_DELAY}ms`;
          requestAnimationFrame(() => {
            panel.style.transform = 'translateY(-100%)';
          });
        }
      });
    };

    requestAnimationFrame(animateCounter);

    // Re-enable pointer events after curtain starts
    const pointerTimer = setTimeout(() => {
      document.body.style.pointerEvents = '';
    }, 150);

    // Complete unmount after curtain animation
    const totalDuration = COUNTER_DURATION + CURTAIN_DURATION + (PANEL_COUNT - 1) * STAGGER_DELAY + 150;
    const completeTimer = setTimeout(() => {
      setIsUnmounting(true);
      setTimeout(() => {
        setIsUnmounted(true);
        onComplete();
      }, 100);
    }, totalDuration);

    return () => {
      clearTimeout(pointerTimer);
      clearTimeout(completeTimer);
      document.body.style.pointerEvents = '';
    };
  }, [onComplete]);

  if (isUnmounted) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[99999] bg-[#050505] flex items-end justify-start px-6 md:px-10 pb-6 md:pb-10 pointer-events-none"
      role="status"
      aria-label="Loading"
      aria-busy="true"
      style={{ height: '100dvh' }}
    >
      {/* Counter Display - Bottom Left */}
      <motion.div
        className="font-mono tabular-nums text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-[-0.02em] leading-none text-[var(--color-text)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20, transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] } }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ willChange: 'opacity, transform' }}
      >
        {String(counter).padStart(3, '0')}
      </motion.div>

      {/* Vertical Curtain Panels - 5 architectural columns retracting upward */}
      <AnimatePresence mode="wait">
        {!isUnmounting && (
          <motion.div
            key="curtain"
            className="fixed inset-0 -z-10 pointer-events-none"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.1, ease: [0.16, 1, 0.3, 1] } }}
          >
            <div className="grid grid-cols-5 h-full w-full bg-[#050505]">
              {Array.from({ length: PANEL_COUNT }).map((_, i) => (
                <div
                  key={`panel-${i}`}
                  ref={(el) => { panelsRef.current[i] = el; }}
                  className={`h-full ${i < PANEL_COUNT - 1 ? 'border-r border-white/[0.06]' : ''}`}
                  style={{
                    willChange: 'transform',
                    transformOrigin: 'center center',
                    transform: 'translateY(0)',
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { NumericPreloader as default };