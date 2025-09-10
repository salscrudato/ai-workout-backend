import React, { createContext, useContext, forwardRef } from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

/**
 * Modern Component Composition System
 * 
 * Provides a flexible, composable architecture for building complex UI components
 * following modern React patterns and design system principles.
 */

// Base Container Component
export interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  center?: boolean;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className,
  maxWidth = 'lg',
  padding = 'md',
  center = true,
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  const paddingClasses = {
    none: '',
    sm: 'px-4 py-2',
    md: 'px-4 sm:px-6 lg:px-8 py-4 sm:py-6',
    lg: 'px-6 sm:px-8 lg:px-12 py-6 sm:py-8',
    xl: 'px-8 sm:px-12 lg:px-16 py-8 sm:py-12',
  };

  return (
    <div
      className={clsx(
        'w-full',
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        center && 'mx-auto',
        className
      )}
    >
      {children}
    </div>
  );
};

// Flexible Stack Component
export interface StackProps {
  children: React.ReactNode;
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  className?: string;
}

export const Stack: React.FC<StackProps> = ({
  children,
  direction = 'column',
  spacing = 'md',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  className,
}) => {
  const directionClasses = {
    row: 'flex-row',
    column: 'flex-col',
    'row-reverse': 'flex-row-reverse',
    'column-reverse': 'flex-col-reverse',
  };

  const spacingClasses = {
    none: 'gap-0',
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
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

  return (
    <div
      className={clsx(
        'flex',
        directionClasses[direction],
        spacingClasses[spacing],
        alignClasses[align],
        justifyClasses[justify],
        wrap && 'flex-wrap',
        className
      )}
    >
      {children}
    </div>
  );
};

// Card Composition System
const CardContext = createContext<{
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  size?: 'sm' | 'md' | 'lg';
}>({});

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  size = 'md',
  interactive = false,
  className,
  onClick,
}) => {
  const variantClasses = {
    default: 'bg-white border border-neutral-200 shadow-sm',
    elevated: 'bg-white shadow-lg hover:shadow-xl',
    outlined: 'bg-transparent border-2 border-neutral-300',
    glass: 'glass-premium',
  };

  const sizeClasses = {
    sm: 'p-4 rounded-lg',
    md: 'p-6 rounded-xl',
    lg: 'p-8 rounded-2xl',
  };

  const Component = interactive ? motion.div : 'div';
  const motionProps = interactive
    ? {
        whileHover: { scale: 1.02, y: -2 },
        whileTap: { scale: 0.98 },
        transition: { duration: 0.2 },
      }
    : {};

  return (
    <CardContext.Provider value={{ variant, size }}>
      <Component
        className={clsx(
          'transition-all duration-300',
          variantClasses[variant],
          sizeClasses[size],
          interactive && 'cursor-pointer touch-target',
          className
        )}
        onClick={onClick}
        {...motionProps}
      >
        {children}
      </Component>
    </CardContext.Provider>
  );
};

export const CardHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div className={clsx('mb-4 pb-4 border-b border-neutral-200/50', className)}>
      {children}
    </div>
  );
};

export const CardBody: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return <div className={clsx('flex-1', className)}>{children}</div>;
};

export const CardFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div className={clsx('mt-4 pt-4 border-t border-neutral-200/50', className)}>
      {children}
    </div>
  );
};

// Grid System
export interface GridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  responsive?: {
    sm?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
    md?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
    lg?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
    xl?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  };
  className?: string;
}

export const Grid: React.FC<GridProps> = ({
  children,
  cols = 1,
  gap = 'md',
  responsive,
  className,
}) => {
  const colsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    12: 'grid-cols-12',
  };

  const gapClasses = {
    none: 'gap-0',
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };

  const responsiveClasses = responsive
    ? [
        responsive.sm && `sm:grid-cols-${responsive.sm}`,
        responsive.md && `md:grid-cols-${responsive.md}`,
        responsive.lg && `lg:grid-cols-${responsive.lg}`,
        responsive.xl && `xl:grid-cols-${responsive.xl}`,
      ].filter(Boolean)
    : [];

  return (
    <div
      className={clsx(
        'grid',
        colsClasses[cols],
        gapClasses[gap],
        ...responsiveClasses,
        className
      )}
    >
      {children}
    </div>
  );
};

// Section Component
export interface SectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Section: React.FC<SectionProps> = ({
  children,
  title,
  subtitle,
  headerAction,
  spacing = 'lg',
  className,
}) => {
  const spacingClasses = {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16',
    xl: 'py-24',
  };

  return (
    <section className={clsx(spacingClasses[spacing], className)}>
      {(title || subtitle || headerAction) && (
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              {title && (
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text-primary mb-2">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-neutral-600 text-base sm:text-lg max-w-2xl">
                  {subtitle}
                </p>
              )}
            </div>
            {headerAction && <div className="flex-shrink-0">{headerAction}</div>}
          </div>
        </div>
      )}
      {children}
    </section>
  );
};

// Export compound components
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
