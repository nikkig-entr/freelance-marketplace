'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

interface WindowWithLenis extends Window {
  __lenis?: Lenis;
}

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Initialize Lenis with exact parameters for Awwwards-grade smooth scroll
    const lenis = new Lenis({
      lerp: 0.072,
      duration: 1.35,
      smoothWheel: true,
      syncTouch: false, // CRITICAL: Keep native iOS/Android touch momentum 100% glitch-free
      wheelMultiplier: 0.95,
      infinite: false,
    });

    // Expose globally for lenisScrollTo utility
    (window as WindowWithLenis).__lenis = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      delete (window as WindowWithLenis).__lenis;
    };
  }, []);

  return <>{children}</>;
}

export function lenisScrollTo(target: string | number | HTMLElement, options?: { offset?: number; duration?: number }) {
  if (typeof window === 'undefined') return;

  const lenis = (window as WindowWithLenis).__lenis;
  if (lenis) {
    lenis.scrollTo(target, options);
  }
}