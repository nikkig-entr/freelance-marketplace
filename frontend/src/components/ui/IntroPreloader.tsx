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
const BRASS_LINE_DURATION = 220;
const POINTER_BLOCK_DURATION = 250;
const TOTAL_DURATION = 850;

export function IntroPreloader({
  children,
}: IntroPreloaderProps) {
  const context = useContext(PreloaderContext) as PreloaderContextValue;
  const { setPreloaderComplete } = context;
  const [isUnmounted, setIsUnmounted] = useState(false);
  const brassLineRef = useRef<HTMLDivElement>(null);
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

    // Animate brass line
    const brassLine = brassLineRef.current;
    if (brassLine) {
      brassLine.style.width = '0%';
      brassLine.style.transition = `width ${BRASS_LINE_DURATION}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
      requestAnimationFrame(() => {
        brassLine.style.width = '100%';
      });
    }

    // Cascade panels up
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
    }, POINTER_BLOCK_DURATION);

    // Complete unmount after 850ms
    const completeTimer = setTimeout(() => {
      setTimeout(() => {
        setIsUnmounted(true);
        setPreloaderComplete?.(true);
      }, 300);
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
        exit={{ opacity: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
        className="fixed inset-0 z-[99999] pointer-events-none"
        role="status"
        aria-label="Loading"
        aria-busy="true"
      >
        <div className="grid grid-cols-5 h-full w-full bg-[#0B0B0C]">
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
            >
              {i === 0 && (
                <motion.div
                  ref={brassLineRef}
                  className="absolute top-1/2 left-0 h-[1px] w-0 bg-[#C5A572]/70"
                  style={{
                    transform: 'translateY(-50%)',
                    transformOrigin: 'left center',
                    willChange: 'width',
                  }}
                  initial={{ width: '0%' }}
                  animate={{ width: '0%' }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export { IntroPreloader as default };