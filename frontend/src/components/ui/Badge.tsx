import React from 'react';
import { clsx } from 'clsx';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'muscle'
  | 'cardio'
  | 'strength'
  | 'outline';

export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  removable?: boolean;
  onRemove?: () => void;
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
  removable = false,
  onRemove,
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    default: 'bg-secondary-100 text-secondary-800 border-secondary-200',
    primary: 'bg-primary-100 text-primary-800 border-primary-200',
    secondary: 'bg-secondary-100 text-secondary-800 border-secondary-200',
    success: 'bg-success-100 text-success-800 border-success-200',
    warning: 'bg-warning-100 text-warning-800 border-warning-200',
    error: 'bg-error-100 text-error-800 border-error-200',
    muscle: 'bg-muscle-100 text-muscle-800 border-muscle-200',
    cardio: 'bg-cardio-100 text-cardio-800 border-cardio-200',
    strength: 'bg-strength-100 text-strength-800 border-strength-200',
    outline: 'bg-white text-gray-700 border-gray-300',
  };

  const sizeStyles: Record<BadgeSize, string> = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const iconSizes: Record<BadgeSize, string> = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-medium rounded-full border',
        'transition-all duration-200',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {icon && (
        <span className={clsx('flex-shrink-0', iconSizes[size])}>
          {icon}
        </span>
      )}
      
      <span className="truncate">{children}</span>
      
      {removable && onRemove && (
        <button
          onClick={onRemove}
          className={clsx(
            'flex-shrink-0 rounded-full hover:bg-black/10 transition-colors',
            size === 'sm' ? 'p-0.5' : 'p-1'
          )}
          aria-label="Remove"
        >
          <svg
            className={iconSizes[size]}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </span>
  );
};

export default Badge;
