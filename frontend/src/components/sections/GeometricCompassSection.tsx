'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

interface CompassState {
  isHovered: boolean;
  isPressed: boolean;
  scale: number;
  targetScale: number;
}

const TELEMETRY = [
  { label: '04', value: 'CORE DISCIPLINES' },
  { label: '100%', value: 'VETTED TALENT' },
  { label: '24H', value: 'CURATED DISPATCH' },
  { label: '0%', value: 'AGENCY FRICTION' },
];

// Quadrant base angles: 0 (right), π/2 (down), π (left), 3π/2 (up)
const QUADRANT_ANGLES = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
const BASE_RADIUS = 152;
const INNER_RADIUS = 76;
const CENTER = 210;

export function GeometricCompassSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [compassState, setCompassState] = useState<CompassState>({
    isHovered: false,
    isPressed: false,
    scale: 1,
    targetScale: 1,
  });

  // Framer Motion scroll for spring-smoothed progress
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Spring-smoothed scroll progress for anti-jitter
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    mass: 0.25,
  });

  // Scroll-driven transforms
  const outerRotation = useTransform(smoothProgress, [0, 1], ['0deg', '180deg']);
  const outerRotationReverse = useTransform(smoothProgress, [0, 1], ['0deg', '-180deg']);
  const dashOffset = useTransform(smoothProgress, [0, 1], [0, 1000]);
  const quadrantSeparation = useTransform(smoothProgress, [0, 1], [0, 0.35]);

  // Create motion values for each quadrant's cx, cy based on scroll
  const quadrantCX = QUADRANT_ANGLES.map((angle) =>
    useTransform(
      quadrantSeparation,
      [0, 1],
      [
        CENTER + Math.cos(angle) * BASE_RADIUS,
        CENTER + Math.cos(angle) * (BASE_RADIUS + 60 * Math.sign(Math.cos(angle) || 1)),
      ]
    )
  );

  const quadrantCY = QUADRANT_ANGLES.map((angle) =>
    useTransform(
      quadrantSeparation,
      [0, 1],
      [
        CENTER + Math.sin(angle) * BASE_RADIUS,
        CENTER + Math.sin(angle) * (BASE_RADIUS + 60 * Math.sign(Math.sin(angle) || 1)),
      ]
    )
  );

  // Intersection observer for entrance animation
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  
  // Spring animation for scale (hover/press)
  useEffect(() => {
    setCompassState(prev => ({
      ...prev,
      scale: prev.scale + (prev.targetScale - prev.scale) * 0.15,
    }));
  }, [compassState.targetScale]);

  // Event handlers with spring configs
  const handleMouseEnter = useCallback(() => {
    setCompassState(prev => ({
      ...prev,
      isHovered: true,
      targetScale: 1.08,
    }));
  }, []);

  const handleMouseLeave = useCallback(() => {
    setCompassState(prev => ({
      ...prev,
      isHovered: false,
      targetScale: prev.isPressed ? 0.95 : 1,
    }));
  }, []);

  const handleMouseDown = useCallback(() => {
    setCompassState(prev => ({
      ...prev,
      isPressed: true,
      targetScale: 0.95,
    }));
  }, []);

  const handleMouseUp = useCallback(() => {
    setCompassState(prev => ({
      ...prev,
      isPressed: false,
      targetScale: prev.isHovered ? 1.08 : 1,
    }));
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handleMouseEnter();
    handleMouseDown();
  }, [handleMouseEnter, handleMouseDown]);

  const handleTouchEnd = useCallback(() => {
    handleMouseUp();
    handleMouseLeave();
  }, [handleMouseUp, handleMouseLeave]);

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-[#050505] border-b border-white/15 py-16 md:py-24 px-4 md:px-8 overflow-hidden"
      data-lenis-prevent
      style={{ willChange: 'transform' }}
    >
      {/* TOP HEADER ROW */}
      <div className="flex justify-between items-center font-mono text-[11px] uppercase tracking-[0.22em] text-neutral-400 mb-12">
        <span>[ 02 / PRECISION SYSTEM ]</span>
        <span>[ // GEOMETRIC CALIBRATION ]</span>
      </div>

      {/* ROTATED 90° VERTICAL EDGE TELEMETRY (DESKTOP ONLY) */}
      <div className="hidden lg:block absolute right-6 top-1/2 -translate-y-1/2 [writing-mode:vertical-rl] font-mono text-[10px] tracking-[0.28em] text-neutral-500 uppercase">
        ARCHITECTURAL COORDINATION MATRIX
      </div>

      {/* INTERACTIVE & SCROLL-DRIVEN GEOMETRIC SVG SCULPTURE */}
      <div className="relative flex justify-center">
        <motion.div
          className="relative"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
            transition: 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <svg
            viewBox="0 0 420 420"
            className="w-[270px] sm:w-[340px] md:w-[400px] h-auto mx-auto cursor-pointer select-none"
            aria-hidden="true"
            style={{ willChange: 'transform' }}
          >
            <defs>
              <radialGradient id="compassGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
                <stop offset="70%" stopColor="rgba(255,255,255,0.02)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </radialGradient>
            </defs>

            {/* Outer glow ring - scales with hover/press */}
            <motion.circle
              cx="210"
              cy="210"
              r="205"
              fill="url(#compassGlow)"
              animate={{ scale: compassState.scale }}
              style={{
                transformOrigin: '210px 210px',
                willChange: 'transform',
              }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* Outer circle - 1px stroke, counter-rotation (0deg -> 180deg) */}
            <motion.circle
              cx="210"
              cy="210"
              r="192"
              fill="none"
              stroke="rgba(255,255,255,0.55)"
              strokeWidth="1"
              style={{
                rotate: outerRotation,
                transformOrigin: '210px 210px',
                willChange: 'transform',
              }}
              transition={{ duration: 0, ease: 'linear' }}
            />

            {/* Precision crosshair axes - counter-rotate opposite (0deg -> -180deg) */}
            <motion.g
              style={{
                rotate: outerRotationReverse,
                transformOrigin: '210px 210px',
                willChange: 'transform',
              }}
              transition={{ duration: 0, ease: 'linear' }}
            >
              <line
                x1="210"
                y1="12"
                x2="210"
                y2="80"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="1"
              />
              <line
                x1="210"
                y1="340"
                x2="210"
                y2="408"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="1"
              />
              <line
                x1="12"
                y1="210"
                x2="80"
                y2="210"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="1"
              />
              <line
                x1="340"
                y1="210"
                x2="408"
                y2="210"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="1"
              />
            </motion.g>

            {/* Dashed orbital arc ring (r=152) - rotates opposite */}
            <motion.circle
              cx="210"
              cy="210"
              r="152"
              fill="none"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1"
              strokeDasharray="6 6"
              style={{
                rotate: outerRotationReverse,
                transformOrigin: '210px 210px',
                willChange: 'transform',
              }}
              transition={{ duration: 0, ease: 'linear' }}
            />

            {/* 4 INNER TANGENT GEOMETRIC CIRCLES (r=76) IN 4 QUADRANTS */}
            {QUADRANT_ANGLES.map((_, i) => (
              <motion.g
                key={i}
                style={{ transformOrigin: '210px 210px', willChange: 'transform' }}
              >
                {/* Orbit path indicator (static reference) */}
                <motion.circle
                  cx="210"
                  cy="210"
                  r={BASE_RADIUS}
                  fill="none"
                  stroke="rgba(255,255,255,0.03)"
                  strokeWidth="0.5"
                  strokeDasharray="8 12"
                />

                {/* Inner circle - moves radially with scroll, counter-rotates, morphs on hover/press */}
                <motion.circle
                  cx={quadrantCX[i]}
                  cy={quadrantCY[i]}
                  r={INNER_RADIUS}
                  fill="none"
                  stroke={compassState.isHovered || compassState.isPressed ? '#FFFFFF' : 'rgba(255,255,255,0.65)'}
                  strokeWidth={compassState.isHovered || compassState.isPressed ? 1.5 : 1}
                  style={{
                    rotate: outerRotationReverse,
                    strokeDasharray: compassState.isHovered || compassState.isPressed ? '120 80 40 80' : '200 200',
                    strokeDashoffset: dashOffset,
                    transformOrigin: `${quadrantCX[i].get()}px ${quadrantCY[i].get()}px`,
                    willChange: 'transform, stroke-dasharray, stroke-dashoffset',
                  }}
                  transition={{
                    rotate: { duration: 0, ease: 'linear' },
                    strokeDasharray: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                    strokeDashoffset: { duration: 0, ease: 'linear' },
                    stroke: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                    strokeWidth: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                  }}
                />

                {/* Center dot - scales with hover/press */}
                <motion.circle
                  cx={quadrantCX[i]}
                  cy={quadrantCY[i]}
                  r={3}
                  fill="rgba(255,255,255,0.8)"
                  animate={{ scale: compassState.scale }}
                  style={{
                    transformOrigin: `${quadrantCX[i].get()}px ${quadrantCY[i].get()}px`,
                    willChange: 'transform',
                  }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                />
              </motion.g>
            ))}

            {/* Center crosshair - rotates opposite to outer ring */}
            <motion.g
              style={{
                rotate: outerRotationReverse,
                transformOrigin: '210px 210px',
                willChange: 'transform',
              }}
              transition={{ duration: 0, ease: 'linear' }}
            >
              <line
                x1="210"
                y1="90"
                x2="210"
                y2="150"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1"
              />
              <line
                x1="210"
                y1="270"
                x2="210"
                y2="330"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1"
              />
              <line
                x1="90"
                y1="210"
                x2="150"
                y2="210"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1"
              />
              <line
                x1="270"
                y1="210"
                x2="330"
                y2="210"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1"
              />

              {/* Center circle */}
              <circle
                cx="210"
                cy="210"
                r="20"
                fill="none"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="1"
              />
              <motion.circle
                cx="210"
                cy="210"
                r="8"
                fill="rgba(255,255,255,0.9)"
                animate={{ scale: compassState.scale }}
                style={{
                  transformOrigin: '210px 210px',
                  willChange: 'transform',
                }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              />
            </motion.g>

            {/* Cardinal markers - counter-rotate */}
            {['N', 'E', 'S', 'W'].map((dir, i) => {
              const angle = (i * Math.PI) / 2 - Math.PI / 2;
              const r = 212;
              return (
                <motion.text
                  key={dir}
                  x={210 + Math.cos(angle) * r}
                  y={210 + Math.sin(angle) * r + 4}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="rgba(255,255,255,0.25)"
                  fontFamily="'JetBrains Mono', monospace"
                  fontSize="10"
                  style={{
                    rotate: outerRotationReverse,
                    transformOrigin: '210px 210px',
                    willChange: 'transform',
                  }}
                  transition={{ duration: 0, ease: 'linear' }}
                >
                  {dir}
                </motion.text>
              );
            })}
          </svg>
        </motion.div>
      </div>

      {/* ZERO-COLLISION 4-COLUMN TELEMETRY GRID BELOW */}
      <div
        className="mt-14 grid grid-cols-2 md:grid-cols-4 border-t border-b border-white/15"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
        }}
      >
        {TELEMETRY.map((item, i) => (
          <motion.div
            key={item.label}
            className="relative flex flex-col items-center py-8 px-4 border-r border-white/15 last:border-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 + i * 0.08 }}
          >
            <div className="font-heading font-extrabold text-white text-[clamp(1.5rem,3vw,2.5rem)] leading-[0.9] tracking-[-0.02em]">
              {item.label}
            </div>
            <div className="font-mono text-xs text-neutral-400 tracking-widest uppercase mt-2">
              {item.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* PRECISION STATEMENT - DEDICATED ROW UNDERNEATH */}
      <div
        className="mt-10 text-center"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s',
        }}
      >
        <p className="font-editorial italic font-light text-neutral-400 leading-relaxed tracking-[0.01em] text-[clamp(1rem,1.5vw,1.25rem)] max-w-2xl mx-auto">
          Precision geometry guides every match. Zero friction. Zero compromises.
        </p>
      </div>
    </section>
  );
}

export { GeometricCompassSection as default };