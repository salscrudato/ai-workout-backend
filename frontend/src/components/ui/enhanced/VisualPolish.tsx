import React from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

/**
 * Visual Polish Components
 * 
 * Provides consistent visual design elements including:
 * - Sophisticated shadows and lighting effects
 * - Gradient backgrounds and overlays
 * - Glass morphism effects
 * - Consistent spacing and typography
 * - Premium visual hierarchy
 * - Smooth transitions and micro-interactions
 */

// Enhanced shadow system with multiple depth levels
export const shadowStyles = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
  glow: 'shadow-lg shadow-blue-500/25',
  'glow-intense': 'shadow-xl shadow-blue-500/40',
  'glow-cyan': 'shadow-lg shadow-cyan-500/25',
  'glow-purple': 'shadow-lg shadow-purple-500/25',
  inner: 'shadow-inner',
} as const;

// Premium gradient backgrounds
export const gradientStyles = {
  'blue-light': 'bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100',
  'blue-medium': 'bg-gradient-to-br from-blue-100 via-cyan-100 to-blue-200',
  'blue-dark': 'bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700',
  'slate-light': 'bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100',
  'slate-dark': 'bg-gradient-to-br from-slate-800 via-gray-800 to-slate-900',
  'premium': 'bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600',
  'premium-light': 'bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50',
  'glass': 'bg-gradient-to-br from-white/80 via-white/60 to-white/40',
  'glass-dark': 'bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/40',
} as const;

// Glass morphism effect component
export interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'light' | 'medium' | 'strong';
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  border?: boolean;
  shadow?: keyof typeof shadowStyles;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  intensity = 'medium',
  blur = 'md',
  border = true,
  shadow = 'lg',
}) => {
  const intensityStyles = {
    light: 'bg-white/60 backdrop-blur-sm',
    medium: 'bg-white/80 backdrop-blur-md',
    strong: 'bg-white/90 backdrop-blur-lg',
  };

  const blurStyles = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
  };

  return (
    <div
      className={clsx(
        'rounded-xl transition-all duration-300',
        intensityStyles[intensity],
        blurStyles[blur],
        border && 'border border-white/20',
        shadowStyles[shadow],
        'hover:shadow-xl hover:shadow-blue-500/10',
        className
      )}
    >
      {children}
    </div>
  );
};

// Premium button with enhanced visual effects
export interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'premium' | 'glass' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  glow?: boolean;
  gradient?: boolean;
  loading?: boolean;
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  glow = false,
  gradient = false,
  loading = false,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 transform focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: clsx(
      'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      glow && 'shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40',
      gradient && 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
    ),
    secondary: clsx(
      'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
      glow && 'shadow-lg shadow-gray-500/25 hover:shadow-xl hover:shadow-gray-500/40'
    ),
    premium: clsx(
      'bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 focus:ring-purple-500',
      'shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40'
    ),
    glass: clsx(
      'bg-white/80 backdrop-blur-md border border-white/20 text-gray-900 hover:bg-white/90 focus:ring-blue-500',
      glow && 'shadow-lg shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/20'
    ),
    outline: clsx(
      'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
      glow && 'shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40'
    ),
  };

  const sizeStyles = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-3 text-base min-h-[44px]',
    lg: 'px-6 py-4 text-lg min-h-[48px]',
    xl: 'px-8 py-5 text-xl min-h-[56px]',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      disabled={disabled || loading}
      className={clsx(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        'hover:-translate-y-0.5 active:translate-y-0',
        className
      )}
      {...(props as any)}
    >
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
      )}
      {children}
    </motion.button>
  );
};

// Enhanced card with premium styling
export interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient' | 'premium';
  hover?: boolean;
  glow?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
}

export const PremiumCard: React.FC<PremiumCardProps> = ({
  children,
  className,
  variant = 'default',
  hover = true,
  glow = false,
  padding = 'md',
}) => {
  const variantStyles = {
    default: 'bg-white border border-gray-200',
    glass: 'bg-white/80 backdrop-blur-md border border-white/20',
    gradient: 'bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 border border-blue-200/50',
    premium: 'bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/30 border border-blue-200/30',
  };

  const paddingStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  return (
    <motion.div
      whileHover={hover ? { y: -2 } : undefined}
      className={clsx(
        'rounded-xl transition-all duration-300',
        variantStyles[variant],
        paddingStyles[padding],
        hover && 'hover:shadow-xl',
        glow && 'shadow-lg shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/20',
        className
      )}
    >
      {children}
    </motion.div>
  );
};

// Consistent spacing utilities
export const spacing = {
  xs: 'space-y-2',
  sm: 'space-y-4',
  md: 'space-y-6',
  lg: 'space-y-8',
  xl: 'space-y-12',
  '2xl': 'space-y-16',
} as const;

// Typography hierarchy with consistent styling
export interface VisualHeadingProps {
  children: React.ReactNode;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  gradient?: boolean;
  className?: string;
}

export const VisualHeading: React.FC<VisualHeadingProps> = ({
  children,
  level,
  gradient = false,
  className,
}) => {
  const Component = `h${level}` as React.ElementType;
  
  const levelStyles = {
    1: 'text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight',
    2: 'text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight',
    3: 'text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight',
    4: 'text-xl md:text-2xl lg:text-3xl font-semibold',
    5: 'text-lg md:text-xl lg:text-2xl font-medium',
    6: 'text-base md:text-lg lg:text-xl font-medium',
  };

  return (
    <Component
      className={clsx(
        levelStyles[level],
        gradient && 'bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent',
        !gradient && 'text-gray-900',
        className
      )}
    >
      {children}
    </Component>
  );
};

// Visual separator with gradient
export interface VisualSeparatorProps {
  className?: string;
  gradient?: boolean;
  thickness?: 'thin' | 'medium' | 'thick';
}

export const VisualSeparator: React.FC<VisualSeparatorProps> = ({
  className,
  gradient = false,
  thickness = 'thin',
}) => {
  const thicknessStyles = {
    thin: 'h-px',
    medium: 'h-0.5',
    thick: 'h-1',
  };

  return (
    <div
      className={clsx(
        'w-full',
        thicknessStyles[thickness],
        gradient
          ? 'bg-gradient-to-r from-transparent via-blue-500 to-transparent'
          : 'bg-gray-200',
        className
      )}
    />
  );
};

// Loading state with premium styling
export interface PremiumLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  gradient?: boolean;
}

export const PremiumLoading: React.FC<PremiumLoadingProps> = ({
  size = 'md',
  text,
  gradient = false,
}) => {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div
        className={clsx(
          'animate-spin rounded-full border-2 border-transparent',
          sizeStyles[size],
          gradient
            ? 'border-t-blue-600 border-r-purple-600 border-b-cyan-600'
            : 'border-t-blue-600'
        )}
      />
      {text && (
        <p className="text-sm text-gray-600 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};
