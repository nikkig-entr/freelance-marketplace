'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Link } from '@tanstack/react-router';
import { CinemaMedia } from '@/components/ui/CinemaMedia';

export function EditorialParallaxStage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Framer Motion scroll for hollow display bands
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

  // Horizontal transform for hollow display bands
  const band1X = useTransform(smoothProgress, [0, 1], ['0%', '-100%']);
  const band2X = useTransform(smoothProgress, [0, 1], ['100%', '0%']);

  // Vertical parallax for photography (opposing directions)
  const photo1Y = useTransform(smoothProgress, [0, 1], [-45, 45]);
  const photo2Y = useTransform(smoothProgress, [0, 1], [55, -55]);

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

  
  const hollowStyle = {
    fontFamily: "'Syne', 'Unbounded', sans-serif",
    fontWeight: 800,
    textTransform: 'uppercase' as const,
    fontSize: 'clamp(2.2rem, 6vw, 6.2rem)',
    lineHeight: 1,
    whiteSpace: 'nowrap' as const,
    WebkitTextStroke: '1px rgba(255,255,255,0.45)',
    color: 'transparent',
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-[#050505] border-t border-b border-white/15 overflow-hidden"
      data-lenis-prevent
      style={{ willChange: 'transform' }}
    >
      {/* OPPOSING HORIZONTAL HOLLOW DISPLAY BANDS */}
      <div className="py-8 md:py-12 border-b border-white/15 overflow-hidden select-none" aria-hidden="true">
        {/* Band 1: Left to Right */}
        <motion.div
          className="flex items-center gap-4 whitespace-nowrap will-change-transform"
          style={{ x: band1X }}
          aria-hidden="true"
        >
          <span style={hollowStyle}>SELECTED ARCHIVE • INDEPENDENT PRACTICE • SELECTED ARCHIVE •</span>
          <span style={hollowStyle}>SELECTED ARCHIVE • INDEPENDENT PRACTICE • SELECTED ARCHIVE •</span>
        </motion.div>

        {/* Band 2: Right to Left (opposing) */}
        <motion.div
          className="flex items-center gap-4 whitespace-nowrap will-change-transform mt-2"
          style={{ x: band2X }}
          aria-hidden="true"
        >
          <span style={hollowStyle}>SYSTEMS • SPATIAL • WEBGL • DIRECTION • SYSTEMS • SPATIAL •</span>
          <span style={hollowStyle}>SYSTEMS • SPATIAL • WEBGL • DIRECTION • SYSTEMS • SPATIAL •</span>
        </motion.div>
      </div>

      {/* ASYMMETRICAL 12-COLUMN SWISS GRID WITH mix-blend-difference */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* LEFT EDITORIAL MANIFESTO COLUMN */}
        <div className="lg:col-span-5 p-6 md:p-12 lg:border-r border-white/15 flex flex-col justify-between">
          <div
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <span className="font-mono text-xs text-white/40 tracking-wider uppercase block mb-6">
              [ 01 / PRACTICE ]
            </span>
            <p className="font-sans text-white/70 leading-relaxed tracking-[0.01em] text-[clamp(1rem,1.5vw,1.25rem)] max-w-none">
              We connect visionary founders and architectural studios with vetted independent directors, spatial designers, and creative technologists.
            </p>
          </div>

          <Link
            to="/talent"
            className="inline-flex items-center justify-center gap-2 border border-white px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] text-white hover:bg-white hover:text-black transition-all duration-300 min-h-[48px] w-full sm:w-auto"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
            }}
          >
            VIEW ROSTER →
          </Link>
        </div>

        {/* RIGHT VISUAL PARALLAX STAGE */}
        <div className="lg:col-span-7 relative min-h-[480px] md:min-h-[620px] p-6 md:p-12 overflow-hidden flex items-center justify-center">
          {/* Photo 1: Top-left, moves up then down */}
          <div className="absolute top-6 left-6 md:top-12 md:left-12 w-[45%] md:w-[40%] aspect-[4/3] overflow-hidden" aria-hidden="true">
            <motion.div
              className="w-full h-full"
              style={{
                y: photo1Y,
                willChange: 'transform',
              }}
            >
              <CinemaMedia
                src="/media/arch-01.jpg"
                aspectRatio={4 / 3}
                className="w-full h-full object-cover"
                              />
            </motion.div>
          </div>

          {/* Photo 2: Bottom-right, moves down then up */}
          <div className="absolute bottom-6 right-6 md:bottom-12 md:right-12 w-[45%] md:w-[40%] aspect-[4/3] overflow-hidden" aria-hidden="true">
            <motion.div
              className="w-full h-full"
              style={{
                y: photo2Y,
                willChange: 'transform',
              }}
            >
              <CinemaMedia
                src="/media/arch-02.jpg"
                aspectRatio={4 / 3}
                className="w-full h-full object-cover"
                              />
            </motion.div>
          </div>

          {/* mix-blend-difference Oversized Display Serif Statement */}
          <motion.p
            className="mix-blend-difference text-white pointer-events-none z-10 font-editorial italic font-light leading-[0.85] text-[clamp(3rem,8vw,7rem)] whitespace-nowrap"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
              transition: 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
            }}
            aria-hidden="true"
          >
            Form follows precision.
          </motion.p>
        </div>
      </div>
    </section>
  );
}

export { EditorialParallaxStage as default };