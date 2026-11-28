'use client';

// Define Lenis interface for proper typing
export interface LenisInstance {
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

interface WindowWithLenis extends Window {
  __LENIS__?: LenisInstance;
}

export function useLenis(): LenisInstance | null {
  if (typeof window === 'undefined') return null;
  return (window as WindowWithLenis).__LENIS__ ?? null;
}