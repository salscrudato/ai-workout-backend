import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Search, Inbox, Wifi, AlertCircle, Plus } from 'lucide-react';
import Button from './Button';
import { Display, Heading, Body } from './Typography';

export interface EmptyStateProps {
  variant?: 'no-data' | 'no-results' | 'offline' | 'error' | 'loading' | 'premium' | 'glass';
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'gradient' | 'premium' | 'electric';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'ghost' | 'outline';
  };
  className?: string;
  animate?: boolean;
}

/**
 * Empty State Component with Blue Gradient Theme
 * 
 * Features:
 * - Multiple empty state variants
 * - Animated illustrations
 * - Blue gradient themes
 * - Call-to-action buttons
 * - Mobile-optimized layout
 * - Accessibility support
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  variant = 'no-data',
  title,
  description,
  icon,
  action,
  secondaryAction,
  className,
  animate = true,
}) => {
  const getDefaultIcon = () => {
    switch (variant) {
      case 'no-results':
        return <Search className="w-16 h-16 sm:w-20 sm:h-20" />;
      case 'offline':
        return <Wifi className="w-16 h-16 sm:w-20 sm:h-20" />;
      case 'error':
        return <AlertCircle className="w-16 h-16 sm:w-20 sm:h-20" />;
      case 'loading':
        return <div className="w-16 h-16 sm:w-20 sm:h-20 gradient-blue rounded-full animate-pulse" />;
      case 'no-data':
      default:
        return <Inbox className="w-16 h-16 sm:w-20 sm:h-20" />;
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'error':
        return 'text-red-400';
      case 'offline':
        return 'text-yellow-400';
      case 'loading':
        return 'text-primary-400';
      default:
        return 'text-primary-400';
    }
  };

  const getBackgroundPattern = () => {
    switch (variant) {
      case 'error':
        return 'bg-gradient-to-br from-red-50 to-red-100';
      case 'offline':
        return 'bg-gradient-to-br from-yellow-50 to-yellow-100';
      case 'premium':
        return 'glass-blue-premium border border-blue-premium-200';
      case 'glass':
        return 'glass-light border border-white/20';
      default:
        return 'bg-gradient-to-br from-primary-50 to-accent-50';
    }
  };

  // Animation variants
  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
        staggerChildren: 0.1,
      }
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      }
    },
  };

  const iconVariants = {
    initial: { opacity: 0, scale: 0.8, rotate: -10 },
    animate: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      }
    },
    hover: {
      scale: 1.1,
      rotate: 10,
      transition: { duration: 0.3 }
    }
  };

  const floatingVariants = {
    animate: {
      y: [-4, 4, -4],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      }
    }
  };

  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center text-center',
        'py-12 px-6 sm:py-16 sm:px-8',
        'min-h-[400px]',
        className
      )}
    >
      {/* Background Pattern */}
      <div
        className={clsx(
          'absolute inset-0 opacity-30 animate-morphing',
          getBackgroundPattern()
        )}
        style={{ clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0% 85%)' }}
      />

      {/* Icon Container */}
      <div className="relative mb-6">
        <div
          className={clsx(
            'inline-flex items-center justify-center',
            'w-24 h-24 sm:w-28 sm:h-28',
            'rounded-full',
            'glass-light',
            'animate-bounce-gentle',
            getIconColor()
          )}
        >
          {icon || getDefaultIcon()}
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-2 -right-2 w-4 h-4 gradient-blue rounded-full animate-ping opacity-75" />
        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-accent-400 rounded-full animate-pulse" />
      </div>

      {/* Content */}
      <div className="relative max-w-md mx-auto mb-8">
        <Heading
          level={2}
          gradient
          color="blue"
          className="mb-3 animate-fade-in-up"
        >
          {title}
        </Heading>

        {description && (
          <Body
            size={1}
            color="secondary"
            className="animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            {description}
          </Body>
        )}
      </div>

      {/* Action Button */}
      {action && (
        <div className="relative animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <Button
            variant={action.variant || 'gradient'}
            size="lg"
            onClick={action.onClick}
            leftIcon={<Plus className="w-5 h-5" />}
            className="shadow-glow-blue hover:shadow-glow-blue-lg"
            animate="bounce"
          >
            {action.label}
          </Button>
        </div>
      )}

      {/* Floating Elements */}
      <div className="absolute top-10 left-10 w-2 h-2 bg-primary-300 rounded-full animate-float opacity-60" />
      <div className="absolute top-20 right-16 w-1 h-1 bg-accent-400 rounded-full animate-float opacity-40" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-16 left-20 w-3 h-3 bg-primary-200 rounded-full animate-float opacity-50" style={{ animationDelay: '2s' }} />
    </div>
  );
};

export default EmptyState;
