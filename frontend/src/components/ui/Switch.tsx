import { forwardRef, type InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  className?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, className, id, disabled, ...props }, ref) => {
    const switchId = id || `switch-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <label className={clsx('inline-flex items-center cursor-pointer', className)}>
        <span className="relative inline-flex flex-shrink-0" aria-hidden="true">
          <input
            type="checkbox"
            id={switchId}
            ref={ref}
            disabled={disabled}
            className={clsx(
              'sr-only peer',
              'appearance-none w-11 h-6 bg-[var(--color-border)] rounded-full peer-focus:ring-4 peer-focus:ring-[var(--color-accent)]/30',
              'peer-checked:after:translate-x-full peer-checked:after:border-white',
              'after:content-[""] after:absolute after:top-0.5 after:left-[2px] after:bg-[var(--color-text)] after:border-[var(--color-border)]',
              'after:border after:rounded-full after:h-5 after:w-5 after:transition-all',
              'peer-checked:bg-[var(--color-accent)] peer-checked:border-[var(--color-accent)]',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            {...props}
          />
        </span>
        {label && (
          <span className={clsx('ml-3 text-sm font-medium text-[var(--color-text)]', disabled && 'opacity-50')}>
            {label}
          </span>
        )}
      </label>
    );
  }
);

Switch.displayName = 'Switch';