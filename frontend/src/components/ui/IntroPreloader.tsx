'use client';

import React, { useEffect, useState, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PreloaderContext, type PreloaderContextValue } from '@/contexts/PreloaderContext';

interface IntroPreloaderProps {
  children: React.ReactNode;
}

const PANEL_COUNT = 5;
const CURTAIN_DURATION = 520;
const STAGGER_DELAY = 45;
const TOTAL_DURATION = 800;

export function IntroPreloader({
  children,
}: IntroPreloaderProps) {
  const context = useContext(PreloaderContext) as PreloaderContextValue;
  const { setPreloaderComplete } = context;
  const [isUnmounted, setIsUnmounted] = useState(false);
  const panelsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsUnmounted(true);
      setPreloaderComplete?.(true);
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsUnmounted(true);
      setPreloaderComplete?.(true);
      return;
    }

    // Block pointer events initially
    document.body.style.pointerEvents = 'none';

    // Cascade panels up (black curtain effect)
    const panels = panelsRef.current;
    panels.forEach((panel, index) => {
      if (panel) {
        panel.style.transition = `transform ${CURTAIN_DURATION}ms cubic-bezier(0.76, 0, 0.24, 1)`;
        panel.style.transform = 'translateY(0)';
        panel.style.transitionDelay = `${index * STAGGER_DELAY}ms`;
        requestAnimationFrame(() => {
          panel.style.transform = 'translateY(-100%)';
        });
      }
    });

    // Re-enable pointer events after 250ms
    const pointerTimer = setTimeout(() => {
      document.body.style.pointerEvents = '';
    }, 250);

    // Complete unmount after TOTAL_DURATION
    const completeTimer = setTimeout(() => {
      setTimeout(() => {
        setIsUnmounted(true);
        setPreloaderComplete?.(true);
      }, 150);
    }, TOTAL_DURATION);

    return () => {
      clearTimeout(pointerTimer);
      clearTimeout(completeTimer);
      document.body.style.pointerEvents = '';
    };
  }, [setPreloaderComplete]);

  if (isUnmounted) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="preloader"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } }}
        className="fixed inset-0 z-[99999] pointer-events-none"
        role="status"
        aria-label="Loading"
        aria-busy="true"
      >
        <div className="grid grid-cols-5 h-full w-full bg-[#050505]">
          {Array.from({ length: PANEL_COUNT }).map((_, i) => (
            <motion.div
              key={`panel-${i}`}
              ref={(el) => { panelsRef.current[i] = el; }}
              className={`h-full ${i < PANEL_COUNT - 1 ? 'border-r border-white/[0.06]' : ''}`}
              initial={{ transform: 'translateY(0)' }}
              animate={{ transform: 'translateY(0)' }}
              style={{
                willChange: 'transform',
                transformOrigin: 'center center',
              }}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export { IntroPreloader as default };