'use client';

import { useRef, useState, MouseEvent } from 'react';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  strength?: number;
}

export function MagneticButton({
  children,
  className = '',
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  type = 'button',
  leftIcon,
  rightIcon,
  strength = 0.3,
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current || disabled) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setPosition({ x: x * strength, y: y * strength });
  };

  const handleMouseEnter = () => {
    if (disabled) return;
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    if (disabled) return;
    setPosition({ x: 0, y: 0 });
    setIsHovering(false);
  };

  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
  };

  const sizeClasses = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
    xl: 'btn-xl',
  };

  return (
    <button
      ref={buttonRef}
      type={type}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
      className={`
        relative overflow-hidden
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      style={{
        transform: isHovering ? `translate(${position.x}px, ${position.y}px)` : 'translate(0, 0)',
        transition: isHovering ? 'transform 0.15s ease-out' : 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
      }}
      aria-disabled={disabled}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {leftIcon && <span className="flex-shrink-0" aria-hidden="true">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="flex-shrink-0" aria-hidden="true">{rightIcon}</span>}
      </span>
      <span
        className="absolute inset-0 bg-[var(--color-white)]/10 opacity-0 transition-opacity duration-300 pointer-events-none"
        aria-hidden="true"
      />
    </button>
  );
}

export { MagneticButton as default };