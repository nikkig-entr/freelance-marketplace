'use client';

import { forwardRef, ButtonHTMLAttributes, useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { clsx } from 'clsx';

export type MagneticButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type MagneticButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface MagneticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: MagneticButtonVariant;
  size?: MagneticButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  asChild?: boolean;
  magneticStrength?: number;
  cursorLabel?: string;
}

const variantStyles: Record<MagneticButtonVariant, string> = {
  primary: 'bg-gold text-obsidian hover:bg-gold-400 focus:ring-gold shadow-lg shadow-gold/20 hover:shadow-gold/30',
  secondary: 'glass text-cream border-glass-border hover:bg-glass-strong hover:border-glass-border-hover focus:ring-muted',
  outline: 'border-2 border-glass-border text-cream hover:border-gold hover:bg-gold/10 focus:ring-gold',
  ghost: 'bg-transparent border-transparent text-muted hover:text-cream hover:bg-glass focus:ring-muted',
};

const sizeStyles: Record<MagneticButtonSize, string> = {
  sm: 'px-4 py-2.5 text-sm gap-1.5',
  md: 'px-6 py-3 text-base gap-2',
  lg: 'px-8 py-4 text-lg gap-2.5',
  xl: 'px-10 py-5 text-xl gap-3',
};

export const MagneticButton = forwardRef<HTMLButtonElement, MagneticButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      asChild = false,
      className,
      children,
      magneticStrength = 0.35,
      cursorLabel,
      ...props
    },
    ref
  ) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const scale = useMotionValue(1);
    const rotate = useMotionValue(0);

    const springConfig = { stiffness: 300, damping: 30, mass: 0.8 };

    const sx = useSpring(x, springConfig);
    const sy = useSpring(y, springConfig);
    const sScale = useSpring(scale, { stiffness: 400, damping: 35 });
    const sRotate = useSpring(rotate, { stiffness: 300, damping: 30 });

    const transform = useTransform([sx, sy, sScale, sRotate], ([x, y, s, r]) => `translate(${x}px, ${y}px) scale(${s}) rotate(${r}deg)`);

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) * magneticStrength;
      const deltaY = (e.clientY - centerY) * magneticStrength;
      x.set(deltaX);
      y.set(deltaY);
      rotate.set((deltaX / rect.width) * 3);
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseLeave = () => {
      x.set(0);
      y.set(0);
      rotate.set(0);
    };

    const handleMouseDown = () => {
      scale.set(0.96);
    };

    const handleMouseUp = () => {
      scale.set(1);
    };

    const handleFocus = () => {
      scale.set(1.02);
    };

    const handleBlur = () => {
      scale.set(1);
    };

    useEffect(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        x.set(0);
        y.set(0);
        rotate.set(0);
        scale.set(1);
      }
    }, []);

    const baseStyles =
      'relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian disabled:opacity-50 disabled:cursor-not-allowed overflow-visible z-10';
    const widthStyles = fullWidth ? 'w-full' : '';

    const loadingSpinner = (
      <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    );

    const buttonContent = (
      <>
        {loading ? loadingSpinner : leftIcon}
        {children}
        {!loading && rightIcon}
      </>
    );

    const mergedRef = (el: HTMLButtonElement | null) => {
      buttonRef.current = el;
      if (ref) {
        if (typeof ref === 'function') ref(el);
        else ref.current = el;
      }
    };

    return (
      <motion.button
        ref={mergedRef}
        className={clsx(baseStyles, variantStyles[variant], sizeStyles[size], widthStyles, className)}
        disabled={disabled || loading}
        aria-busy={loading}
        style={{ transform, willChange: 'transform' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {buttonContent}
        {cursorLabel && isHovered && !disabled && !loading && (
          <motion.span
            className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-gold bg-obsidian/90 border border-glass-border rounded whitespace-nowrap shadow-glass-strong backdrop-blur-xl"
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.9 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ pointerEvents: 'none' }}
          >
            {cursorLabel}
          </motion.span>
        )}
      </motion.button>
    );
  }
);

MagneticButton.displayName = 'MagneticButton';

export function MagneticLink({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  cursorLabel,
  magneticStrength = 0.35,
  ...props
}: Omit<MagneticButtonProps, 'loading' | 'disabled' | 'asChild' | 'fullWidth' | 'leftIcon' | 'rightIcon'> & { asChild?: boolean }) {
  const Component = props.asChild ? 'span' : 'a';
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const linkRef = useRef<HTMLAnchorElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const rotate = useMotionValue(0);

  const springConfig = { stiffness: 300, damping: 30, mass: 0.8 };

  const sx = useSpring(x, springConfig);
  const sy = useSpring(y, springConfig);
  const sScale = useSpring(scale, { stiffness: 400, damping: 35 });
  const sRotate = useSpring(rotate, { stiffness: 300, damping: 30 });

  const transform = useTransform([sx, sy, sScale, sRotate], ([x, y, s, r]) => `translate(${x}px, ${y}px) scale(${s}) rotate(${r}deg)`);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!linkRef.current) return;
    const rect = linkRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) * magneticStrength;
    const deltaY = (e.clientY - centerY) * magneticStrength;
    x.set(deltaX);
    y.set(deltaY);
    rotate.set((deltaX / rect.width) * 3);
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    rotate.set(0);
  };

  const handleMouseDown = () => scale.set(0.96);
  const handleMouseUp = () => scale.set(1);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      x.set(0); y.set(0); rotate.set(0); scale.set(1);
    }
  }, []);

  return (
    <motion.a
      ref={linkRef}
      className={clsx(
        'relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian overflow-visible z-10',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      style={{ transform, willChange: 'transform' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {children}
      {cursorLabel && isHovered && (
        <motion.span
          className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-gold bg-obsidian/90 border border-glass-border rounded whitespace-nowrap shadow-glass-strong backdrop-blur-xl"
          initial={{ opacity: 0, y: 8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.9 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ pointerEvents: 'none' }}
        >
          {cursorLabel}
        </motion.span>
      )}
    </motion.a>
  );
}