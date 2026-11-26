import { forwardRef, ButtonHTMLAttributes, isValidElement, cloneElement, Children } from 'react';
import { clsx } from 'clsx';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  asChild?: boolean;
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
      asChild = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles: Record<ButtonVariant, string> = {
      primary: 'bg-[var(--color-accent)] text-[var(--color-text-inverse)] hover:bg-[var(--color-accent-hover)] focus-visible:ring-[var(--color-accent)] shadow-lg shadow-[var(--color-accent)]/25 hover:shadow-[var(--color-accent)]/35',
      secondary: 'glass text-[var(--color-text)] border-[var(--glass-border)] hover:bg-[var(--glass-bg-strong)] hover:border-[var(--glass-border-hover)] focus-visible:ring-[var(--color-text-muted)]',
      outline: 'border-2 border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-muted)] focus-visible:ring-[var(--color-accent)]',
      danger: 'bg-[var(--color-gray-800)] text-[var(--color-text)] border-[var(--color-border)] hover:bg-[var(--color-gray-700)] hover:border-[var(--color-border-hover)] focus-visible:ring-[var(--color-text-muted)]',
      ghost: 'bg-transparent border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--glass-bg)] focus-visible:ring-[var(--color-text-muted)]',
    };

    const sizeStyles: Record<ButtonSize, string> = {
      sm: 'px-3 py-2 text-sm gap-1.5',
      md: 'px-5 py-3 text-base gap-2',
      lg: 'px-7 py-4 text-lg gap-2.5',
      xl: 'px-10 py-5 text-xl gap-3',
    };

    const widthStyles = fullWidth ? 'w-full' : '';

    const loadingSpinner = (
      <svg
        className="animate-spin h-4 w-4 sm:h-5 sm:w-5"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    const buttonContent = (
      <>
        {loading ? loadingSpinner : leftIcon}
        {children}
        {!loading && rightIcon}
      </>
    );

    // When asChild is true, we need to ensure only one child is passed to Slot
    // Clone the single child element and inject the necessary props
    if (asChild) {
      const childArray = Children.toArray(children);
      if (childArray.length !== 1) {
        // Fallback: render as regular button if not exactly one child
        return (
          <button
            ref={ref}
            className={clsx(baseStyles, variantStyles[variant], sizeStyles[size], widthStyles, className)}
            disabled={disabled || loading}
            aria-busy={loading}
            {...props}
          >
            {buttonContent}
          </button>
        );
      }

      const child = childArray[0];
      if (!isValidElement(child)) {
        return <>{child}</>;
      }

      // Clone the child element and merge props
      const childProps = child.props as Record<string, unknown>;
      const mergedClassName = clsx(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        widthStyles,
        className,
        childProps.className as string | undefined
      );

      return cloneElement(child as React.ReactElement, {
        ref,
        className: mergedClassName,
        disabled: disabled || loading,
        'aria-busy': loading,
        ...props,
        ...childProps,
      });
    }

    return (
      <button
        ref={ref}
        className={clsx(baseStyles, variantStyles[variant], sizeStyles[size], widthStyles, className)}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {buttonContent}
      </button>
    );
  }
);

Button.displayName = 'Button';