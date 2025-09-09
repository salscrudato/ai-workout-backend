import React, { createContext, useContext, forwardRef, HTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Enhanced Component Composition System
 * 
 * This system provides a flexible, reusable architecture for building
 * complex UI components with consistent styling and behavior.
 * 
 * Features:
 * - Compound component pattern for flexible composition
 * - Context-based state sharing between components
 * - Consistent animation and styling system
 * - Type-safe props with excellent TypeScript support
 * - Accessibility-first design
 */

// Base types for component composition
export interface BaseComponentProps extends HTMLAttributes<HTMLElement> {
  variant?: string;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

// Context for sharing state between composed components
interface CompositionContextValue {
  variant?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
}

const CompositionContext = createContext<CompositionContextValue>({});

export const useComposition = () => useContext(CompositionContext);

// Provider component for composition context
export interface CompositionProviderProps {
  children: React.ReactNode;
  value: CompositionContextValue;
}

export const CompositionProvider: React.FC<CompositionProviderProps> = ({
  children,
  value
}) => (
  <CompositionContext.Provider value={value}>
    {children}
  </CompositionContext.Provider>
);

// Enhanced Container component with animation support
export interface ContainerProps extends BaseComponentProps {
  children: React.ReactNode;
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  direction?: 'row' | 'column';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  glass?: boolean;
  gradient?: boolean;
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(({
  children,
  variant = 'default',
  size = 'md',
  spacing = 'md',
  direction = 'column',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  glass = false,
  gradient = false,
  animate = false,
  disabled = false,
  loading = false,
  className,
  ...props
}, ref) => {
  const spacingStyles = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };

  const directionStyles = {
    row: 'flex-row',
    column: 'flex-col',
  };

  const alignStyles = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  const justifyStyles = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  const containerStyles = clsx(
    'flex',
    directionStyles[direction],
    alignStyles[align],
    justifyStyles[justify],
    spacingStyles[spacing],
    wrap && 'flex-wrap',
    glass && 'bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl',
    gradient && 'bg-gradient-to-br from-blue-50/50 to-cyan-50/50',
    disabled && 'opacity-50 pointer-events-none',
    className
  );

  const contextValue = {
    variant,
    size,
    disabled,
    loading,
  };

  const content = (
    <CompositionProvider value={contextValue}>
      {children}
    </CompositionProvider>
  );

  if (animate) {
    return (
      <motion.div
        ref={ref}
        className={containerStyles}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        {...(props as any)}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <div
      ref={ref}
      className={containerStyles}
      {...props}
    >
      {content}
    </div>
  );
});

Container.displayName = 'Container';

// Enhanced Section component for layout organization
export interface SectionProps extends BaseComponentProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  background?: 'none' | 'subtle' | 'glass' | 'gradient';
}

export const Section = forwardRef<HTMLElement, SectionProps>(({
  children,
  title,
  subtitle,
  headerActions,
  padding = 'md',
  background = 'none',
  animate = false,
  className,
  ...props
}, ref) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12',
  };

  const backgroundStyles = {
    none: '',
    subtle: 'bg-slate-50/50',
    glass: 'bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl',
    gradient: 'bg-gradient-to-br from-blue-50/30 to-cyan-50/30',
  };

  const sectionStyles = clsx(
    paddingStyles[padding],
    backgroundStyles[background],
    className
  );

  const content = (
    <>
      {(title || subtitle || headerActions) && (
        <header className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              {title && (
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-slate-600">
                  {subtitle}
                </p>
              )}
            </div>
            {headerActions && (
              <div className="flex items-center gap-2">
                {headerActions}
              </div>
            )}
          </div>
        </header>
      )}
      {children}
    </>
  );

  if (animate) {
    return (
      <motion.section
        ref={ref}
        className={sectionStyles}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        {...(props as any)}
      >
        {content}
      </motion.section>
    );
  }

  return (
    <section
      ref={ref}
      className={sectionStyles}
      {...props}
    >
      {content}
    </section>
  );
});

Section.displayName = 'Section';

// Enhanced Grid component for responsive layouts
export interface GridProps extends BaseComponentProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  responsive?: {
    sm?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
    md?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
    lg?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
    xl?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  };
}

export const Grid = forwardRef<HTMLDivElement, GridProps>(({
  children,
  cols = 1,
  gap = 'md',
  responsive,
  animate = false,
  className,
  ...props
}, ref) => {
  const gapStyles = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };

  const colsStyles = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    12: 'grid-cols-12',
  };

  const gridStyles = clsx(
    'grid',
    colsStyles[cols],
    gapStyles[gap],
    responsive?.sm && `sm:${colsStyles[responsive.sm]}`,
    responsive?.md && `md:${colsStyles[responsive.md]}`,
    responsive?.lg && `lg:${colsStyles[responsive.lg]}`,
    responsive?.xl && `xl:${colsStyles[responsive.xl]}`,
    className
  );

  if (animate) {
    return (
      <motion.div
        ref={ref}
        className={gridStyles}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, staggerChildren: 0.1 }}
        {...(props as any)}
      >
        {React.Children.map(children, (child, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            {child}
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <div
      ref={ref}
      className={gridStyles}
      {...props}
    >
      {children}
    </div>
  );
});

Grid.displayName = 'Grid';
