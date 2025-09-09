import React from 'react';
import { clsx } from 'clsx';

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline' | 'muscle' | 'cardio' | 'strength' | 'accent';

export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

/**
 * Modern Badge component for fitness categories, tags, and status indicators
 */
const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  className,
  children,
  icon,
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    default: 'bg-neutral-100 text-neutral-800',
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-neutral-100 text-neutral-600',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    outline: 'bg-transparent border border-neutral-300 text-neutral-700',
    muscle: 'bg-orange-100 text-orange-800',
    cardio: 'bg-blue-100 text-blue-800',
    strength: 'bg-purple-100 text-purple-800',
    accent: 'bg-cyan-100 text-cyan-800',
  };

  const sizeStyles: Record<BadgeSize, string> = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span
      className={clsx(
        'badge',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;
