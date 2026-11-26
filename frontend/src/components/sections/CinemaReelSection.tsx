'use client';

import { useRef, useEffect, useState } from 'react';
import { ParallaxVideo } from '@/components/ui/ParallaxVideo';
import { SplitTextReveal } from '@/components/ui/SplitTextReveal';

const reelItems = [
  {
    id: 'reel-1',
    title: 'Project Discovery',
    subtitle: 'AI-matched opportunities in seconds',
    videoSrc: '/media/hero-bg.mp4',
    posterSrc: '/media/arch-01.jpg',
    index: '01',
  },
  {
    id: 'reel-2',
    title: 'Secure Collaboration',
    subtitle: 'Built-in escrow, milestones, reviews',
    videoSrc: '/media/studio-reel.mp4',
    posterSrc: '/media/arch-02.jpg',
    index: '02',
  },
  {
    id: 'reel-3',
    title: 'Talent Showcase',
    subtitle: 'Portfolios that speak for themselves',
    videoSrc: '/media/hero-bg.mp4',
    posterSrc: '/media/arch-03.jpg',
    index: '03',
  },
  {
    id: 'reel-4',
    title: 'Smart Payments',
    subtitle: 'Instant payouts, global coverage',
    videoSrc: '/media/studio-reel.mp4',
    posterSrc: '/media/arch-04.jpg',
    index: '04',
  },
];

export function CinemaReelSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Auto-scroll animation
  useEffect(() => {
    if (prefersReducedMotion || !trackRef.current) return;

    const track = trackRef.current;
    let animationId: number;
    let lastTime = 0;

    const animate = (time: number) => {
      if (isPlaying && trackRef.current) {
        const delta = time - lastTime;
        const speed = 0.3; // pixels per ms
        track.scrollLeft += speed * delta;
        lastTime = time;
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, prefersReducedMotion]);

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

  return (
    <section className="relative py-20 lg:py-32 overflow-hidden" data-lenis-prevent>
      <div className="container">
        {/* Section Header */}
        <div className="mb-12 flex items-end justify-between gap-8" style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s'
        }}>
          <div>
            <span className="font-mono text-xs text-[var(--color-text-subtle)] tracking-wider uppercase">Cinema Reel</span>
            <h2 className="font-display font-extrabold tracking-[-0.04em] leading-[0.9] text-[var(--color-text)] mt-2" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}>
              Work in<br />Motion
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <SplitTextReveal splitBy="chars" delay={0.5} stagger={0.02} duration={0.6} as="span" className="font-mono text-sm text-[var(--color-text-subtle)] tracking-wider">
              {String(activeIndex + 1).padStart(2, '0')} / {String(reelItems.length).padStart(2, '0')}
            </SplitTextReveal>
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="glass px-4 py-2.5 border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-white)] hover:bg-[var(--glass-bg)] transition-colors"
              aria-label={isPlaying ? 'Pause reel' : 'Play reel'}
            >
              {isPlaying ? '❚❚ Pause' : '▶ Play'}
            </button>
          </div>
        </div>

        {/* Horizontal Video Track */}
        <div
          ref={trackRef}
          className="relative overflow-x-auto scrollbar-hide pb-4"
          style={{
            scrollBehavior: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
          onScroll={() => {}}
        >
          <div
            ref={trackRef}
            className="flex gap-6 lg:gap-8"
            style={{ width: 'max-content' }}
            onMouseEnter={() => setIsPlaying(false)}
            onMouseLeave={() => setIsPlaying(true)}
          >
            {reelItems.map((item, index) => (
              <div
                key={item.id}
                className="flex-shrink-0 relative overflow-hidden"
                style={{
                  width: 'calc(33.333% - 28px)',
                  minWidth: '380px',
                  maxWidth: '520px',
                  aspectRatio: '16/9',
                  transitionDelay: `${index * 0.1}s`,
                }}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <ParallaxVideo
                  src={item.videoSrc}
                  poster={item.posterSrc}
                  aspectRatio={16 / 9}
                  speed={0.05}
                  zoomRange={[1, 1.03]}
                  revealOnScroll={false}
                  className="grayscale"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)]/90 via-[var(--color-bg)]/10 to-transparent pointer-events-none" />
                {/* Index badge */}
                <div className="absolute top-4 left-4 font-mono text-xs text-[var(--color-white)]/70 tracking-wider bg-[var(--color-bg)]/50 px-2 py-1 border border-[var(--color-border)]">
                  {item.index}
                </div>
                {/* Content overlay */}
                <div className="absolute bottom-4 left-4 right-4 pointer-events-none" style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s'
                }}>
                  <p className="font-mono text-xs text-[var(--color-white)]/50 tracking-wider uppercase mb-1">
                    Feature
                  </p>
                  <h3 className="font-display font-bold text-[var(--color-white)] leading-tight tracking-[-0.02em]" style={{ fontSize: 'clamp(1.125rem, 2vw, 1.5rem)' }}>
                    {item.title}
                  </h3>
                  <p className="font-editorial italic text-[var(--color-white)]/70 text-sm mt-1">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="mt-8 flex items-center justify-center gap-4 text-[var(--color-text-subtle)] font-mono text-xs tracking-wider uppercase" style={{
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1.2s'
        }}>
          <span>Scroll horizontally to explore</span>
          <svg className="w-5 h-5 animate-bounce" style={{ animationDuration: '2s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </section>
  );
}

export { CinemaReelSection as default };