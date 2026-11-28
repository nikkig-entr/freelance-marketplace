'use client';

import { useEffect, useRef, useState, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PreloaderContext, type PreloaderContextValue } from '@/contexts/PreloaderContext';
import { BrandLogo } from '@/components/ui/BrandLogo';

interface NumericPreloaderProps {
  onComplete?: () => void;
}

const CURTAIN_COUNT = 5;
const COUNTER_DURATION = 550;      // 550ms counter: 000 → 100
const LOGO_DRAW_DURATION = 0.55;   // 550ms logo path draw
const CURTAIN_DURATION = 0.42;     // 420ms curtain retraction
const STAGGER_DELAY = 60;          // 60ms stagger between curtains
const FAILSAFE_TIMEOUT = 1200;     // 1200ms hard failsafe
const CURTAIN_EASE = [0.76, 0, 0.24, 1] as const;
const COUNTER_EASE = (t: number) => 1 - Math.pow(1 - t, 4);
const LOGO_EASE = [0.16, 1, 0.3, 1] as const;

export function NumericPreloader({
  onComplete,
}: NumericPreloaderProps) {
  const context = useContext(PreloaderContext) as PreloaderContextValue;
  const { setPreloaderComplete } = context;
  const [isUnmounted, setIsUnmounted] = useState(false);
  const [counter, setCounter] = useState(0);
  const [logoDrawProgress, setLogoDrawProgress] = useState(0);
  const [showCurtains, setShowCurtains] = useState(false);
  const [isRetracting, setIsRetracting] = useState(false);
  const counterRef = useRef(0);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const curtainAnimationRef = useRef<number>();
  const failsafeTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const unmountTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Exponential ease-out counter animation using requestAnimationFrame
  const animateCounter = useCallback(() => {
    const now = performance.now();
    const elapsed = now - startTimeRef.current;
    const progress = Math.min(elapsed / COUNTER_DURATION, 1);
    const easedProgress = COUNTER_EASE(progress);

    const currentValue = Math.round(easedProgress * 100);
    if (currentValue !== counterRef.current) {
      counterRef.current = currentValue;
      setCounter(currentValue);
    }

    if (progress < 1) {
      animationRef.current = requestAnimationFrame(animateCounter);
    } else {
      // Counter complete - trigger logo draw completion and curtains
      setLogoDrawProgress(1);
      setShowCurtains(true);
      startCurtainAnimation();
    }
  }, []);

  // Staggered curtain retraction animation
  const startCurtainAnimation = useCallback(() => {
    setIsRetracting(true);
    // Disable pointer events on body as soon as retraction begins
    if (typeof document !== 'undefined') {
      document.body.style.pointerEvents = 'none';
    }
    const curtainStartTime = performance.now();

    const animateCurtains = () => {
      const elapsed = performance.now() - curtainStartTime;

      // Check if all curtains are complete
      const allComplete = Array.from({ length: CURTAIN_COUNT }).every((_, i) => {
        const curtainDelay = i * STAGGER_DELAY;
        const curtainElapsed = elapsed - curtainDelay;
        if (curtainElapsed <= 0) return false;
        const progress = Math.min(curtainElapsed / (CURTAIN_DURATION * 1000), 1);
        return progress >= 1;
      });

      if (allComplete) {
        // All curtains done - unmount preloader after brief delay
        unmountTimerRef.current = setTimeout(() => {
          setIsUnmounted(true);
          setPreloaderComplete?.(true);
          onComplete?.();
        }, 100);
        return;
      }

      curtainAnimationRef.current = requestAnimationFrame(animateCurtains);
    };

    curtainAnimationRef.current = requestAnimationFrame(animateCurtains);
  }, [setPreloaderComplete, onComplete]);

  // Initialize on mount - StrictMode-safe
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

    // Start counter animation
    startTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(animateCounter);

    // Start logo draw animation with Framer Motion timing
    const logoDrawTimer = setTimeout(() => {
      setLogoDrawProgress(1);
    }, LOGO_DRAW_DURATION * 1000);

    // Hard failsafe: force completion at 1200ms if animation hasn't finished
    failsafeTimerRef.current = setTimeout(() => {
      if (counterRef.current < 100) {
        counterRef.current = 100;
        setCounter(100);
      }
      setLogoDrawProgress(1);
      if (!showCurtains) {
        setShowCurtains(true);
        startCurtainAnimation();
      }
    }, FAILSAFE_TIMEOUT);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (curtainAnimationRef.current) cancelAnimationFrame(curtainAnimationRef.current);
      if (logoDrawTimer) clearTimeout(logoDrawTimer);
      if (failsafeTimerRef.current) clearTimeout(failsafeTimerRef.current);
      if (unmountTimerRef.current) clearTimeout(unmountTimerRef.current);
      // Restore pointer events on cleanup
      if (typeof document !== 'undefined') {
        document.body.style.pointerEvents = '';
      }
    };
  }, [animateCounter, setPreloaderComplete, showCurtains, startCurtainAnimation]);

  if (isUnmounted) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="preloader"
        initial={{ opacity: 1 }}
        exit={{
          opacity: 0,
          transition: { duration: 0.2, ease: LOGO_EASE }
        }}
        className={`fixed inset-0 z-[99999] bg-[#050505] ${isRetracting ? 'pointer-events-none' : ''}`}
        role="status"
        aria-label="Initializing archive"
        aria-busy="true"
      >
        {/* Center stage - Logo + Counter + Telemetry */}
        <div className="flex flex-col items-center justify-center h-full w-full">
          {/* BrandLogo with draw-in animation */}
          <div className="relative flex items-center justify-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: LOGO_DRAW_DURATION, ease: LOGO_EASE }}
            >
              <BrandLogo
                size={120}
                style={{
                  filter: 'drop-shadow(0 0 40px rgba(255,255,255,0.1))',
                }}
              />
            </motion.div>

            {/* Architectural crosshair ticks - animated */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[200px] h-[200px] flex items-center justify-center">
                {Array.from({ length: 4 }).map((_, i) => (
                  <motion.div
                    key={`tick-${i}`}
                    className="absolute w-px h-8 bg-white/30"
                    style={{
                      transform: `rotate(${i * 90}deg) translateY(-100px)`,
                      transformOrigin: 'center center',
                    }}
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{
                      opacity: logoDrawProgress,
                      scaleY: logoDrawProgress
                    }}
                    transition={{
                      duration: LOGO_DRAW_DURATION * 0.8,
                      ease: LOGO_EASE,
                      delay: 0.1 + i * 0.05
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Counter: 000 → 100 */}
          <div className="font-mono text-[clamp(3rem,8vw,6rem)] font-extrabold tracking-[0.15em] text-white tabular-nums select-none">
            {String(counter).padStart(3, '0')}
          </div>

          {/* Telemetry */}
          <motion.p
            className="font-mono text-xs tracking-[0.3em] uppercase text-white/40 mt-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: LOGO_EASE, delay: 0.3 }}
          >
            [ INITIALIZING ARCHIVE ]
          </motion.p>
        </div>

        {/* 5 Vertical Architectural Curtains - Staggered Wave Retraction */}
        <AnimatePresence mode="wait">
          {showCurtains && (
            <div className="absolute inset-0 flex items-stretch pointer-events-none" aria-hidden="true">
              {Array.from({ length: CURTAIN_COUNT }).map((_, i) => (
                <motion.div
                  key={`curtain-${i}`}
                  className="flex-1 bg-[#050505] border-r border-white/[0.04] last:border-0"
                  initial={{ y: '0%' }}
                  animate={{ y: '-100%' }}
                  exit={{ y: '-100%' }}
                  transition={{
                    duration: CURTAIN_DURATION,
                    ease: CURTAIN_EASE,
                    delay: i * (STAGGER_DELAY / 1000),
                  }}
                  style={{
                    willChange: 'transform',
                    transformOrigin: 'center top',
                  }}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}

export default NumericPreloader;