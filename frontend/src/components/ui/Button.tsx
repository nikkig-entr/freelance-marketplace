import { forwardRef, ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-obsidian disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
      primary: 'bg-amber text-obsidian hover:bg-amber-400 focus:ring-amber/50 shadow-lg shadow-amber/25 hover:shadow-amber-glow',
      secondary: 'bg-white/[0.05] text-cream border border-white/[0.1] hover:bg-white/[0.08] hover:border-white/[0.2] focus:ring-white/20',
      outline: 'border-2 border-white/[0.15] text-cream hover:bg-white/[0.05] hover:border-amber/50 focus:ring-amber/30',
      danger: 'bg-danger-500 text-white hover:bg-danger-600 focus:ring-danger-500/50',
      ghost: 'text-muted hover:text-cream hover:bg-white/[0.03] focus:ring-white/10',
    };

    const sizeStyles = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-5 py-3 text-base',
      lg: 'px-7 py-4 text-lg',
      xl: 'px-10 py-5 text-xl',
    };

    const widthStyles = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        className={clsx(baseStyles, variantStyles[variant], sizeStyles[size], widthStyles, className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';