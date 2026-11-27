'use client';

import { forwardRef, useRef, useEffect, useState, useImperativeHandle, ElementType, ComponentRef } from 'react';

interface SplitTextRevealProps<C extends ElementType = 'div'> {
  children: React.ReactNode;
  splitBy?: 'chars' | 'words' | 'lines';
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  duration?: number;
  stagger?: number;
  ease?: string;
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  as?: C;
  immediate?: boolean; // Above-the-fold headlines animate immediately on mount
}

interface SplitTextRevealRef<C extends ElementType = 'div'> {
  element: ComponentRef<C> | null;
}

const SplitTextReveal = forwardRef<SplitTextRevealRef<ElementType>, SplitTextRevealProps<ElementType>>(({
  children,
  splitBy = 'lines',
  className = '',
  style,
  delay = 0,
  duration = 0.8,
  stagger = 0.05,
  ease = 'cubic-bezier(0.16, 1, 0.3, 1)',
  threshold = 0.1,
  rootMargin = '0px',
  once = true,
  as: Component = 'div',
  immediate = false,
}, ref) => {
  const internalRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(immediate);
  const [hasAnimated, setHasAnimated] = useState(immediate);

  useImperativeHandle(ref, () => ({
    element: internalRef.current,
  }));

  useEffect(() => {
    if (immediate) return; // Skip observer for immediate content

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
        return text.split(/(\s+)/).filter((s) => s.length > 0);
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
      <Component
        ref={internalRef}
        className={className}
        style={{
          opacity: isVisible || hasAnimated ? 1 : 0,
          transform: isVisible || hasAnimated ? 'translateY(0)' : 'translateY(105%)',
          transition: `opacity ${duration}s ${ease} ${delay}s, transform ${duration}s ${ease} ${delay}s`,
          ...style,
        }}
      >
        {children}
      </Component>
    );
  }

  return (
    <Component
      ref={internalRef}
      className={className}
      style={style}
      aria-hidden={!isVisible && !hasAnimated}
    >
      {segments.map((segment, index) => (
        <span
          key={index}
          style={{
            display: splitBy === 'chars' ? 'inline-block' : 'inline',
            opacity: isVisible || hasAnimated ? 1 : 0,
            transform: isVisible || hasAnimated ? 'translateY(0)' : 'translateY(105%)',
            transition: `opacity ${duration}s ${ease} ${delay + index * stagger}s, transform ${duration}s ${ease} ${delay + index * stagger}s`,
            willChange: 'opacity, transform',
          }}
        >
          {segment}
        </span>
      ))}
    </Component>
  );
});

SplitTextReveal.displayName = 'SplitTextReveal';

export { SplitTextReveal };
export { SplitTextReveal as default };