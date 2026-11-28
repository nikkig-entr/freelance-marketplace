'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

interface CompassState {
  rotation: number;
  targetRotation: number;
  dashOffset: number;
  targetDashOffset: number;
  scale: number;
  targetScale: number;
  quadrantAngles: number[];
  isHovered: boolean;
  isPressed: boolean;
}

const TELEMETRY = [
  { label: '04', value: 'DISCIPLINES' },
  { label: '100%', value: 'VETTED' },
  { label: '24H', value: 'DISPATCH' },
  { label: '0%', value: 'FRICTION' },
];

export function GeometricCompassSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [compassState, setCompassState] = useState<CompassState>({
    rotation: 0,
    targetRotation: 0,
    dashOffset: 0,
    targetDashOffset: 0,
    scale: 1,
    targetScale: 1,
    quadrantAngles: [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2],
    isHovered: false,
    isPressed: false,
  });
  const timeRef = useRef(0);
  const animationRef = useRef<number>();

  // Scroll-driven animation
  const { scrollY } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const scrollRotation = useTransform(scrollY, [0, 1], [0, Math.PI * 2]);
  const scrollDashOffset = useTransform(scrollY, [0, 1], [0, 1000]);
  const scrollScale = useTransform(scrollY, [0, 0.5, 1], [1, 1.05, 1]);

  // Spring-smoothed scroll values
  const smoothRotation = useSpring(scrollRotation, { stiffness: 80, damping: 20 });
  const smoothDashOffset = useSpring(scrollDashOffset, { stiffness: 60, damping: 18 });
  const smoothScale = useSpring(scrollScale, { stiffness: 100, damping: 25 });

  // Intersection observer
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

  // Spring physics animation loop
  const animate = useCallback(() => {
    timeRef.current += 16.67;

    setCompassState(prev => {
      const springK = 0.08;
      const damping = 0.85;

      // Spring toward target values
      let newRotation = prev.rotation + (prev.targetRotation - prev.rotation) * springK;
      let newDashOffset = prev.dashOffset + (prev.targetDashOffset - prev.dashOffset) * springK;
      let newScale = prev.scale + (prev.targetScale - prev.scale) * springK;

      // Apply damping
      const rotVel = (newRotation - prev.rotation) * damping;
      const dashVel = (newDashOffset - prev.dashOffset) * damping;
      const scaleVel = (newScale - prev.scale) * damping;

      newRotation = prev.rotation + rotVel;
      newDashOffset = prev.dashOffset + dashVel;
      newScale = prev.scale + scaleVel;

      // Autonomous slow rotation when not interacted
      let autoRotation = 0;
      if (!prev.isHovered && !prev.isPressed) {
        autoRotation = timeRef.current * 0.00005;
      }

      // Quadrant animation - smooth orbital motion with scroll-driven separation
      const scrollFactor = smoothRotation.get() / (Math.PI * 2); // 0 to 1
      const quadrantSeparation = scrollFactor * 0.25; // Quadrants split apart as you scroll

      const newQuadrantAngles = prev.quadrantAngles.map((_angle, i) => {
        const baseAngle = (i * Math.PI) / 2;
        const orbitSpeed = 0.00008 + i * 0.00002;
        const orbitRadius = prev.isHovered ? 0.18 : 0.1;
        // Add separation offset based on scroll
        const separationOffset = quadrantSeparation * Math.sin(baseAngle + timeRef.current * 0.0001);
        return baseAngle + Math.sin(timeRef.current * orbitSpeed) * orbitRadius + separationOffset;
      });

      return {
        ...prev,
        rotation: newRotation + autoRotation,
        dashOffset: newDashOffset,
        scale: newScale,
        quadrantAngles: newQuadrantAngles,
      };
    });

    animationRef.current = requestAnimationFrame(animate);
  }, [smoothRotation]);

  useEffect(() => {
    animate();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  // Sync scroll-driven values (spring-smoothed)
  useEffect(() => {
    setCompassState(prev => ({
      ...prev,
      targetRotation: smoothRotation.get(),
      targetDashOffset: smoothDashOffset.get(),
      targetScale: smoothScale.get(),
    }));
  }, [smoothRotation, smoothDashOffset, smoothScale]);

  // Event handlers
  const handleMouseEnter = useCallback(() => {
    setCompassState(prev => ({
      ...prev,
      isHovered: true,
      targetRotation: prev.targetRotation + Math.PI / 4,
      targetDashOffset: prev.targetDashOffset + 250,
      targetScale: 1.08,
    }));
  }, []);

  const handleMouseLeave = useCallback(() => {
    setCompassState(prev => ({
      ...prev,
      isHovered: false,
      targetScale: 1,
    }));
  }, []);

  const handleMouseDown = useCallback(() => {
    setCompassState(prev => ({
      ...prev,
      isPressed: true,
      targetScale: 0.95,
      targetRotation: prev.targetRotation + Math.PI / 2,
      targetDashOffset: prev.targetDashOffset + 500,
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
      className="relative py-16 md:py-24 px-4 md:px-8 border-t border-white/15 border-b border-white/15 overflow-hidden"
      data-lenis-prevent
    >
      {/* Architectural 1px Hairline Grid Background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Vertical grid lines */}
        <div className="absolute inset-0 flex justify-between">
          {[...Array(24)].map((_, i) => (
            <div key={i} className="w-px h-full bg-white/10" style={{ left: `${i / 24 * 100}%` }} />
          ))}
        </div>
        {/* Horizontal grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="h-px w-full bg-white/10" style={{ top: `${i / 16 * 100}%` }} />
          ))}
        </div>
      </div>

      {/* Rotated 90° Vertical Edge Markers */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Left edge marker - rotated -90deg */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 transform rotate-[-90deg] origin-center font-mono text-xs text-white/30 tracking-widest uppercase whitespace-nowrap">
          [ 02 — SYSTEM METRICS ]
        </div>
        {/* Right edge marker - rotated 90deg */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 transform rotate-[90deg] origin-center font-mono text-xs text-white/30 tracking-widest uppercase whitespace-nowrap">
          [ 02 — SYSTEM METRICS ]
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container">
        {/* Section Header */}
        <div className="mb-12 md:mb-16 text-center"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <p className="font-mono text-xs text-[var(--color-text-subtle)] tracking-wider uppercase mb-2">
            [ 02 / GEOMETRIC COMPASS ]
          </p>
        </div>

        {/* Interactive SVG Geometric Compass */}
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
              ref={svgRef}
              viewBox="0 0 500 500"
              className="w-[400px] h-[400px] md:w-[500px] md:h-[500px]"
              aria-hidden="true"
            >
              <defs>
                {/* Gradient for glow effects */}
                <radialGradient id="compassGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
                  <stop offset="70%" stopColor="rgba(255,255,255,0.02)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </radialGradient>
              </defs>

              {/* Outer glow ring */}
              <circle
                cx="250"
                cy="250"
                r="240"
                fill="url(#compassGlow)"
                style={{
                  transform: `scale(${compassState.scale})`,
                  transformOrigin: '250px 250px',
                }}
              />

              {/* Outer circle - 1px stroke, scroll-driven rotation */}
              <circle
                cx="250"
                cy="250"
                r="235"
                fill="none"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="1"
                style={{
                  transform: `rotate(${compassState.rotation}rad) scale(${compassState.scale})`,
                  transformOrigin: '250px 250px',
                }}
                strokeDasharray="1476"
                strokeDashoffset={compassState.dashOffset}
              />

              {/* 4 Tangent inner circles - morphing quadrants with scroll-driven separation */}
              {compassState.quadrantAngles.map((angle, i) => {
                const radius = 180;
                const cx = 250 + Math.cos(angle) * radius;
                const cy = 250 + Math.sin(angle) * radius;
                const innerRadius = 65;
                const isActive = compassState.isHovered || compassState.isPressed;

                return (
                  <g key={i} style={{ transformOrigin: '250px 250px' }}>
                    {/* Orbit path indicator */}
                    <circle
                      cx="250"
                      cy="250"
                      r={radius}
                      fill="none"
                      stroke="rgba(255,255,255,0.03)"
                      strokeWidth="0.5"
                      strokeDasharray="8, 12"
                      style={{
                        strokeDashoffset: timeRef.current * 0.02 + i * 200,
                      }}
                    />

                    {/* Inner circle - morphing strokeDasharray */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={innerRadius}
                      fill="none"
                      stroke="rgba(255,255,255,0.65)"
                      strokeWidth="1"
                      style={{
                        transform: `rotate(${compassState.rotation * -1}rad)`,
                        transformOrigin: `${cx}px ${cy}px`,
                        strokeDasharray: isActive ? '120, 80, 40, 80' : '200, 200',
                        strokeDashoffset: compassState.dashOffset * 0.5 + i * 100,
                        transition: 'stroke-dasharray 0.8s cubic-bezier(0.16, 1, 0.3, 1), stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    />

                    {/* Center dot */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={3}
                      fill="rgba(255,255,255,0.8)"
                      style={{
                        transform: `scale(${compassState.scale})`,
                        transformOrigin: `${cx}px ${cy}px`,
                      }}
                    />
                  </g>
                );
              })}

              {/* Center crosshair - rotates opposite to outer ring */}
              <g style={{
                transform: `rotate(${compassState.rotation * -1}rad) scale(${compassState.scale})`,
                transformOrigin: '250px 250px',
              }}>
                <line
                  x1="250"
                  y1="100"
                  x2="250"
                  y2="180"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="1"
                />
                <line
                  x1="250"
                  y1="320"
                  x2="250"
                  y2="400"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="1"
                />
                <line
                  x1="100"
                  y1="250"
                  x2="180"
                  y2="250"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="1"
                />
                <line
                  x1="320"
                  y1="250"
                  x2="400"
                  y2="250"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="1"
                />

                {/* Center circle */}
                <circle
                  cx="250"
                  cy="250"
                  r="20"
                  fill="none"
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth="1"
                />
                <circle
                  cx="250"
                  cy="250"
                  r="8"
                  fill="rgba(255,255,255,0.9)"
                />
              </g>

              {/* Cardinal markers - counter-rotate */}
              {['N', 'E', 'S', 'W'].map((dir, i) => {
                const angle = (i * Math.PI) / 2 - Math.PI / 2;
                const r = 260;
                return (
                  <text
                    key={dir}
                    x={250 + Math.cos(angle) * r}
                    y={250 + Math.sin(angle) * r + 4}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="rgba(255,255,255,0.25)"
                    fontFamily="'JetBrains Mono', monospace"
                    fontSize="10"
                    style={{
                      transform: `rotate(${compassState.rotation * -1}rad)`,
                      transformOrigin: '250px 250px',
                    }}
                  >
                    {dir}
                  </text>
                );
              })}
            </svg>
          </motion.div>
        </div>

        {/* Telemetry Display - Clean 4-column hairline grid BELOW the compass */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-0 border-t border-b border-white/15"
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
              <div className="font-mono text-xs text-white/40 tracking-widest uppercase mt-2">
                {item.value}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Precision statement - dedicated row underneath */}
        <div className="mt-10 text-center"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s',
          }}
        >
          <p className="font-[Instrument_Serif] italic font-light text-[var(--color-text-muted)] leading-relaxed tracking-[0.01em] text-[clamp(1rem,1.5vw,1.25rem)] max-w-2xl mx-auto">
            Precision geometry guides every match. Zero friction. Zero compromises.
          </p>
        </div>
      </div>
    </section>
  );
}

export { GeometricCompassSection as default };