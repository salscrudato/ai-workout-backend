import React, { useState, useRef, useEffect, useCallback } from 'react';
import { clsx } from 'clsx';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';

/**
 * Enhanced Touch Interaction Components
 * 
 * This module provides advanced touch interaction components optimized for mobile:
 * - Pull-to-refresh functionality
 * - Swipe gestures with haptic feedback
 * - Long press interactions
 * - Touch-optimized buttons and controls
 * - Gesture-based navigation
 */

// Pull-to-refresh component
export interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  refreshThreshold?: number;
  className?: string;
  disabled?: boolean;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  refreshThreshold = 80,
  className,
  disabled = false,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, refreshThreshold], [0, 1]);
  const scale = useTransform(y, [0, refreshThreshold], [0.8, 1]);

  const handleDragEnd = async (event: any, info: PanInfo) => {
    if (disabled || isRefreshing) return;

    if (info.offset.y > refreshThreshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        y.set(0);
        setPullDistance(0);
      }
    } else {
      y.set(0);
      setPullDistance(0);
    }
  };

  const handleDrag = (event: any, info: PanInfo) => {
    if (disabled || isRefreshing) return;
    
    const newDistance = Math.max(0, info.offset.y);
    setPullDistance(newDistance);
    y.set(newDistance);
  };

  return (
    <div className={clsx('relative overflow-hidden', className)}>
      {/* Refresh indicator */}
      <motion.div
        className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full z-10"
        style={{ opacity, scale }}
      >
        <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full shadow-lg">
          {isRefreshing ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ y }}
        className="min-h-full"
      >
        {children}
      </motion.div>
    </div>
  );
};

// Enhanced swipe actions component
export interface SwipeActionsProps {
  children: React.ReactNode;
  leftActions?: Array<{
    icon: React.ReactNode;
    label: string;
    color: 'blue' | 'green' | 'red' | 'yellow' | 'gray';
    onAction: () => void;
  }>;
  rightActions?: Array<{
    icon: React.ReactNode;
    label: string;
    color: 'blue' | 'green' | 'red' | 'yellow' | 'gray';
    onAction: () => void;
  }>;
  threshold?: number;
  className?: string;
}

export const SwipeActions: React.FC<SwipeActionsProps> = ({
  children,
  leftActions = [],
  rightActions = [],
  threshold = 80,
  className,
}) => {
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const x = useMotionValue(0);

  const colorStyles = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    gray: 'bg-gray-500',
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const { offset } = info;
    
    if (Math.abs(offset.x) > threshold) {
      if (offset.x > 0 && leftActions.length > 0) {
        // Swiped right, show left actions
        setSwipeDirection('left');
      } else if (offset.x < 0 && rightActions.length > 0) {
        // Swiped left, show right actions
        setSwipeDirection('right');
      }
    } else {
      x.set(0);
      setSwipeDirection(null);
    }
  };

  const executeAction = (action: any) => {
    action.onAction();
    x.set(0);
    setSwipeDirection(null);
  };

  return (
    <div className={clsx('relative overflow-hidden', className)}>
      {/* Left actions */}
      {leftActions.length > 0 && (
        <div className="absolute left-0 top-0 bottom-0 flex">
          {leftActions.map((action, index) => (
            <button
              key={index}
              className={clsx(
                'flex flex-col items-center justify-center px-4 text-white text-xs font-medium',
                colorStyles[action.color]
              )}
              onClick={() => executeAction(action)}
              style={{ width: `${100 / leftActions.length}px` }}
            >
              <div className="mb-1">{action.icon}</div>
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Right actions */}
      {rightActions.length > 0 && (
        <div className="absolute right-0 top-0 bottom-0 flex">
          {rightActions.map((action, index) => (
            <button
              key={index}
              className={clsx(
                'flex flex-col items-center justify-center px-4 text-white text-xs font-medium',
                colorStyles[action.color]
              )}
              onClick={() => executeAction(action)}
              style={{ width: `${100 / rightActions.length}px` }}
            >
              <div className="mb-1">{action.icon}</div>
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -200, right: 200 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="relative z-10 bg-white"
      >
        {children}
      </motion.div>
    </div>
  );
};

// Long press component
export interface LongPressProps {
  children: React.ReactNode;
  onLongPress: () => void;
  onPress?: () => void;
  delay?: number;
  className?: string;
  disabled?: boolean;
}

export const LongPress: React.FC<LongPressProps> = ({
  children,
  onLongPress,
  onPress,
  delay = 500,
  className,
  disabled = false,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  const startPress = useCallback(() => {
    if (disabled) return;

    setIsPressed(true);
    setProgress(0);

    // Start progress animation
    const startTime = Date.now();
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / delay) * 100, 100);
      setProgress(newProgress);
    }, 16);

    // Set long press timer
    timerRef.current = setTimeout(() => {
      onLongPress();
      if ('vibrate' in navigator) {
        navigator.vibrate([10, 50, 10]);
      }
      endPress();
    }, delay);
  }, [disabled, delay, onLongPress]);

  const endPress = useCallback(() => {
    setIsPressed(false);
    setProgress(0);
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (progressRef.current) {
      clearInterval(progressRef.current);
    }
  }, []);

  const handlePress = useCallback(() => {
    if (disabled) return;
    
    if (progress < 100) {
      onPress?.();
    }
    endPress();
  }, [disabled, progress, onPress, endPress]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, []);

  return (
    <div
      className={clsx(
        'relative select-none touch-manipulation',
        isPressed && 'scale-95',
        'transition-transform duration-150',
        className
      )}
      onTouchStart={startPress}
      onTouchEnd={handlePress}
      onTouchCancel={endPress}
      onMouseDown={startPress}
      onMouseUp={handlePress}
      onMouseLeave={endPress}
    >
      {/* Progress indicator */}
      {isPressed && (
        <div className="absolute inset-0 rounded-lg overflow-hidden">
          <div
            className="absolute inset-0 bg-blue-500/20 transition-all duration-75"
            style={{
              clipPath: `inset(0 ${100 - progress}% 0 0)`,
            }}
          />
        </div>
      )}
      
      {children}
    </div>
  );
};

// Touch-optimized button with enhanced feedback
export interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  hapticFeedback?: boolean;
  ripple?: boolean;
}

export const TouchButton: React.FC<TouchButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  hapticFeedback = true,
  ripple = true,
  className,
  onClick,
  disabled,
  ...props
}) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 active:bg-blue-100',
    ghost: 'text-blue-600 hover:bg-blue-50 active:bg-blue-100',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm min-h-[40px]',
    md: 'px-6 py-3 text-base min-h-[48px]',
    lg: 'px-8 py-4 text-lg min-h-[56px]',
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    // Haptic feedback
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }

    // Ripple effect
    if (ripple) {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const newRipple = { id: Date.now(), x, y };
      
      setRipples(prev => [...prev, newRipple]);
      
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 600);
    }

    onClick?.(event);
  };

  return (
    <button
      className={clsx(
        'relative overflow-hidden rounded-xl font-medium',
        'transition-all duration-150 ease-out',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        'active:scale-95 touch-manipulation',
        variantStyles[variant],
        sizeStyles[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full animate-ping"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
          }}
        />
      ))}
      
      {children}
    </button>
  );
};
