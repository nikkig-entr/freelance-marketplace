'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { createContext, useContext, ReactNode } from 'react';

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

  // Spring config: stiffness: 480, damping: 32 for snappy but smooth motion
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

  // Listen for cursor interaction events from elements
  useEffect(() => {
    if (!shouldMount) return;

    const handleCursorEnter = (e: CustomEvent) => {
      const { label, isMedia, mediaType, clickable } = e.detail;
      setCursorState(prev => ({
        ...prev,
        label: label ?? '',
        labelVisible: !!label,
        isMedia: !!isMedia,
        mediaType: mediaType ?? null,
        isClickable: !!clickable,
      }));
    };

    const handleCursorLeave = () => {
      setCursorState(prev => ({
        ...prev,
        labelVisible: false,
        label: '',
        isMedia: false,
        mediaType: null,
        isClickable: false,
      }));
    };

    window.addEventListener('cursor:enter', handleCursorEnter as EventListener);
    window.addEventListener('cursor:leave', handleCursorLeave as EventListener);

    return () => {
      window.removeEventListener('cursor:enter', handleCursorEnter as EventListener);
      window.removeEventListener('cursor:leave', handleCursorLeave as EventListener);
    };
  }, [shouldMount]);

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
          {/* Sleek minimal cursor: 10px solid dot that expands to 64px ring on hover */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
            animate={{
              width: cursorState.isClickable || cursorState.isMedia ? '64px' : '10px',
              height: cursorState.isClickable || cursorState.isMedia ? '64px' : '10px',
              borderRadius: cursorState.isClickable || cursorState.isMedia ? '9999px' : '9999px',
              backgroundColor: cursorState.isClickable || cursorState.isMedia ? 'rgba(255,255,255,0.15)' : '#FFFFFF',
              border: cursorState.isClickable || cursorState.isMedia ? '2px solid #FFFFFF' : 'none',
            }}
            style={{ pointerEvents: 'none' }}
          />
          {/* Inner dot for default state */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full"
            animate={{
              scale: cursorState.isClickable || cursorState.isMedia ? 0 : 1,
              opacity: cursorState.isClickable || cursorState.isMedia ? 0 : 1,
            }}
            style={{ pointerEvents: 'none' }}
          />
          {/* VIEW label for media targets */}
          {cursorState.isMedia && (
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-mono uppercase tracking-widest text-white"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}
            >
              {cursorState.mediaType === 'video' ? '▶ PLAY' : 'VIEW'}
            </motion.div>
          )}
        </div>
        {/* [ VIEW ] label on [data-cursor] targets */}
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

export { CustomCursorProvider as default };