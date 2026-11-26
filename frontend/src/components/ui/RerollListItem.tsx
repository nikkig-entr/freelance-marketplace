'use client';

import { useState, useEffect } from 'react';

interface RerollListItemProps {
  children: React.ReactNode;
  altText?: string;
  className?: string;
  onClick?: () => void;
  as?: 'li' | 'div' | 'button' | 'a';
  href?: string;
  delay?: number;
  speed?: number;
}

export function RerollListItem({
  children,
  altText,
  className = '',
  onClick,
  as: Component = 'li',
  href,
  delay = 0,
  speed = 1,
}: RerollListItemProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [phase, setPhase] = useState(0);
  const [showAlt, setShowAlt] = useState(false);

  const textContent = typeof children === 'string' ? children : '';
  const altContent = altText || textContent;

  useEffect(() => {
    if (!isHovering) return;

    const animate = () => {
      // Phase 1: slide up current text
      setPhase(1);
      setShowAlt(false);

      setTimeout(() => {
        // Phase 2: swap text
        setShowAlt(true);
        setPhase(2);

        setTimeout(() => {
          // Phase 3: slide down new text
          setPhase(0);

          setTimeout(() => {
            if (isHovering) {
              // Phase 4: slide up alt text
              setPhase(-1);

              setTimeout(() => {
                // Phase 5: swap back
                setShowAlt(false);
                setPhase(-2);

                setTimeout(() => {
                  // Phase 6: slide down original
                  setPhase(0);
                  animate(); // Loop
                }, 150 / speed);
              }, 150 / speed);
            }
          }, 3000 / speed); // Hold alt text
        }, 150 / speed);
      }, 150 / speed);
    };

    const timeout = setTimeout(animate, delay);
    return () => clearTimeout(timeout);
  }, [isHovering, delay, speed, altContent]);

  const sharedStyles = `
    font-display font-medium tracking-tight
    transition-transform duration-300 ease-[cubic-bezier(0.76,0,0.24,1)]
    select-none
  `;

  const getTransform = (p: number) => {
    switch (p) {
      case 1: return 'translateY(-100%)';
      case 2: return 'translateY(0)';
      case -1: return 'translateY(-100%)';
      case -2: return 'translateY(0)';
      default: return 'translateY(0)';
    }
  };

  const RenderedComponent = href ? 'a' : Component;

  return (
    <RenderedComponent
      href={href}
      onClick={onClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`
        relative inline-block overflow-hidden
        cursor-pointer
        ${className}
      `}
      style={{ perspective: '1000px' }}
    >
      <span
        className={sharedStyles}
        style={{
          display: 'block',
          transform: getTransform(phase),
          opacity: showAlt ? 0 : 1,
        }}
      >
        {textContent}
      </span>
      <span
        className={sharedStyles}
        style={{
          display: 'block',
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          transform: getTransform(phase - 1),
          opacity: showAlt ? 1 : 0,
        }}
      >
        {altContent}
      </span>
    </RenderedComponent>
  );
}

interface RerollListProps {
  items: Array<{ text: string; altText?: string; href?: string; onClick?: () => void }>;
  className?: string;
  staggerDelay?: number;
  speed?: number;
}

export function RerollList({ items, className = '', staggerDelay = 80, speed = 1 }: RerollListProps) {
  return (
    <ul className={`flex flex-col gap-3 ${className}`} role="list">
      {items.map((item, index) => (
        <RerollListItem
          key={index}
          altText={item.altText}
          delay={index * staggerDelay}
          speed={speed}
          href={item.href}
          onClick={item.onClick}
          className="text-headline-5 font-semibold text-[var(--color-text)] hover:text-[var(--color-accent)]"
        >
          {item.text}
        </RerollListItem>
      ))}
    </ul>
  );
}

export { RerollList as default };