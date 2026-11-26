'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface CustomCursorProps {
  enabled?: boolean;
}

interface CursorState {
  x: number;
  y: number;
  visible: boolean;
  label: string;
  labelVisible: boolean;
  isClickable: boolean;
  isMedia: boolean;
  mediaType: 'video' | 'image' | null;
  scale: number;
}

export function CustomCursorProvider({ children, enabled = true }: CustomCursorProps & { children: React.ReactNode }) {
  const [cursorState, setCursorState] = useState<CursorState>({
    x: 0,
    y: 0,
    visible: false,
    label: '',
    labelVisible: false,
    isClickable: false,
    isMedia: false,
    mediaType: null,
    scale: 1,
  });

  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarsePointer = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const cursorScale = useMotionValue(1);

  const smoothX = useSpring(cursorX, { stiffness: 200, damping: 25, mass: 0.5 });
  const smoothY = useSpring(cursorY, { stiffness: 200, damping: 25, mass: 0.5 });
  const smoothScale = useSpring(cursorScale, { stiffness: 300, damping: 30 });

  useEffect(() => {
    if (!enabled || prefersReducedMotion || isCoarsePointer) return;

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      setCursorState(prev => ({ ...prev, x: e.clientX, y: e.clientY, visible: true }));
    };

    const handleMouseEnter = () => {
      setCursorState(prev => ({ ...prev, visible: true }));
    };

    const handleMouseLeave = () => {
      setCursorState(prev => ({ ...prev, visible: false, labelVisible: false, label: '' }));
    };

    const handleMouseDown = () => {
      cursorScale.set(0.85);
    };

    const handleMouseUp = () => {
      cursorScale.set(1);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [enabled, prefersReducedMotion, isCoarsePointer, cursorX, cursorY, cursorScale]);

  if (!enabled || prefersReducedMotion || isCoarsePointer) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference select-none"
        style={{
          x: smoothX,
          y: smoothY,
          scale: smoothScale,
          transformOrigin: 'center center',
        }}
        aria-hidden="true"
      >
        <div className="relative w-8 h-8">
          <motion.div
            className="absolute inset-0 border border-[var(--color-cream)]/60 rounded-full transition-colors duration-300"
            animate={{
              borderColor: cursorState.isClickable ? 'var(--color-gold)' : cursorState.isMedia ? 'var(--color-gold)' : 'var(--color-cream)/60',
              borderWidth: cursorState.isClickable || cursorState.isMedia ? 2 : 1,
            }}
            style={{ pointerEvents: 'none' }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[var(--color-cream)] rounded-full"
            animate={{
              scale: cursorState.isClickable ? 0 : cursorState.isMedia ? 0.5 : 1,
              opacity: cursorState.isClickable ? 0 : 1,
            }}
            style={{ pointerEvents: 'none' }}
          />
          {cursorState.isMedia && (
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] font-mono uppercase tracking-widest text-[var(--color-gold)]"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}
            >
              {cursorState.mediaType === 'video' ? '▶ PLAY' : '□ VIEW'}
            </motion.div>
          )}
        </div>
        {cursorState.labelVisible && cursorState.label && (
          <motion.div
            className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-widest text-[var(--color-gold)] bg-[var(--color-obsidian)]/95 border border-[var(--color-gold)]/30 rounded whitespace-nowrap shadow-[var(--shadow-glass-strong)] backdrop-blur-xl"
            initial={{ opacity: 0, x: -10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.9 }}
            style={{ pointerEvents: 'none' }}
          >
            {cursorState.label}
          </motion.div>
        )}
      </motion.div>
    </>
  );
}

export function useCustomCursor() {
  // This would need to be connected via context in a real implementation
  // For now, we'll use a simpler approach with data attributes
  return { setLabel: () => {}, setLabelOptions: () => {}, setClickable: () => {} };
}

// Hook for elements to register cursor behavior
export function useCursorInteraction(options: {
  label?: string;
  isMedia?: boolean;
  mediaType?: 'video' | 'image';
  clickable?: boolean;
}) {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const handleMouseEnter = () => {
      // Dispatch custom event for cursor provider to pick up
      window.dispatchEvent(new CustomEvent('cursor:enter', {
        detail: options,
      }));
    };

    const handleMouseLeave = () => {
      window.dispatchEvent(new CustomEvent('cursor:leave'));
    };

    el.addEventListener('mouseenter', handleMouseEnter);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mouseenter', handleMouseEnter);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [options]);

  return elementRef;
}