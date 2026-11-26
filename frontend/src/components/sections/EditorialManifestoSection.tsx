'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { SplitTextReveal } from '@/components/ui/SplitTextReveal';
import { ParallaxImage } from '@/components/ui/ParallaxVideo';

const manifestoText = `We believe the future of work is not a marketplace — it's a partnership. Every project posted, every proposal sent, every milestone reached is a step toward a world where talent finds its match without friction, where clients find craft without compromise, and where the best work rises on merit alone.`;

const manifestoImages = [
  { src: '/media/arch-01.jpg', alt: 'Architecture space 1' },
  { src: '/media/arch-02.jpg', alt: 'Architecture space 2' },
  { src: '/media/arch-03.jpg', alt: 'Architecture space 3' },
  { src: '/media/arch-04.jpg', alt: 'Architecture space 4' },
];

export function EditorialManifestoSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const { scrollXProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const imagesX = useTransform(scrollXProgress, [0, 1], ['0%', '-30%']);
  const textX = useTransform(scrollXProgress, [0, 1], ['0%', '15%']);

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
      { threshold: 0.1, rootMargin: '0px 0px -20% 0px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <section className="relative py-20 lg:py-32 overflow-hidden" data-lenis-prevent>
      <div className="container">
        {/* Section Label */}
        <div className="mb-12" style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s'
        }}>
          <span className="font-mono text-xs text-[var(--color-text-subtle)] tracking-wider uppercase">Manifesto</span>
        </div>

        {/* Horizontal Scroll Container */}
        <div
          ref={containerRef}
          className="relative overflow-hidden"
          style={{ width: '100%' }}
        >
          <div className="flex gap-8 lg:gap-12" style={{ width: 'max-content' }}>
            {/* Text Column - Left */}
            <motion.div
              className="flex-shrink-0 w-[40%] lg:w-[35%] xl:w-[30%] min-w-[320px] max-w-[500px] pt-4"
              style={{
                opacity: isVisible ? 1 : 0,
                willChange: 'transform',
                transition: isVisible ? 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s' : 'none',
                x: prefersReducedMotion ? 0 : textX,
              }}
            >
              <SplitTextReveal
                splitBy="words"
                delay={0.3}
                stagger={0.03}
                duration={1.2}
                ease="cubic-bezier(0.16, 1, 0.3, 1)"
                once={true}
                as="div"
                className="font-editorial italic font-light text-[var(--color-text-muted)] leading-relaxed tracking-[0.01em] text-[clamp(1.125rem,2.5vw,1.5rem)]"
              >
                {manifestoText}
              </SplitTextReveal>

              {/* Accent line */}
              <div className="mt-12 w-16 h-px bg-[var(--color-text-subtle)]" />
              <p className="mt-6 font-mono text-xs text-[var(--color-text-subtle)] tracking-wider uppercase">
                FreelanceHub — 2026
              </p>
            </motion.div>

            {/* Images Column - Right (horizontal scroll) */}
            <motion.div
              className="flex-shrink-0 flex gap-6 lg:gap-8 w-[60%] lg:w-[65%] xl:w-[70%] min-w-[400px]"
              style={{
                opacity: isVisible ? 1 : 0,
                willChange: 'transform',
                transition: isVisible ? 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1) 0.5s' : 'none',
                x: prefersReducedMotion ? 0 : imagesX,
              }}
            >
              {manifestoImages.map((image, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 relative overflow-hidden"
                  style={{
                    width: 'calc((100% - 48px) / 3)',
                    minWidth: '280px',
                    aspectRatio: '4/5',
                    transitionDelay: `${index * 0.1}s`,
                  }}
                >
                  <ParallaxImage
                    src={image.src}
                    alt={image.alt}
                    aspectRatio={4 / 5}
                    speed={0.1}
                    zoomRange={[1, 1.05]}
                    revealOnScroll={false}
                    className="grayscale"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)]/40 via-transparent to-transparent pointer-events-none" />
                  {/* Monospace index overlay */}
                  <div className="absolute bottom-4 left-4 font-mono text-xs text-[var(--color-white)]/70 tracking-wider">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[var(--color-text-subtle)] font-mono text-xs tracking-wider uppercase" style={{
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1.2s'
        }}>
          <svg className="w-4 h-4 animate-bounce" style={{ animationDuration: '2s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
          <span>Drag or scroll horizontally</span>
        </div>
      </div>
    </section>
  );
}

export { EditorialManifestoSection as default };