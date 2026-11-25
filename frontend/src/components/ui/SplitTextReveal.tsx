'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { SplitText } from 'split-type';

interface SplitTextRevealProps {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  className?: string;
  splitBy?: 'lines' | 'words' | 'chars';
  delay?: number;
  stagger?: number;
  duration?: number;
  ease?: [number, number, number, number];
  fromY?: number;
  opacity?: [number, number];
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

export function SplitTextReveal({
  children,
  as: Component = 'div',
  className = '',
  splitBy = 'lines',
  delay = 0,
  stagger = 0.08,
  duration = 1.0,
  ease = [0.16, 1, 0.3, 1],
  fromY = 100,
  opacity = [0, 1],
  threshold = 0.1,
  rootMargin = '0px',
  once = true,
}: SplitTextRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once, amount: threshold, margin: rootMargin });
  const [splitText, setSplitText] = useState<SplitText | null>(null);
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!ref.current || prefersReducedMotion) return;

    const st = new SplitText(ref.current, { types: splitBy });
    setSplitText(st);

    return () => {
      st.revert();
    };
  }, [splitBy, prefersReducedMotion]);

  const elements = splitBy === 'lines' ? splitText?.lines : splitBy === 'words' ? splitText?.words : splitText?.chars;

  if (prefersReducedMotion || !elements || elements.length === 0) {
    return <Component ref={ref} className={className}>{children}</Component>;
  }

  return (
    <Component ref={ref} className={className} style={{ overflow: 'hidden' }}>
      <motion.div
        style={{ display: 'flex', flexDirection: 'column', gap: splitBy === 'lines' ? '0' : '0' }}
        aria-hidden="true"
      >
        {elements.map((el, i) => (
          <motion.span
            key={i}
            style={{
              display: splitBy === 'chars' ? 'inline-block' : 'block',
              overflow: 'hidden',
              willChange: 'transform, opacity',
            }}
            initial={{ y: `${fromY}%`, opacity: opacity[0] }}
            animate={isInView ? { y: '0%', opacity: opacity[1] } : { y: `${fromY}%`, opacity: opacity[0] }}
            transition={{
              delay: delay + i * stagger,
              duration,
              ease,
            }}
          >
            {el.textContent}
          </motion.span>
        ))}
      </motion.div>
    </Component>
  );
}

interface SplitTextRevealLinesProps extends Omit<SplitTextRevealProps, 'splitBy'> {
  lineClassName?: string;
}

export function SplitTextRevealLines({
  children,
  as: Component = 'h1',
  className = '',
  lineClassName = '',
  delay = 0,
  stagger = 0.1,
  duration = 1.0,
  ease = [0.16, 1, 0.3, 1],
  fromY = 110,
  opacity = [0, 1],
  threshold = 0.1,
  rootMargin = '0px',
  once = true,
}: SplitTextRevealLinesProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once, amount: threshold, margin: rootMargin });
  const [splitText, setSplitText] = useState<SplitText | null>(null);
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!ref.current || prefersReducedMotion) return;
    const st = new SplitText(ref.current, { types: 'lines' });
    setSplitText(st);
    return () => st.revert();
  }, [prefersReducedMotion]);

  if (prefersReducedMotion || !splitText?.lines || splitText.lines.length === 0) {
    return <Component ref={ref} className={className}>{children}</Component>;
  }

  return (
    <Component ref={ref} className={className} style={{ overflow: 'hidden' }}>
      <motion.div
        style={{ display: 'flex', flexDirection: 'column', gap: '0' }}
        aria-hidden="true"
      >
        {splitText.lines.map((line, i) => (
          <motion.div
            key={i}
            className={lineClassName}
            style={{ overflow: 'hidden', willChange: 'transform, opacity' }}
            initial={{ y: `${fromY}%`, opacity: opacity[0] }}
            animate={isInView ? { y: '0%', opacity: opacity[1] } : { y: `${fromY}%`, opacity: opacity[0] }}
            transition={{
              delay: delay + i * stagger,
              duration,
              ease,
            }}
          >
            <span style={{ display: 'block', whiteSpace: 'pre-wrap' }}>{line.textContent}</span>
          </motion.div>
        ))}
      </motion.div>
    </Component>
  );
}

interface SplitTextRevealWordsProps extends Omit<SplitTextRevealProps, 'splitBy'> {
  wordClassName?: string;
}

export function SplitTextRevealWords({
  children,
  as: Component = 'p',
  className = '',
  wordClassName = '',
  delay = 0,
  stagger = 0.04,
  duration = 0.7,
  ease = [0.16, 1, 0.3, 1],
  fromY = 50,
  opacity = [0, 1],
  threshold = 0.1,
  rootMargin = '0px',
  once = true,
}: SplitTextRevealWordsProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once, amount: threshold, margin: rootMargin });
  const [splitText, setSplitText] = useState<SplitText | null>(null);
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!ref.current || prefersReducedMotion) return;
    const st = new SplitText(ref.current, { types: 'words' });
    setSplitText(st);
    return () => st.revert();
  }, [prefersReducedMotion]);

  if (prefersReducedMotion || !splitText?.words || splitText.words.length === 0) {
    return <Component ref={ref} className={className}>{children}</Component>;
  }

  return (
    <Component ref={ref} className={className} style={{ overflow: 'hidden' }}>
      <motion.div
        style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', alignItems: 'center' }}
        aria-hidden="true"
      >
        {splitText.words.map((word, i) => (
          <motion.span
            key={i}
            className={wordClassName}
            style={{ overflow: 'hidden', willChange: 'transform, opacity', display: 'inline-block' }}
            initial={{ y: `${fromY}%`, opacity: opacity[0] }}
            animate={isInView ? { y: '0%', opacity: opacity[1] } : { y: `${fromY}%`, opacity: opacity[0] }}
            transition={{
              delay: delay + i * stagger,
              duration,
              ease,
            }}
          >
            {word.textContent}
          </motion.span>
        ))}
      </motion.div>
    </Component>
  );
}