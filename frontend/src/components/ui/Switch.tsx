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
              'appearance-none w-11 h-6 bg-secondary-300 rounded-full peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800',
              'peer-checked:after:translate-x-full peer-checked:after:border-white',
              'after:content-[""] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300',
              'after:border after:rounded-full after:h-5 after:w-5 after:transition-all',
              'peer-checked:bg-primary-600 peer-checked:border-primary-600',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            {...props}
          />
        </span>
        {label && (
          <span className={clsx('ml-3 text-sm font-medium text-secondary-900', disabled && 'opacity-50')}>
            {label}
          </span>
        )}
      </label>
    );
  }
);

Switch.displayName = 'Switch';