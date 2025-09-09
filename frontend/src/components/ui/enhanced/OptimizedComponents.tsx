import React, { createContext, useContext, forwardRef, HTMLAttributes, useMemo, memo } from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Optimized Component System
 * 
 * High-performance, reusable component architecture with:
 * - Memoization for performance optimization
 * - Consistent design tokens
 * - Type-safe composition patterns
 * - Premium visual effects
 * - Mobile-first responsive design
 */

// Performance-optimized base props
export interface OptimizedComponentProps extends HTMLAttributes<HTMLElement> {
  variant?: 'default' | 'premium' | 'glass' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

// Context for component composition
interface ComponentContextValue {
  variant?: string;
  size?: string;
  disabled?: boolean;
  loading?: boolean;
}

const ComponentContext = createContext<ComponentContextValue>({});

export const useComponentContext = () => useContext(ComponentContext);

// Memoized provider for better performance
export const ComponentProvider = memo<{
  children: React.ReactNode;
  value: ComponentContextValue;
}>(({ children, value }) => (
  <ComponentContext.Provider value={value}>
    {children}
  </ComponentContext.Provider>
));

ComponentProvider.displayName = 'ComponentProvider';

// Optimized design tokens (memoized)
export const designTokens = {
  variants: {
    default: 'bg-white border border-neutral-200 shadow-sm',
    premium: 'glass-premium premium-shadow-lg micro-bounce',
    glass: 'glass-tinted premium-shadow gentle-glow',
    gradient: 'gradient-aurora text-white premium-shadow-xl micro-bounce'
  },
  sizes: {
    sm: 'text-sm p-2',
    md: 'text-base p-3',
    lg: 'text-lg p-4',
    xl: 'text-xl p-6'
  },
  animations: {
    fadeIn: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -10 }
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 }
    },
    slideIn: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 }
    }
  }
} as const;

// Optimized base component with memoization
export const OptimizedBox = memo(forwardRef<HTMLDivElement, OptimizedComponentProps>(({
  variant = 'default',
  size = 'md',
  animate = false,
  disabled = false,
  loading = false,
  className,
  children,
  ...props
}, ref) => {
  // Memoize computed styles
  const computedStyles = useMemo(() => clsx(
    'rounded-xl transition-all duration-200',
    designTokens.variants[variant],
    designTokens.sizes[size],
    {
      'opacity-50 pointer-events-none': disabled,
      'animate-pulse': loading
    },
    className
  ), [variant, size, disabled, loading, className]);

  const contextValue = useMemo(() => ({
    variant,
    size,
    disabled,
    loading
  }), [variant, size, disabled, loading]);

  const content = (
    <ComponentProvider value={contextValue}>
      {children}
    </ComponentProvider>
  );

  if (animate) {
    return (
      <motion.div
        ref={ref}
        className={computedStyles}
        variants={designTokens.animations.fadeIn}
        initial="initial"
        animate="animate"
        exit="exit"
        {...(props as any)}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <div
      ref={ref}
      className={computedStyles}
      {...props}
    >
      {content}
    </div>
  );
}));

OptimizedBox.displayName = 'OptimizedBox';

// Optimized flex container
export const FlexContainer = memo(forwardRef<HTMLDivElement, OptimizedComponentProps & {
  direction?: 'row' | 'column';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: 'sm' | 'md' | 'lg';
  wrap?: boolean;
}>(({
  direction = 'column',
  align = 'stretch',
  justify = 'start',
  gap = 'md',
  wrap = false,
  className,
  children,
  ...props
}, ref) => {
  const flexStyles = useMemo(() => clsx(
    'flex',
    {
      'flex-row': direction === 'row',
      'flex-col': direction === 'column',
      'items-start': align === 'start',
      'items-center': align === 'center',
      'items-end': align === 'end',
      'items-stretch': align === 'stretch',
      'justify-start': justify === 'start',
      'justify-center': justify === 'center',
      'justify-end': justify === 'end',
      'justify-between': justify === 'between',
      'justify-around': justify === 'around',
      'justify-evenly': justify === 'evenly',
      'gap-2': gap === 'sm',
      'gap-4': gap === 'md',
      'gap-6': gap === 'lg',
      'flex-wrap': wrap
    },
    className
  ), [direction, align, justify, gap, wrap, className]);

  return (
    <OptimizedBox
      ref={ref}
      className={flexStyles}
      {...props}
    >
      {children}
    </OptimizedBox>
  );
}));

FlexContainer.displayName = 'FlexContainer';

// Optimized grid container
export const GridContainer = memo(forwardRef<HTMLDivElement, OptimizedComponentProps & {
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'sm' | 'md' | 'lg';
  responsive?: boolean;
}>(({
  cols = 1,
  gap = 'md',
  responsive = true,
  className,
  children,
  ...props
}, ref) => {
  const gridStyles = useMemo(() => clsx(
    'grid',
    {
      'grid-cols-1': cols === 1,
      'grid-cols-2': cols === 2,
      'grid-cols-3': cols === 3,
      'grid-cols-4': cols === 4,
      'grid-cols-6': cols === 6,
      'grid-cols-12': cols === 12,
      'gap-2': gap === 'sm',
      'gap-4': gap === 'md',
      'gap-6': gap === 'lg',
      // Responsive grid patterns
      'sm:grid-cols-2 lg:grid-cols-3': responsive && cols === 1,
      'sm:grid-cols-3 lg:grid-cols-4': responsive && cols === 2,
      'sm:grid-cols-4 lg:grid-cols-6': responsive && cols === 3,
    },
    className
  ), [cols, gap, responsive, className]);

  return (
    <OptimizedBox
      ref={ref}
      className={gridStyles}
      {...props}
    >
      {children}
    </OptimizedBox>
  );
}));

GridContainer.displayName = 'GridContainer';

// Optimized text component
export const OptimizedText = memo(forwardRef<HTMLElement, OptimizedComponentProps & {
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'default' | 'muted' | 'primary' | 'success' | 'warning' | 'error';
}>(({
  as: Component = 'p',
  weight = 'normal',
  color = 'default',
  className,
  children,
  ...props
}, ref) => {
  const textStyles = useMemo(() => clsx(
    {
      'font-normal': weight === 'normal',
      'font-medium': weight === 'medium',
      'font-semibold': weight === 'semibold',
      'font-bold': weight === 'bold',
      'text-neutral-900': color === 'default',
      'text-neutral-600': color === 'muted',
      'text-primary-600': color === 'primary',
      'text-success-600': color === 'success',
      'text-warning-600': color === 'warning',
      'text-error-600': color === 'error',
    },
    className
  ), [weight, color, className]);

  return (
    <Component
      ref={ref as any}
      className={textStyles}
      {...props}
    >
      {children}
    </Component>
  );
}));

OptimizedText.displayName = 'OptimizedText';

// Performance monitoring hook
export const usePerformanceMonitor = (componentName: string) => {
  React.useEffect(() => {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} render time: ${endTime - startTime}ms`);
      }
    };
  });
};
