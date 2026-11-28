'use client';

import { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

// Define Lenis interface for proper typing
interface LenisInstance {
  scroll: number;
  limit: number;
  on: (event: string, callback: () => void) => void;
  off: (event: string, callback: () => void) => void;
  scrollTo: (target: HTMLElement | string | number, options?: { offset?: number; immediate?: boolean; duration?: number; easing?: (t: number) => number }) => void;
  raf: (time: number) => void;
  destroy: () => void;
  stop: () => void;
  start: () => void;
}

interface LenisOptions {
  lerp?: number;
  duration?: number;
  wheelMultiplier?: number;
  touchMultiplier?: number;
  infinite?: boolean;
  smoothWheel?: boolean;
  syncTouch?: boolean;
  syncTouchLerp?: number;
  gestureDirection?: 'vertical' | 'horizontal' | 'both';
  overshoot?: boolean;
  easing?: (t: number) => number;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const lenisRef = useRef<LenisInstance | null>(null);

  useEffect(() => {
    // Initialize Lenis with crisp, lightweight responsiveness for 120fps feel
    const lenis = new Lenis({
      // Core smoothing parameters - tuned for instant response
      lerp: 0.11,           // Crisp, responsive easing (was 0.072)
      duration: 0.9,        // Faster deceleration (was 1.35)

      // Wheel behavior
      wheelMultiplier: 1.0,  // Natural wheel response
      touchMultiplier: 1.5,  // Balanced touch response (was 2.0)

      // Scroll boundaries
      infinite: false,       // No infinite scroll

      // Performance
      smoothWheel: true,     // Smooth wheel scrolling

      // Synchronization - native scroll on mobile touch
      syncTouch: false,      // Don't sync touch (use native)
      syncTouchLerp: 0.11,

      // Gesture direction
      gestureDirection: 'vertical',

      // Prevent overscroll bounce
      overshoot: false,

      // Easing function - custom cubic-bezier(0.16, 1, 0.3, 1) equivalent
      easing: (t: number) => {
        return 1 - Math.pow(1 - t, 3);
      },
    } as LenisOptions);

    lenisRef.current = lenis as unknown as LenisInstance;

    // Expose to window for debugging / external access
    (window as Window & { __LENIS__?: LenisInstance }).__LENIS__ = lenis as unknown as LenisInstance;

    // Animation frame loop
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    // Handle anchor links with smooth scroll
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLAnchorElement;
      const anchor = target.closest('a[href^="#"]');

      if (anchor) {
        const href = anchor.getAttribute('href');
        if (href && href !== '#') {
          const targetEl = document.querySelector(href);
          if (targetEl instanceof HTMLElement) {
            e.preventDefault();
            lenis.scrollTo(targetEl, {
              offset: 0,
              immediate: false,
              duration: 0.9,
              easing: (t: number) => 1 - Math.pow(1 - t, 3),
            });
          }
        }
      }
    };

    document.addEventListener('click', handleAnchorClick, { passive: false });

    // Cleanup
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      document.removeEventListener('click', handleAnchorClick);
      delete (window as Window & { __LENIS__?: LenisInstance }).__LENIS__;
    };
  }, []);

  // Prevent scroll restoration on navigation (handled by router)
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  return <>{children}</>;
}

// Hook to access Lenis instance
export function useLenis(): LenisInstance | null {
  if (typeof window === 'undefined') return null;
  return (window as Window & { __LENIS__?: LenisInstance }).__LENIS__ ?? null;
}