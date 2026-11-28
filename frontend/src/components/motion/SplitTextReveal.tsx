'use client';

import { forwardRef, useRef, useEffect, useState, useImperativeHandle, ElementType, ComponentRef } from 'react';
import { motion } from 'framer-motion';

type CubicBezierEasing = [number, number, number, number];

interface SplitTextRevealProps<C extends ElementType = 'div'> {
  children: React.ReactNode;
  splitBy?: 'chars' | 'words' | 'lines';
  className?: string;
  delay?: number;
  duration?: number;
  stagger?: number;
  ease?: CubicBezierEasing;
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  immediate?: boolean;
  as?: C;
}

interface SplitTextRevealRef<C extends ElementType = 'div'> {
  element: ComponentRef<C> | null;
}

const DEFAULT_EASE: CubicBezierEasing = [0.16, 1, 0.3, 1];

const SplitTextReveal = forwardRef<SplitTextRevealRef<ElementType>, SplitTextRevealProps<ElementType>>(({
  children,
  splitBy = 'words',
  className = '',
  delay = 0,
  duration = 0.8,
  stagger = 0.05,
  ease = DEFAULT_EASE,
  threshold = 0.1,
  rootMargin = '0px',
  once = true,
  immediate = false,
  as: Component = 'div',
}, ref) => {
  const internalRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(immediate);
  const [hasAnimated, setHasAnimated] = useState(immediate);

  useImperativeHandle(ref, () => ({
    element: internalRef.current,
  }));

  useEffect(() => {
    if (immediate) return;

    const element = internalRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once, immediate]);

  useEffect(() => {
    if (isVisible && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [isVisible, hasAnimated]);

  const splitText = (text: string) => {
    switch (splitBy) {
      case 'chars':
        return text.split('');
      case 'words':
        // Split by words but preserve spaces as explicit segments for proper spacing
        // Also treat commas as separate segments to ensure proper trailing space
        return text.split(/(\s+|,)/).filter((s) => s.length > 0);
      case 'lines':
        return text.split('\n');
      default:
        return [text];
    }
  };

  const textContent = typeof children === 'string' ? children : '';
  const segments = splitText(textContent);

  if (!textContent || typeof children !== 'string') {
    return (
      <motion.div
        ref={internalRef}
        className={className}
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible || hasAnimated ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration, ease, delay }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <Component
      ref={internalRef}
      className={`inline-flex flex-wrap gap-x-[0.28em] gap-y-[0.06em] ${className}`}
      aria-hidden={!isVisible && !hasAnimated}
    >
      {segments.map((segment, index) => {
        const isSpace = /^\s+$/.test(segment);
        return (
          <motion.span
            key={index}
            initial={{ opacity: 0, y: '100%' }}
            animate={isVisible || hasAnimated ? { opacity: 1, y: 0 } : { opacity: 0, y: '100%' }}
            transition={{ duration, ease, delay: delay + index * stagger }}
            style={{
              willChange: 'opacity, transform',
              whiteSpace: isSpace ? 'pre' : 'normal',
            }}
          >
            {isSpace ? ' ' : segment}
          </motion.span>
        );
      })}
    </Component>
  );
});

SplitTextReveal.displayName = 'SplitTextReveal';

export { SplitTextReveal };
export { SplitTextReveal as default };