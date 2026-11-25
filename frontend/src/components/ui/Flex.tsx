import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

export type FlexDirection = 'row' | 'col' | 'row-reverse' | 'col-reverse';
export type FlexAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type FlexJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
export type FlexGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type FlexWrap = 'wrap' | 'nowrap' | 'wrap-reverse';

interface FlexProps extends HTMLAttributes<HTMLDivElement> {
  direction?: FlexDirection | { base?: FlexDirection; sm?: FlexDirection; md?: FlexDirection; lg?: FlexDirection; xl?: FlexDirection };
  align?: FlexAlign | { base?: FlexAlign; sm?: FlexAlign; md?: FlexAlign; lg?: FlexAlign; xl?: FlexAlign };
  justify?: FlexJustify | { base?: FlexJustify; sm?: FlexJustify; md?: FlexJustify; lg?: FlexJustify; xl?: FlexJustify };
  gap?: FlexGap | { base?: FlexGap; sm?: FlexGap; md?: FlexGap; lg?: FlexGap; xl?: FlexGap };
  wrap?: FlexWrap;
  grow?: boolean | number;
  shrink?: boolean | number;
  basis?: string;
  as?: React.ElementType;
  children: ReactNode;
}

const directionClasses: Record<FlexDirection, string> = {
  row: 'flex-row',
  col: 'flex-col',
  'row-reverse': 'flex-row-reverse',
  'col-reverse': 'flex-col-reverse',
};

const alignClasses: Record<FlexAlign, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

const justifyClasses: Record<FlexJustify, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

const gapClasses: Record<FlexGap, string> = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
  '2xl': 'gap-12',
};

const wrapClasses: Record<FlexWrap, string> = {
  wrap: 'flex-wrap',
  nowrap: 'flex-nowrap',
  'wrap-reverse': 'flex-wrap-reverse',
};

const getResponsiveClasses = (
  value: FlexProps['direction'] | FlexProps['align'] | FlexProps['justify'] | FlexProps['gap'],
  classMap: Record<string, string>,
  prefix = ''
): string => {
  if (!value) return '';
  if (typeof value === 'string') return classMap[value] || '';
  const parts: string[] = [];
  if (value.base) parts.push(`${prefix}${classMap[value.base]}`);
  if (value.sm) parts.push(`sm:${prefix}${classMap[value.sm]}`);
  if (value.md) parts.push(`md:${prefix}${classMap[value.md]}`);
  if (value.lg) parts.push(`lg:${prefix}${classMap[value.lg]}`);
  if (value.xl) parts.push(`xl:${prefix}${classMap[value.xl]}`);
  return parts.join(' ');
};

export const Flex = forwardRef<HTMLDivElement, FlexProps>(
  ({
    direction = 'row',
    align = 'stretch',
    justify = 'start',
    gap = 'md',
    wrap,
    grow,
    shrink,
    basis,
    as: Component = 'div',
    className,
    children,
    ...props
  }, ref) => {
    const flexStyle: React.CSSProperties = {};
    if (grow !== undefined) flexStyle.flexGrow = typeof grow === 'boolean' ? (grow ? 1 : 0) : grow;
    if (shrink !== undefined) flexStyle.flexShrink = typeof shrink === 'boolean' ? (shrink ? 1 : 0) : shrink;
    if (basis) flexStyle.flexBasis = basis;

    return (
      <Component
        ref={ref}
        className={clsx(
          'flex',
          getResponsiveClasses(direction, directionClasses, 'flex-'),
          getResponsiveClasses(align, alignClasses, 'items-'),
          getResponsiveClasses(justify, justifyClasses, 'justify-'),
          getResponsiveClasses(gap, gapClasses, 'gap-'),
          wrap && wrapClasses[wrap],
          className
        )}
        style={Object.keys(flexStyle).length > 0 ? flexStyle : undefined}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Flex.displayName = 'Flex';