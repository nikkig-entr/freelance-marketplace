'use client';

import { forwardRef, useRef, useEffect, useState, useImperativeHandle, ElementType, ComponentRef } from 'react';

interface EditorialTextProps<C extends ElementType = 'p'> {
  children: React.ReactNode;
  className?: string;
  as?: C;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  animated?: boolean;
  hoverReroll?: boolean;
  rerollText?: string;
}

interface EditorialTextRef {
  element: HTMLElement | null;
}

const sizeClasses = {
  sm: 'text-base sm:text-lg',
  md: 'text-lg sm:text-xl lg:text-2xl',
  lg: 'text-xl sm:text-2xl lg:text-3xl',
  xl: 'text-2xl sm:text-3xl lg:text-4xl',
  '2xl': 'text-3xl sm:text-4xl lg:text-5xl',
};

const EditorialText = forwardRef<EditorialTextRef, EditorialTextProps<'p'>>(({
  children,
  className = '',
  as: Component = 'p',
  size = 'md',
  animated = false,
  hoverReroll = false,
  rerollText,
}, ref) => {
  const internalRef = useRef<ComponentRef<'p'>>(null);
  const [isVisible, setIsVisible] = useState(!animated);
  const [isHovering, setIsHovering] = useState(false);
  const [rerollPhase, setRerollPhase] = useState(0);

  useImperativeHandle(ref, () => ({
    element: internalRef.current,
  }));

  useEffect(() => {
    if (!animated) return;
    const element = internalRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [animated]);

  // Double vertical "reroll" animation on hover
  useEffect(() => {
    if (!hoverReroll || !isHovering) return;

    let phase = 0;
    const interval = setInterval(() => {
      phase = (phase + 1) % 2;
      setRerollPhase(phase);
    }, 150);

    return () => clearInterval(interval);
  }, [hoverReroll, isHovering]);

  const textContent = typeof children === 'string' ? children : '';
  const displayText = hoverReroll && isHovering && rerollText ? rerollText : textContent;

  return (
    <Component
      ref={internalRef}
      className={`
        font-editorial italic font-light tracking-[0.01em] leading-relaxed
        text-[var(--color-text-muted)]
        ${sizeClasses[size]}
        ${animated && !isVisible ? 'opacity-0 translate-y-6' : 'opacity-100 translate-y-0'}
        ${animated ? 'transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]' : ''}
        ${hoverReroll ? 'transition-all duration-300 ease-out cursor-default' : ''}
        ${className}
      `}
      style={{
        fontSize: size === 'sm' ? 'clamp(1rem, 2.5vw, 1.25rem)' :
                  size === 'md' ? 'clamp(1.125rem, 3vw, 1.5rem)' :
                  size === 'lg' ? 'clamp(1.25rem, 3.5vw, 1.875rem)' :
                  size === 'xl' ? 'clamp(1.5rem, 4vw, 2.25rem)' :
                  'clamp(1.875rem, 5vw, 3rem)',
      }}
      onMouseEnter={() => hoverReroll && setIsHovering(true)}
      onMouseLeave={() => hoverReroll && setIsHovering(false)}
      aria-label={hoverReroll && rerollText ? `${textContent}. ${rerollText}` : textContent}
    >
      {!hoverReroll ? (
        displayText
      ) : (
        <span
          className="inline-block relative overflow-hidden"
          style={{
            transform: `translateY(${isHovering ? (rerollPhase === 0 ? '-100%' : '100%') : '0'})`,
            transition: 'transform 0.3s cubic-bezier(0.76, 0, 0.24, 1)',
          }}
        >
          <span className="block">{textContent}</span>
          <span className="absolute top-full left-0 block">{rerollText || textContent}</span>
        </span>
      )}
    </Component>
  );
});

EditorialText.displayName = 'EditorialText';

export { EditorialText };
export { EditorialText as default };