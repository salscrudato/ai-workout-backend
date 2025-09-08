import React from 'react';
import { clsx } from 'clsx';

/**
 * Premium Layout System for Sophisticated Information Architecture
 * 
 * Features:
 * - Mathematical spacing progression based on golden ratio
 * - Responsive grid system with content-aware breakpoints
 * - Semantic layout components for better accessibility
 * - Advanced content density controls
 * - Mobile-first responsive design patterns
 */

// Layout spacing types based on content hierarchy
export type SpacingScale = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
export type ContentDensity = 'compact' | 'comfortable' | 'spacious' | 'luxurious';
export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 8 | 12;

// Sophisticated spacing system based on mathematical progression
const spacingMap: Record<SpacingScale, string> = {
  xs: 'space-y-2 sm:space-y-3',      // 8px -> 12px
  sm: 'space-y-3 sm:space-y-4',      // 12px -> 16px
  md: 'space-y-4 sm:space-y-6',      // 16px -> 24px
  lg: 'space-y-6 sm:space-y-8',      // 24px -> 32px
  xl: 'space-y-8 sm:space-y-12',     // 32px -> 48px
  '2xl': 'space-y-12 sm:space-y-16', // 48px -> 64px
  '3xl': 'space-y-16 sm:space-y-24', // 64px -> 96px
  '4xl': 'space-y-24 sm:space-y-32', // 96px -> 128px
};

// Content density variations for different use cases
const densityMap: Record<ContentDensity, string> = {
  compact: 'space-y-2 sm:space-y-3',
  comfortable: 'space-y-4 sm:space-y-6',
  spacious: 'space-y-6 sm:space-y-8',
  luxurious: 'space-y-8 sm:space-y-12',
};

// Responsive grid system with content-aware breakpoints
const gridMap: Record<GridColumns, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
  6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  8: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8',
  12: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12',
};

// Container component for consistent page layouts
export interface ContainerProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: SpacingScale;
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  size = 'lg',
  padding = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  };

  const paddingClasses = {
    xs: 'px-4 sm:px-6',
    sm: 'px-4 sm:px-6',
    md: 'px-4 sm:px-6 lg:px-8',
    lg: 'px-6 sm:px-8 lg:px-12',
    xl: 'px-8 sm:px-12 lg:px-16',
    '2xl': 'px-12 sm:px-16 lg:px-24',
    '3xl': 'px-16 sm:px-24 lg:px-32',
    '4xl': 'px-24 sm:px-32 lg:px-48',
  };

  return (
    <div
      className={clsx(
        'mx-auto w-full',
        sizeClasses[size],
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
};

// Stack component for vertical layouts with sophisticated spacing
export interface StackProps {
  children: React.ReactNode;
  spacing?: SpacingScale;
  density?: ContentDensity;
  align?: 'start' | 'center' | 'end' | 'stretch';
  className?: string;
}

export const Stack: React.FC<StackProps> = ({
  children,
  spacing = 'md',
  density,
  align = 'stretch',
  className,
}) => {
  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  const spacingClass = density ? densityMap[density] : spacingMap[spacing];

  return (
    <div
      className={clsx(
        'flex flex-col',
        spacingClass,
        alignClasses[align],
        className
      )}
    >
      {children}
    </div>
  );
};

// Grid component for responsive layouts
export interface GridProps {
  children: React.ReactNode;
  columns?: GridColumns;
  gap?: SpacingScale;
  className?: string;
}

export const Grid: React.FC<GridProps> = ({
  children,
  columns = 3,
  gap = 'md',
  className,
}) => {
  const gapClasses = {
    xs: 'gap-2 sm:gap-3',
    sm: 'gap-3 sm:gap-4',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8',
    xl: 'gap-8 sm:gap-12',
    '2xl': 'gap-12 sm:gap-16',
    '3xl': 'gap-16 sm:gap-24',
    '4xl': 'gap-24 sm:gap-32',
  };

  return (
    <div
      className={clsx(
        'grid',
        gridMap[columns],
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
};

// Section component for semantic page structure
export interface SectionProps {
  children: React.ReactNode;
  spacing?: SpacingScale;
  background?: 'none' | 'subtle' | 'elevated' | 'premium';
  className?: string;
}

export const Section: React.FC<SectionProps> = ({
  children,
  spacing = 'xl',
  background = 'none',
  className,
}) => {
  const backgroundClasses = {
    none: '',
    subtle: 'bg-slate-50/50',
    elevated: 'bg-white shadow-sm border border-slate-100',
    premium: 'bg-gradient-to-br from-white to-slate-50/30 shadow-lg border border-slate-200/50',
  };

  const spacingClass = spacingMap[spacing];

  return (
    <section
      className={clsx(
        'py-8 sm:py-12 lg:py-16',
        backgroundClasses[background],
        className
      )}
    >
      <div className={spacingClass}>
        {children}
      </div>
    </section>
  );
};

// Flex component for horizontal layouts
export interface FlexProps {
  children: React.ReactNode;
  direction?: 'row' | 'col';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  gap?: SpacingScale;
  className?: string;
}

export const Flex: React.FC<FlexProps> = ({
  children,
  direction = 'row',
  align = 'center',
  justify = 'start',
  wrap = false,
  gap = 'md',
  className,
}) => {
  const directionClasses = {
    row: 'flex-row',
    col: 'flex-col',
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  const gapClasses = {
    xs: 'gap-2',
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
    '2xl': 'gap-12',
    '3xl': 'gap-16',
    '4xl': 'gap-24',
  };

  return (
    <div
      className={clsx(
        'flex',
        directionClasses[direction],
        alignClasses[align],
        justifyClasses[justify],
        wrap && 'flex-wrap',
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
};

// Content area component for optimal reading experience
export interface ContentAreaProps {
  children: React.ReactNode;
  width?: 'narrow' | 'medium' | 'wide' | 'full';
  className?: string;
}

export const ContentArea: React.FC<ContentAreaProps> = ({
  children,
  width = 'medium',
  className,
}) => {
  const widthClasses = {
    narrow: 'max-w-2xl',    // ~65 characters per line
    medium: 'max-w-4xl',    // ~75 characters per line
    wide: 'max-w-6xl',      // ~85 characters per line
    full: 'max-w-full',
  };

  return (
    <div
      className={clsx(
        'mx-auto',
        widthClasses[width],
        className
      )}
    >
      {children}
    </div>
  );
};
