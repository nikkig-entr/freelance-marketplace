'use client';

import { forwardRef, useRef, useEffect, useState, useImperativeHandle, ElementType, ComponentRef } from 'react';
import { SplitTextReveal } from './SplitTextReveal';

interface MonumentalHeadlineProps<C extends ElementType = 'h1'> {
  children: React.ReactNode;
  className?: string;
  as?: C;
  splitBy?: 'lines' | 'words' | 'chars';
  delay?: number;
  stagger?: number;
  duration?: number;
  ease?: string;
  parallax?: boolean;
  parallaxStrength?: number;
  maskAnimation?: boolean;
}

interface MonumentalHeadlineRef {
  element: HTMLElement | null;
}

const MonumentalHeadline = forwardRef<MonumentalHeadlineRef, MonumentalHeadlineProps<'h1'>>(({
  children,
  className = '',
  as: Component = 'h1',
  splitBy = 'lines',
  delay = 0,
  stagger = 0.08,
  duration = 1.2,
  ease = 'cubic-bezier(0.76, 0, 0.24, 1)',
  parallax = true,
  parallaxStrength = 0.15,
  maskAnimation = true,
}, ref) => {
  const internalRef = useRef<ComponentRef<'h1'>>(null);
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useImperativeHandle(ref, () => ({
    element: internalRef.current,
  }));

  // Parallax effect on scroll
  useEffect(() => {
    if (!parallax || !internalRef.current) return;

    const handleScroll = () => {
      const element = internalRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Only apply parallax when element is in viewport
      if (rect.bottom >= 0 && rect.top <= viewportHeight) {
        const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
        setScrollY((progress - 0.5) * 2 * parallaxStrength * 100);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [parallax, parallaxStrength]);

  // Intersection observer for mask animation
  useEffect(() => {
    const element = internalRef.current;
    if (!element || !maskAnimation) return;

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
  }, [maskAnimation]);

  const textContent = typeof children === 'string' ? children : '';
  const lines = splitBy === 'lines' ? textContent.split('\n') : [textContent];

  return (
    <Component
      ref={internalRef}
      className={`
        font-display font-extrabold tracking-[-0.04em] leading-[0.88]
        text-[var(--color-text)]
        ${maskAnimation ? 'overflow-hidden' : ''}
        ${className}
      `}
      style={{
        fontSize: 'clamp(3.2rem, 8.5vw, 9.5rem)',
        transform: parallax ? `translateX(${scrollY}px)` : 'none',
        willChange: parallax ? 'transform' : 'auto',
      }}
      aria-hidden={maskAnimation && !isVisible}
    >
      {maskAnimation && !isVisible ? (
        <div className="relative" style={{ height: '1.1em' }}>
          <div className="absolute inset-0 bg-[var(--color-bg)]" />
        </div>
      ) : (
        lines.map((line, lineIndex) => (
          <div
            key={lineIndex}
            className="relative overflow-hidden"
            style={{
              display: 'block',
              transform: maskAnimation && isVisible ? 'none' : 'translateY(100%)',
              transition: maskAnimation && isVisible
                ? `transform ${duration}s ${ease} ${delay + lineIndex * stagger}s`
                : 'none',
            }}
          >
            <SplitTextReveal
              splitBy={splitBy === 'lines' ? 'words' : splitBy}
              delay={delay + lineIndex * stagger}
              stagger={stagger * 0.6}
              duration={duration * 0.8}
              ease={ease}
              as="span"
              once={true}
            >
              {line}
            </SplitTextReveal>
          </div>
        ))
      )}
    </Component>
  );
});

MonumentalHeadline.displayName = 'MonumentalHeadline';

export { MonumentalHeadline };
export { MonumentalHeadline as default };