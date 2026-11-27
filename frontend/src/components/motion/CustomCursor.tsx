'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface CustomCursorProps {
  enabled?: boolean;
  children: React.ReactNode;
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

export function CustomCursorProvider({ children, enabled = true }: CustomCursorProps) {
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
  const isFinePointer = typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;

  // Strictly desktop-only: only mount on fine pointer devices
  const shouldMount = enabled && !prefersReducedMotion && !isCoarsePointer && isFinePointer;

  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const cursorScale = useMotionValue(1);

  // Spring config matching spec: stiffness: 480, damping: 32
  const smoothX = useSpring(cursorX, { stiffness: 480, damping: 32, mass: 0.5 });
  const smoothY = useSpring(cursorY, { stiffness: 480, damping: 32, mass: 0.5 });
  const smoothScale = useSpring(cursorScale, { stiffness: 480, damping: 32 });

  useEffect(() => {
    if (!shouldMount) return;

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

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
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
  }, [shouldMount, cursorX, cursorY, cursorScale]);

  // Never render on touch devices or when disabled
  if (!shouldMount) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference select-none hidden lg:block"
        style={{
          x: smoothX,
          y: smoothY,
          scale: smoothScale,
          transformOrigin: 'center center',
        }}
        aria-hidden="true"
      >
        <div className="relative">
          {/* Outer disc - expands to 72px on interactive targets */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/60 transition-all duration-300"
            animate={{
              width: cursorState.isClickable ? '72px' : cursorState.isMedia ? '64px' : '32px',
              height: cursorState.isClickable ? '72px' : cursorState.isMedia ? '64px' : '32px',
              borderColor: cursorState.isClickable || cursorState.isMedia ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
              borderWidth: cursorState.isClickable || cursorState.isMedia ? 2 : 1,
            }}
            style={{ pointerEvents: 'none' }}
          />
          {/* Inner dot */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full"
            animate={{
              scale: cursorState.isClickable ? 0 : cursorState.isMedia ? 0.5 : 1,
              opacity: cursorState.isClickable ? 0 : 1,
            }}
            style={{ pointerEvents: 'none' }}
          />
          {/* Media label */}
          {cursorState.isMedia && (
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] font-mono uppercase tracking-widest text-white"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}
            >
              {cursorState.mediaType === 'video' ? '▶ PLAY' : '□ VIEW'}
            </motion.div>
          )}
        </div>
        {/* [ EXPLORE ] label on [data-cursor] targets */}
        {cursorState.labelVisible && cursorState.label && (
          <motion.div
            className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-white bg-[#050505]/95 border border-white/30 whitespace-nowrap"
            initial={{ opacity: 0, x: -10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.9 }}
            style={{ pointerEvents: 'none' }}
          >
            [ {cursorState.label} ]
          </motion.div>
        )}
      </motion.div>
    </>
  );
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
      window.dispatchEvent(new CustomEvent('cursor:enter', { detail: options }));
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

// Simple cursor context for components to update cursor state
import { createContext, useContext, ReactNode } from 'react';

interface CursorContextValue {
  setLabel: (label: string) => void;
  setLabelOptions: (options: { visible: boolean; label?: string }) => void;
  setClickable: (clickable: boolean) => void;
  setMedia: (isMedia: boolean, mediaType?: 'video' | 'image') => void;
}

const CursorContext = createContext<CursorContextValue | null>(null);

export function CursorProvider({ children }: { children: ReactNode }) {
  const [, setCursorState] = useState<CursorState>({
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
  const isFinePointer = typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;

  const value: CursorContextValue = {
    setLabel: (label: string) => setCursorState(prev => ({ ...prev, label })),
    setLabelOptions: (options) => setCursorState(prev => ({ ...prev, labelVisible: options.visible, label: options.label ?? prev.label })),
    setClickable: (clickable: boolean) => setCursorState(prev => ({ ...prev, isClickable: clickable })),
    setMedia: (isMedia: boolean, mediaType?: 'video' | 'image') => setCursorState(prev => ({ ...prev, isMedia, mediaType: mediaType ?? null })),
  };

  if (prefersReducedMotion || isCoarsePointer || !isFinePointer) {
    return <>{children}</>;
  }

  return (
    <CursorContext.Provider value={value}>
      {children}
    </CursorContext.Provider>
  );
}

export function useCustomCursor() {
  const context = useContext(CursorContext);
  if (!context) {
    return {
      setLabel: () => {},
      setLabelOptions: () => {},
      setClickable: () => {},
      setMedia: () => {},
    };
  }
  return context;
}