'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from '@tanstack/react-router';
import { ParallaxImage } from '@/components/ui/ParallaxVideo';

const indexItems = [
  {
    id: 'idx-1',
    category: 'Development',
    title: 'Full-Stack Engineers',
    subtitle: 'React, Node, Python, Go — production-ready',
    count: '2,847',
    image: '/media/arch-01.jpg',
    href: '/talent?category=development',
    index: '01',
  },
  {
    id: 'idx-2',
    category: 'Design',
    title: 'Product Designers',
    subtitle: 'UI/UX, Systems, Brand — pixel-perfect craft',
    count: '1,923',
    image: '/media/arch-02.jpg',
    href: '/talent?category=design',
    index: '02',
  },
  {
    id: 'idx-3',
    category: 'AI & Data',
    title: 'ML Engineers & Data Scientists',
    subtitle: 'LLMs, Computer Vision, Analytics — cutting edge',
    count: '892',
    image: '/media/arch-03.jpg',
    href: '/talent?category=ai-data',
    index: '03',
  },
  {
    id: 'idx-4',
    category: 'Mobile',
    title: 'iOS & Android Developers',
    subtitle: 'Swift, Kotlin, React Native, Flutter — native feel',
    count: '1,456',
    image: '/media/arch-04.jpg',
    href: '/talent?category=mobile',
    index: '04',
  },
  {
    id: 'idx-5',
    category: 'DevOps',
    title: 'Cloud & Infrastructure',
    subtitle: 'AWS, K8s, Terraform, CI/CD — scale with confidence',
    count: '678',
    image: '/media/arch-01.jpg',
    href: '/talent?category=devops',
    index: '05',
  },
  {
    id: 'idx-6',
    category: 'Writing',
    title: 'Technical Writers',
    subtitle: 'Docs, API refs, Content strategy — clarity first',
    count: '445',
    image: '/media/arch-02.jpg',
    href: '/talent?category=writing',
    index: '06',
  },
];

export function InteractiveIndexSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Horizontal parallax scroll using framer-motion scroll
  const { scrollXProgress } = useScroll({
    target: trackRef,
    offset: ['start end', 'end start'],
  });

  // Parallax transforms for each item
  const itemTransforms = indexItems.map((_, index) => {
    const speed = 0.15 + index * 0.02;
    return useTransform(scrollXProgress, [0, 1], [`${index * 15}%`, `${index * 15 - speed * 100}%`]);
  });

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
        <div className="mb-12" style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s'
        }}>
          <span className="font-mono text-xs text-[var(--color-text-subtle)] tracking-wider uppercase">Interactive Index</span>
          <h2 className="font-display font-extrabold tracking-[-0.04em] leading-[0.9] text-[var(--color-text)] mt-2" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}>
            Browse by<br />Expertise
          </h2>
        </div>

        {/* Horizontal Magazine-style Scroll */}
        <div
          ref={trackRef}
          className="relative overflow-x-auto scrollbar-hide pb-4"
          style={{
            scrollBehavior: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <div className="flex gap-6 lg:gap-8" style={{ width: 'max-content' }}>
            {indexItems.map((item, index) => {
              const itemX = itemTransforms[index];
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  className="flex-shrink-0 group relative overflow-hidden"
                  style={{
                    width: 'calc(50% - 18px)',
                    minWidth: '340px',
                    maxWidth: '420px',
                    aspectRatio: '3/4',
                    transitionDelay: `${index * 0.08}s`,
                  }}
                  aria-label={`Explore ${item.title} — ${item.count} professionals`}
                >
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      willChange: 'transform',
                      x: prefersReducedMotion ? 0 : itemX,
                    }}
                  >
                    <ParallaxImage
                      src={item.image}
                      alt={item.title}
                      aspectRatio={3 / 4}
                      speed={0.08}
                      zoomRange={[1, 1.05]}
                      revealOnScroll={false}
                      className="grayscale group-hover:scale-[1.02] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    />
                  </motion.div>
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)]/95 via-[var(--color-bg)]/20 to-transparent pointer-events-none" />
                  {/* Index number */}
                  <div className="absolute top-4 left-4 font-mono text-xs text-[var(--color-white)]/70 tracking-wider bg-[var(--color-bg)]/50 px-2 py-1 border border-[var(--color-border)]">
                    {item.index}
                  </div>
                  {/* Category tag */}
                  <div className="absolute top-4 right-4 font-mono text-xs text-[var(--color-white)]/50 tracking-wider uppercase bg-[var(--color-bg)]/50 px-2 py-1 border border-[var(--color-border)]">
                    {item.category}
                  </div>
                  {/* Content */}
                  <div className="absolute bottom-4 left-4 right-4 pointer-events-none" style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s'
                  }}>
                    <h3 className="font-display font-bold text-[var(--color-white)] leading-tight tracking-[-0.02em] group-hover:text-[var(--color-accent)] transition-colors" style={{ fontSize: 'clamp(1.125rem, 2vw, 1.5rem)' }}>
                      {item.title}
                    </h3>
                    <p className="font-editorial italic text-[var(--color-white)]/70 text-sm mt-1">
                      {item.subtitle}
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      <span className="font-mono text-xs text-[var(--color-white)]/50 tracking-wider">
                        {item.count}+ professionals
                      </span>
                      <span className="w-6 h-px bg-[var(--color-white)]/20 group-hover:bg-[var(--color-white)]/50 transition-colors" />
                    </div>
                  </div>
                  {/* Hover indicator */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <svg className="w-6 h-6 text-[var(--color-white)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="mt-8 flex items-center justify-center gap-4 text-[var(--color-text-subtle)] font-mono text-xs tracking-wider uppercase" style={{
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1.2s'
        }}>
          <span>Drag or scroll horizontally to explore all categories</span>
          <svg className="w-5 h-5 animate-bounce" style={{ animationDuration: '2s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </section>
  );
}

export { InteractiveIndexSection as default };