import { forwardRef, HTMLAttributes } from 'react';
import { clsx } from 'clsx';

export type TextSize = 'body-lg' | 'body' | 'body-sm' | 'caption' | 'caption-sm';
export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';
export type TextColor = 'primary' | 'muted' | 'subtle' | 'accent' | 'inverse';
export type TextAlign = 'left' | 'center' | 'right';
export type TextAs = 'p' | 'span' | 'div' | 'li' | 'dt' | 'dd' | 'figcaption' | 'address' | 'blockquote' | 'cite' | 'code' | 'pre' | 'small';

interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: TextAs;
  size?: TextSize;
  weight?: TextWeight;
  color?: TextColor;
  align?: TextAlign;
  gradient?: boolean;
  mono?: boolean;
  clamp?: number;
  balance?: boolean;
  children: React.ReactNode;
}

const sizeClasses: Record<TextSize, string> = {
  'body-lg': 'text-body-lg',
  'body': 'text-body',
  'body-sm': 'text-body-sm',
  'caption': 'text-caption',
  'caption-sm': 'text-caption-sm',
};

const weightClasses: Record<TextWeight, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const colorClasses: Record<TextColor, string> = {
  primary: 'text-primary',
  muted: 'text-muted',
  subtle: 'text-subtle',
  accent: 'text-accent',
  inverse: 'text-inverse',
};

const alignClasses: Record<TextAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const asElementMap: Record<TextAs, React.ElementType> = {
  p: 'p',
  span: 'span',
  div: 'div',
  li: 'li',
  dt: 'dt',
  dd: 'dd',
  figcaption: 'figcaption',
  address: 'address',
  blockquote: 'blockquote',
  cite: 'cite',
  code: 'code',
  pre: 'pre',
  small: 'small',
};

export const Text = forwardRef<HTMLElement, TextProps>(
  ({ as: As = 'p', size = 'body', weight = 'normal', color = 'primary', align = 'left', gradient = false, mono = false, clamp, balance = false, className, children, ...props }, ref) => {
    const Component = asElementMap[As] || 'p';

    return (
      <Component
        ref={ref}
        className={clsx(
          sizeClasses[size],
          weightClasses[weight],
          colorClasses[color],
          alignClasses[align],
          gradient && 'text-gradient-accent',
          mono && 'text-mono',
          clamp && `line-clamp-${clamp}`,
          balance && 'text-balance',
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Text.displayName = 'Text';