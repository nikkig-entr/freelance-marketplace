'use client';

import { useEffect, useRef, createContext, useContext, ReactNode } from 'react';

interface CustomCursorProps {
  enabled?: boolean;
  children: React.ReactNode;
}

interface CursorState {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  visible: boolean;
  label: string;
  labelVisible: boolean;
  isClickable: boolean;
  isMedia: boolean;
  mediaType: 'video' | 'image' | null;
  scale: number;
  targetScale: number;
}

export function CustomCursorProvider({ children, enabled = true }: CustomCursorProps) {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef<CursorState>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    visible: false,
    label: '',
    labelVisible: false,
    isClickable: false,
    isMedia: false,
    mediaType: null,
    scale: 1,
    targetScale: 1,
  });
  const animationRef = useRef<number>();
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarsePointer = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  const isFinePointer = typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;

  // Strictly desktop-only: only mount on fine pointer devices
  const shouldMount = enabled && !prefersReducedMotion && !isCoarsePointer && isFinePointer;

  // Initialize cursor element
  useEffect(() => {
    if (!shouldMount) return;

    // Create cursor DOM elements if they don't exist
    if (!cursorRef.current) {
      const cursor = document.createElement('div');
      cursor.className = 'fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference select-none hidden lg:block';
      cursor.style.transformOrigin = 'center center';
      cursor.style.willChange = 'transform';
      cursor.innerHTML = `
        <div class="relative">
          <!-- Optical lens: 36px circle expanding to 80px on interactive targets -->
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/80 bg-white/10 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
               style="width: 36px; height: 36px;"></div>
          <!-- VIEW label for media targets -->
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-mono uppercase tracking-widest text-white opacity-0 scale-50 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none whitespace-nowrap"></div>
        </div>
        <!-- [ LABEL ] text on [data-cursor] targets -->
        <div class="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-white bg-[#050505]/95 border border-white/30 whitespace-nowrap opacity-0 scale-90 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none"></div>
      `;
      document.body.appendChild(cursor);
      cursorRef.current = cursor;
    }

    const cursor = cursorRef.current;
    if (!cursor) return;
    const lens = cursor.querySelector('.rounded-full') as HTMLElement;
    const mediaLabel = cursor.querySelector('.text-\[10px\]') as HTMLElement;
    const labelEl = cursor.querySelector('.px-3') as HTMLDivElement;
    labelRef.current = labelEl;

    let lastX = 0;
    let lastY = 0;
    let currentX = 0;
    let currentY = 0;

    // RAF animation loop - zero React re-renders
    const animate = () => {
      const state = stateRef.current;

      // Smooth interpolation (spring-like)
      const easing = 0.2;
      currentX += (state.targetX - currentX) * easing;
      currentY += (state.targetY - currentY) * easing;

      // Only update transform if position changed (GPU accelerated)
      if (Math.abs(currentX - lastX) > 0.1 || Math.abs(currentY - lastY) > 0.1) {
        cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        lastX = currentX;
        lastY = currentY;
      }

      // Smooth scale interpolation
      const scaleEasing = 0.15;
      state.scale += (state.targetScale - state.scale) * scaleEasing;

      if (lens) {
        const baseSize = 36;
        const expandedSize = 80;
        const currentSize = baseSize + (expandedSize - baseSize) * (state.scale - 1);
        lens.style.width = `${currentSize}px`;
        lens.style.height = `${currentSize}px`;

        // Update lens appearance based on interactive state
        if (state.isClickable || state.isMedia) {
          lens.style.borderColor = '#FFFFFF';
          lens.style.backgroundColor = 'rgba(255,255,255,1)';
          lens.style.boxShadow = '0 0 30px rgba(255,255,255,0.3), 0 0 60px rgba(255,255,255,0.15)';
        } else {
          lens.style.borderColor = 'rgba(255,255,255,0.8)';
          lens.style.backgroundColor = 'rgba(255,255,255,0.1)';
          lens.style.boxShadow = 'none';
        }
      }

      // Media label
      if (mediaLabel) {
        if (state.isMedia) {
          mediaLabel.textContent = state.mediaType === 'video' ? '▶ PLAY' : 'VIEW';
          mediaLabel.style.opacity = '1';
          mediaLabel.style.transform = 'translate(-50%, -50%) scale(1)';
        } else {
          mediaLabel.style.opacity = '0';
          mediaLabel.style.transform = 'translate(-50%, -50%) scale(0.5)';
        }
      }

      // Text label
      if (labelEl) {
        if (state.labelVisible && state.label) {
          labelEl.textContent = `[ ${state.label} ]`;
          labelEl.style.opacity = '1';
          labelEl.style.transform = 'translateY(-50%) scale(1)';
        } else {
          labelEl.style.opacity = '0';
          labelEl.style.transform = 'translateY(-50%) scale(0.9)';
        }
      }

      // Visibility
      cursor.style.opacity = state.visible ? '1' : '0';

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Mouse move handler - passive, updates ref directly
    const handleMouseMove = (e: MouseEvent) => {
      const state = stateRef.current;
      state.targetX = e.clientX;
      state.targetY = e.clientY;
      if (!state.visible) state.visible = true;
    };

    const handleMouseEnter = () => {
      stateRef.current.visible = true;
    };

    const handleMouseLeave = () => {
      stateRef.current.visible = false;
      stateRef.current.labelVisible = false;
      stateRef.current.label = '';
    };

    const handleMouseDown = () => {
      stateRef.current.targetScale = 0.85;
    };

    const handleMouseUp = () => {
      stateRef.current.targetScale = 1;
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
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      // Clean up DOM
      if (cursorRef.current && cursorRef.current.parentNode) {
        cursorRef.current.parentNode.removeChild(cursorRef.current);
        cursorRef.current = null;
      }
    };
  }, [shouldMount]);

  // Listen for cursor interaction events from elements
  useEffect(() => {
    if (!shouldMount) return;

    const handleCursorEnter = (e: CustomEvent) => {
      const { label, isMedia, mediaType, clickable } = e.detail;
      const state = stateRef.current;
      state.label = label ?? '';
      state.labelVisible = !!label;
      state.isMedia = !!isMedia;
      state.mediaType = mediaType ?? null;
      state.isClickable = !!clickable;
      state.targetScale = (clickable || isMedia) ? 2.2 : 1; // Expand to ~80px
    };

    const handleCursorLeave = () => {
      const state = stateRef.current;
      state.labelVisible = false;
      state.label = '';
      state.isMedia = false;
      state.mediaType = null;
      state.isClickable = false;
      state.targetScale = 1;
    };

    window.addEventListener('cursor:enter', handleCursorEnter as EventListener);
    window.addEventListener('cursor:leave', handleCursorLeave as EventListener);

    return () => {
      window.removeEventListener('cursor:enter', handleCursorEnter as EventListener);
      window.removeEventListener('cursor:leave', handleCursorLeave as EventListener);
    };
  }, [shouldMount]);

  // Never render cursor DOM from React - it's created imperatively above
  return <>{children}</>;
}

export { CustomCursorProvider as default };

// Hook for elements to register cursor behavior
export function useCursorInteraction(options: {
  label?: string;
  isMedia?: boolean;
  mediaType?: 'video' | 'image';
  clickable?: boolean;
}) {
  const elementRef = useRef<HTMLElement | null>(null);

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

// Simple cursor context for components to update cursor state (legacy compatibility)
interface CursorContextValue {
  setLabel: (label: string) => void;
  setLabelOptions: (options: { visible: boolean; label?: string }) => void;
  setClickable: (clickable: boolean) => void;
  setMedia: (isMedia: boolean, mediaType?: 'video' | 'image') => void;
}

const CursorContext = createContext<CursorContextValue | null>(null);

export function CursorProvider({ children }: { children: ReactNode }) {
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarsePointer = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  const isFinePointer = typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;

  const value: CursorContextValue = {
    setLabel: (label: string) => {
      const state = (window as any).__cursorState;
      if (state) state.label = label;
    },
    setLabelOptions: (options) => {
      const state = (window as any).__cursorState;
      if (state) {
        state.labelVisible = options.visible;
        state.label = options.label ?? state.label;
      }
    },
    setClickable: (clickable: boolean) => {
      const state = (window as any).__cursorState;
      if (state) {
        state.isClickable = clickable;
        state.targetScale = clickable ? 2.2 : 1;
      }
    },
    setMedia: (isMedia: boolean, mediaType?: 'video' | 'image') => {
      const state = (window as any).__cursorState;
      if (state) {
        state.isMedia = isMedia;
        state.mediaType = mediaType ?? null;
        state.targetScale = isMedia ? 2.2 : 1;
      }
    },
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