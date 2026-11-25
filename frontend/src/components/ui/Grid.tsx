import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 12 | 'auto-fit' | 'auto-fill';
export type GridGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type GridFlow = 'row' | 'col' | 'dense' | 'row-dense' | 'col-dense';

interface ResponsiveColumns {
  base?: GridColumns;
  sm?: GridColumns;
  md?: GridColumns;
  lg?: GridColumns;
  xl?: GridColumns;
}

type GridColumnsInput = GridColumns | ResponsiveColumns;

interface GridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: GridColumnsInput;
  gap?: GridGap;
  flow?: GridFlow;
  as?: React.ElementType;
  children: ReactNode;
}

const gapClasses: Record<GridGap, string> = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
  '2xl': 'gap-12',
};

const flowClasses: Record<GridFlow, string> = {
  row: 'grid-flow-row',
  col: 'grid-flow-col',
  dense: 'grid-flow-dense',
  'row-dense': 'grid-flow-row-dense',
  'col-dense': 'grid-flow-col-dense',
};

const getColumnClasses = (columns: GridProps['columns']): string => {
  if (!columns) return 'grid-cols-1';

  // Check if it's a simple value (number or string like 'auto-fit')
  if (typeof columns === 'number' || ['auto-fit', 'auto-fill'].includes(columns as string)) {
    const colMap: Record<string, string> = {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
      12: 'grid-cols-12',
      'auto-fit': 'grid-auto-fit',
      'auto-fill': 'grid-auto-fill',
    };
    return colMap[columns as string] || 'grid-cols-1';
  }

  // It's a responsive object
  const responsiveColumns = columns as ResponsiveColumns;
  const parts: string[] = [];

  const formatCol = (col: GridColumns | undefined) => {
    if (!col) return '';
    if (typeof col === 'number') return `grid-cols-${col}`;
    return col === 'auto-fit' || col === 'auto-fill' ? col : `grid-cols-${col}`;
  };

  if (responsiveColumns.base) parts.push(formatCol(responsiveColumns.base));
  if (responsiveColumns.sm) parts.push(`sm:${formatCol(responsiveColumns.sm)}`);
  if (responsiveColumns.md) parts.push(`md:${formatCol(responsiveColumns.md)}`);
  if (responsiveColumns.lg) parts.push(`lg:${formatCol(responsiveColumns.lg)}`);
  if (responsiveColumns.xl) parts.push(`xl:${formatCol(responsiveColumns.xl)}`);

  return parts.join(' ') || 'grid-cols-1';
};

export const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({ columns = 1, gap = 'md', flow = 'row', as: Component = 'div', className, children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={clsx(
          'grid',
          getColumnClasses(columns),
          gapClasses[gap],
          flowClasses[flow],
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Grid.displayName = 'Grid';