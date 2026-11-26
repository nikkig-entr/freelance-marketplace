'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

interface WindowWithLenis extends Window {
  __lenis?: Lenis;
}

export function useLenis() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);
}

export function lenisScrollTo(target: string | number | HTMLElement, options?: { offset?: number; duration?: number }) {
  if (typeof window === 'undefined') return;

  const lenis = (window as WindowWithLenis).__lenis;
  if (lenis) {
    lenis.scrollTo(target, options);
  }
}