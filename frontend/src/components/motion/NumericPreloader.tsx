'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

interface NumericPreloaderProps {
  onComplete: () => void;
}

/**
 * Museum-Grade Launch Curtain - lusion.co / igloo.inc Caliber
 *
 * Sequence:
 * 1. 5 vertical columns (curtains) cover the #050505 stage
 * 2. BrandMark draws via SVG pathLength (0→1 over 300ms)
 * 3. Numeric counter: 000 → 100 in 550ms with exponential easing
 * 4. Columns retract upward in 450ms (staggered 60ms, ease: [0.76, 0, 0.24, 1])
 * 5. Total ~1050ms, onComplete fires immediately
 */
export function NumericPreloader({ onComplete }: NumericPreloaderProps) {
  const [counter, setCounter] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'drawing' | 'counting' | 'retracting' | 'complete'>('idle');
  const [curtainStates, setCurtainStates] = useState<boolean[]>([true, true, true, true, true]);
  const [logoDrawProgress, setLogoDrawProgress] = useState(0);
  const [retracting, setRetracting] = useState(false);

  const startTimeRef = useRef<number>(0);
  const animationRef = useRef<number>(0);

  // Exponential easing for logo drawing
  const exponentialEase = useCallback((t: number): number => {
    return 1 - Math.pow(1 - t, 4);
  }, []);

  // Counter easing: fast exponential to 100 in 550ms
  const counterEase = useCallback((t: number): number => {
    if (t < 0.1) return Math.pow(t / 0.1, 2) * 0.1;
    return 1 - Math.pow(1 - t, 3.2);
  }, []);

  // Main animation loop - TOTAL: ~1050ms
  useEffect(() => {
    startTimeRef.current = performance.now();
    setPhase('drawing');

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;

      if (phase === 'drawing') {
        // Logo SVG drawing: 0→1 over 300ms (faster)
        const drawProgress = Math.min(elapsed / 300, 1);
        setLogoDrawProgress(exponentialEase(drawProgress));

        if (elapsed >= 300) {
          setPhase('counting');
          startTimeRef.current = now;
        }
      } else if (phase === 'counting') {
        // Numeric counter: 000→100 over 550ms
        const countProgress = Math.min(elapsed / 550, 1);
        const eased = counterEase(countProgress);
        setCounter(Math.round(eased * 100));

        if (elapsed >= 550) {
          setCounter(100);
          setPhase('retracting');
          setRetracting(true); // pointer-events-none starts here
          startTimeRef.current = now;
        }
      } else if (phase === 'retracting') {
        // 5 columns retract upward in 450ms with 60ms stagger, ease: [0.76, 0, 0.24, 1]
        const retractDuration = 450;
        const stagger = 60;

        setCurtainStates(prev => {
          const next = [...prev];
          let anyRetracting = false;

          next.forEach((_, i) => {
            const columnStart = i * stagger;
            const columnElapsed = elapsed - columnStart;

            if (columnElapsed > 0 && columnElapsed < retractDuration) {
              anyRetracting = true;
            } else if (columnElapsed >= retractDuration) {
              next[i] = false;
            }
          });

          if (!anyRetracting && next.every(s => !s)) {
            setPhase('complete');
            setRetracting(false);
            // Total should be ~300 + 550 + 450 = 1300ms but we overlap phases
            // Actually: drawing(300) + counting(550) + retracting(450 + 4*60 stagger) = ~1090ms
            // Fire onComplete immediately when all retracted
            onComplete();
            return next;
          }

          return next;
        });
      }

      if (phase !== 'complete') {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [phase, exponentialEase, counterEase, onComplete]);

  // Accessibility: respect prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setPhase('complete');
      setCounter(100);
      setLogoDrawProgress(1);
      setCurtainStates([false, false, false, false, false]);
      onComplete();
    }
  }, [onComplete]);

  // Counter display formatting: 000, 001... 099, 100
  const counterDisplay = counter < 10 ? `00${counter}` : counter < 100 ? `0${counter}` : '100';

  // Curtain transforms: translateY(0) → translateY(-100%)
  // CSS handles the actual animation via transition on each column

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-bg)]"
      role="status"
      aria-label="Loading"
      aria-live="polite"
      style={{ pointerEvents: retracting ? 'none' : 'auto' }}
    >
      {/* 5 Vertical Curtain Columns */}
      <div className="absolute inset-0 flex" aria-hidden="true">
        {curtainStates.map((isVisible, i) => (
          <div
            key={i}
            className="relative flex-1 bg-[var(--color-bg)] transition-transform duration-450 ease-[cubic-bezier(0.76,0,0.24,1)]"
            style={{
              transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
              transitionDelay: `${i * 60}ms`,
              willChange: 'transform',
            }}
          />
        ))}
      </div>

      {/* Center Content - BrandMark + Counter */}
      <div className="relative z-10 flex flex-col items-center gap-8 pointer-events-none">
        {/* Geometric Compass Monogram - draws via stroke-dashoffset */}
        <svg width="96" height="96" viewBox="0 0 48 48" fill="none" aria-hidden="true" className="text-[var(--color-text)]">
          <defs>
            <path
              id="brand-path"
              d="M24 4 C15.163 4 8 11.163 8 20 C8 28.837 15.163 36 24 36 C32.837 36 40 28.837 40 20 C40 11.163 32.837 4 24 4 Z
                 M24 12 L24 36
                 M12 24 L36 24
                 M15.172 15.172 L32.828 32.828
                 M32.828 15.172 L15.172 32.828
                 M24 18 L30 24 L24 30 L18 24 Z
                 M24 20 C22.343 20 21 21.343 21 23 C21 24.657 22.343 26 24 26 C25.657 26 27 24.657 27 23 C27 21.343 25.657 20 24 20 Z"
            />
          </defs>
          <use
            href="#brand-path"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="600"
            strokeDashoffset={`${600 * (1 - logoDrawProgress)}`}
            vectorEffect="non-scaling-stroke"
            style={{ transition: 'stroke-dashoffset 300ms cubic-bezier(0.16, 1, 0.3, 1)' }}
          />
        </svg>

        {/* Numeric Counter: 000 → 100 */}
        <div className="font-mono text-[32px] tracking-[0.4em] text-[var(--color-text)] tabular-nums select-none" style={{ fontFamily: 'var(--font-mono), monospace' }}>
          {counterDisplay}%
        </div>
      </div>
    </div>
  );
}

export default NumericPreloader;