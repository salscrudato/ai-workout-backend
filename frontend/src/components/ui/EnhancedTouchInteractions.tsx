import React, { useState, useRef, useCallback } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { clsx } from 'clsx';

/**
 * Enhanced Touch Interactions Component
 * 
 * Provides native-like mobile interactions:
 * - Swipe gestures with haptic feedback
 * - Pull-to-refresh functionality
 * - Long press interactions
 * - Optimized touch targets (44px minimum)
 * - Smooth momentum scrolling
 * - iOS/Android-style feedback
 */

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onLongPress?: () => void;
  className?: string;
  disabled?: boolean;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onLongPress,
  className,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-150, 0, 150], [0.5, 1, 0.5]);
  const scale = useTransform(x, [-150, 0, 150], [0.95, 1, 0.95]);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    // Simulate haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }, []);

  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    setIsDragging(false);
    const threshold = 100;

    if (info.offset.x > threshold && onSwipeRight) {
      onSwipeRight();
      // Haptic feedback for successful action
      if (navigator.vibrate) {
        navigator.vibrate([10, 50, 10]);
      }
    } else if (info.offset.x < -threshold && onSwipeLeft) {
      onSwipeLeft();
      // Haptic feedback for successful action
      if (navigator.vibrate) {
        navigator.vibrate([10, 50, 10]);
      }
    }

    // Reset position
    x.set(0);
  }, [onSwipeLeft, onSwipeRight, x]);

  const handleTouchStart = useCallback(() => {
    if (onLongPress) {
      const timer = setTimeout(() => {
        onLongPress();
        // Strong haptic feedback for long press
        if (navigator.vibrate) {
          navigator.vibrate([20, 100, 20]);
        }
      }, 500);
      setLongPressTimer(timer);
    }
  }, [onLongPress]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer]);

  return (
    <motion.div
      className={clsx(
        'touch-target relative overflow-hidden rounded-xl',
        'select-none cursor-pointer',
        isDragging && 'z-10',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
      style={{ x, opacity, scale }}
      drag={disabled ? false : 'x'}
      dragConstraints={{ left: -200, right: 200 }}
      dragElastic={0.2}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {children}
      
      {/* Swipe indicators */}
      {isDragging && (
        <>
          <motion.div
            className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            ➜
          </motion.div>
          <motion.div
            className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            ✕
          </motion.div>
        </>
      )}
    </motion.div>
  );
};

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  className,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const y = useMotionValue(0);
  const refreshThreshold = 80;

  const handleDrag = useCallback((event: any, info: PanInfo) => {
    const newY = Math.max(0, info.offset.y);
    setPullDistance(newY);
    y.set(newY);
  }, [y]);

  const handleDragEnd = useCallback(async (event: any, info: PanInfo) => {
    if (info.offset.y > refreshThreshold && !isRefreshing) {
      setIsRefreshing(true);
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([20, 100, 20]);
      }
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
        y.set(0);
      }
    } else {
      setPullDistance(0);
      y.set(0);
    }
  }, [onRefresh, isRefreshing, y, refreshThreshold]);

  const refreshOpacity = Math.min(pullDistance / refreshThreshold, 1);
  const refreshScale = Math.min(0.5 + (pullDistance / refreshThreshold) * 0.5, 1);

  return (
    <motion.div
      className={clsx('relative overflow-hidden', className)}
      style={{ y }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.3, bottom: 0 }}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
    >
      {/* Pull to refresh indicator */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full
                   flex items-center justify-center h-16 w-16 rounded-full
                   bg-primary-500 text-white shadow-lg"
        style={{
          opacity: refreshOpacity,
          scale: refreshScale,
          y: pullDistance * 0.5,
        }}
      >
        {isRefreshing ? (
          <motion.div
            className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        ) : (
          <motion.div
            animate={{ rotate: pullDistance > refreshThreshold ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            ↓
          </motion.div>
        )}
      </motion.div>

      {children}
    </motion.div>
  );
};

interface TouchableOpacityProps {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
  activeOpacity?: number;
}

export const TouchableOpacity: React.FC<TouchableOpacityProps> = ({
  children,
  onPress,
  disabled = false,
  className,
  activeOpacity = 0.7,
}) => {
  return (
    <motion.div
      className={clsx(
        'touch-target cursor-pointer select-none',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
      whileTap={{ 
        opacity: activeOpacity,
        scale: 0.98,
      }}
      transition={{ duration: 0.1 }}
      onClick={disabled ? undefined : onPress}
    >
      {children}
    </motion.div>
  );
};

interface FloatingActionButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  onPress,
  position = 'bottom-right',
  size = 'md',
  className,
  disabled = false,
}) => {
  const positionClasses = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'bottom-center': 'fixed bottom-6 left-1/2 -translate-x-1/2',
  };

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16',
  };

  return (
    <motion.button
      className={clsx(
        'touch-target rounded-full gradient-primary text-white shadow-glow-blue',
        'flex items-center justify-center z-50',
        positionClasses[position],
        sizeClasses[size],
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onClick={disabled ? undefined : onPress}
      disabled={disabled}
    >
      {icon}
    </motion.button>
  );
};

// Export all components
export default {
  SwipeableCard,
  PullToRefresh,
  TouchableOpacity,
  FloatingActionButton,
};
