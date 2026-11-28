'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from '@tanstack/react-router';
import { CinemaMedia } from '@/components/ui/CinemaMedia';
import { SplitTextReveal } from '@/components/motion/SplitTextReveal';

export function EditorialParallaxStage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Framer Motion scroll values
  const { scrollY } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Horizontal transform for opposing typography bands (wider range for more dramatic effect)
  const translateX1 = useTransform(scrollY, [0, 1], ['0%', '-40%']);
  const translateX2 = useTransform(scrollY, [0, 1], ['0%', '40%']);

  // Vertical parallax for photographs (opposing speeds)
  const photo1Y = useTransform(scrollY, [0, 1], ['60%', '-60%']);
  const photo2Y = useTransform(scrollY, [0, 1], ['-40%', '80%']);

  // Opacity fade for mix-blend-difference headline
  const headlineOpacity = useTransform(scrollY, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

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

  return (
    <section
      ref={containerRef}
      className="relative border-t border-white/15 overflow-hidden"
      data-lenis-prevent
    >
      {/* Parallax Container - overflow hidden for clipping */}
      <div className="relative overflow-hidden">
        {/* BACKGROUND LAYER: B&W Photography with vertical parallax */}
        <div className="absolute inset-0 -z-10 pointer-events-none" aria-hidden="true">
          {/* Photo 1: arch-01 - moves up */}
          <motion.div
            className="absolute left-0 top-0 w-full h-full"
            style={{ y: photo1Y }}
          >
            <CinemaMedia
              src="/media/arch-01.jpg"
              aspectRatio={16 / 9}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Photo 2: arch-02 - moves down */}
          <motion.div
            className="absolute left-0 top-0 w-full h-full"
            style={{ y: photo2Y }}
          >
            <CinemaMedia
              src="/media/arch-02.jpg"
              aspectRatio={16 / 9}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>

        {/* MIDDLE LAYER: Hollow display typography bands - opposing horizontal scroll */}
        <div className="relative h-[60vh] min-h-[400px] max-h-[550px] flex items-center justify-center overflow-hidden pointer-events-none">
          {/* Band 1: SELECTED ARCHIVE - hollow, moves left */}
          <motion.div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-max whitespace-nowrap"
            style={{ x: translateX1 }}
          >
            <h2 className="font-heading font-extrabold uppercase tracking-[-0.02em] leading-[0.85] text-[clamp(4rem,12vw,14rem)] text-transparent -webkit-text-stroke-[1px]_rgba(255,255,255,0.45) select-none">
              SELECTED ARCHIVE&nbsp;&nbsp;SELECTED ARCHIVE&nbsp;&nbsp;SELECTED ARCHIVE
            </h2>
          </motion.div>

          {/* Band 2: INDEPENDENT PRACTICE - hollow, moves right */}
          <motion.div
            className="absolute right-0 top-1/2 -translate-y-1/2 w-max whitespace-nowrap"
            style={{ x: translateX2 }}
          >
            <h2 className="font-heading font-extrabold uppercase tracking-[-0.02em] leading-[0.85] text-[clamp(4rem,12vw,14rem)] text-transparent -webkit-text-stroke-[1px]_rgba(255,255,255,0.45) select-none text-right">
              INDEPENDENT PRACTICE&nbsp;&nbsp;INDEPENDENT PRACTICE&nbsp;&nbsp;INDEPENDENT PRACTICE
            </h2>
          </motion.div>
        </div>

        {/* FOREGROUND LAYER: mix-blend-difference headline - inverts over photos */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-difference"
          style={{ opacity: headlineOpacity }}
        >
          <div className="text-center px-4">
            <motion.h3
              className="font-heading font-extrabold uppercase tracking-[-0.03em] leading-[0.88] text-white text-[clamp(2.5rem,6vw,5.5rem)] select-none"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            >
              ARCHITECTURAL TALENT
            </motion.h3>
          </div>
        </motion.div>
      </div>

      {/* EDITORIAL MANIFESTO - Clean 12-column grid with hairlines */}
      <div className="container relative z-10 border-b border-white/15">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 py-16 md:py-20">
          {/* Left Column - Editorial Manifesto (span 5) */}
          <div className="lg:col-span-5 pt-4 lg:pt-8">
            <div className="mb-8 lg:mb-12"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <span className="font-mono text-xs text-[var(--color-text-subtle)] tracking-wider uppercase block mb-4">
                [ 01 / PRACTICE ]
              </span>
              <SplitTextReveal
                splitBy="lines"
                delay={0.2}
                stagger={0.1}
                duration={1}
                ease="cubic-bezier(0.16, 1, 0.3, 1)"
                as="h3"
                className="font-[Instrument_Serif] italic font-light text-[var(--color-text-muted)] leading-[0.95] text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
              >
                We believe the future
                <br />
                of architectural practice
                <br />
                is a partnership
              </SplitTextReveal>
            </div>

            <p
              className="font-[Instrument_Serif] italic font-light text-[var(--color-text-muted)] leading-relaxed tracking-[0.01em] text-[clamp(1.125rem,2vw,1.5rem)] mb-12 max-w-none"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
              }}
            >
              Every project posted, every proposal sent, every milestone reached is a step toward a world where talent finds its match without friction, where clients find craft without compromise, and where the best work rises on merit alone.
            </p>

            {/* Architectural hairline divider */}
            <div className="w-16 h-px bg-[var(--color-text-subtle)] mb-6"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
              }}
            />
            <Link
              to="/projects"
              className="inline-flex items-center justify-center gap-2 border border-white px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors min-h-[48px] w-full sm:w-auto"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s',
              }}
            >
              VIEW ROSTER
            </Link>
          </div>

          {/* Right Column - Cinema Frame (span 7) */}
          <div className="lg:col-span-7 relative" data-cursor="PLAY REEL"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
              transition: 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1) 0.15s',
            }}
          >
            <div className="aspect-[16/10] w-full overflow-hidden">
              <CinemaMedia
                src="/media/arch-03.jpg"
                aspectRatio={16 / 10}
                className="w-full h-full object-cover rounded-none"
              />
            </div>

            {/* Precision grid hairlines overlay */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              {/* Vertical hairlines */}
              <div className="absolute inset-0 flex justify-between px-4">
                {[...Array(11)].map((_, i) => (
                  <div key={i} className="w-px h-full bg-white/5" style={{ left: `${(i + 1) / 12 * 100}%` }} />
                ))}
              </div>
              {/* Horizontal hairlines */}
              <div className="absolute inset-0 flex flex-col justify-between py-4">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="h-px w-full bg-white/5" style={{ top: `${(i + 1) / 8 * 100}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export { EditorialParallaxStage as default };