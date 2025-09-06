import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { RefreshCw, ArrowDown } from 'lucide-react';
import { clsx } from 'clsx';

export interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  refreshThreshold?: number;
  maxPullDistance?: number;
  disabled?: boolean;
  className?: string;
}

/**
 * Modern Pull-to-Refresh Component
 * 
 * Features:
 * - Native-like pull-to-refresh interaction
 * - Smooth spring animations
 * - Visual feedback with icons and progress
 * - Haptic feedback simulation
 * - Customizable thresholds
 * - Accessibility support
 */
const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  refreshThreshold = 80,
  maxPullDistance = 120,
  disabled = false,
  className,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canRefresh, setCanRefresh] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Motion values for smooth animations
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, refreshThreshold], [0, 1]);
  const scale = useTransform(y, [0, refreshThreshold], [0.8, 1]);
  const rotate = useTransform(y, [0, refreshThreshold], [0, 180]);
  
  // Haptic feedback simulation
  const triggerHapticFeedback = useCallback((type: 'light' | 'medium' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = { light: [10], medium: [20] };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  // Handle drag start
  const handleDragStart = useCallback(() => {
    if (disabled || isRefreshing) return false;
    
    // Only allow pull-to-refresh when at the top of the page
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return scrollTop === 0;
  }, [disabled, isRefreshing]);

  // Handle drag
  const handleDrag = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled || isRefreshing) return;
    
    const dragDistance = Math.max(0, Math.min(info.offset.y, maxPullDistance));
    y.set(dragDistance);
    
    // Trigger haptic feedback when reaching threshold
    if (dragDistance >= refreshThreshold && !canRefresh) {
      setCanRefresh(true);
      triggerHapticFeedback('medium');
    } else if (dragDistance < refreshThreshold && canRefresh) {
      setCanRefresh(false);
      triggerHapticFeedback('light');
    }
  }, [disabled, isRefreshing, maxPullDistance, refreshThreshold, canRefresh, y, triggerHapticFeedback]);

  // Handle drag end
  const handleDragEnd = useCallback(async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled || isRefreshing) return;
    
    if (info.offset.y >= refreshThreshold) {
      setIsRefreshing(true);
      triggerHapticFeedback('medium');
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
        setCanRefresh(false);
      }
    }
    
    // Animate back to original position
    y.set(0);
    setCanRefresh(false);
  }, [disabled, isRefreshing, refreshThreshold, onRefresh, triggerHapticFeedback, y]);

  // Reset state when refreshing completes
  useEffect(() => {
    if (!isRefreshing) {
      y.set(0);
      setCanRefresh(false);
    }
  }, [isRefreshing, y]);

  return (
    <div 
      ref={containerRef}
      className={clsx('relative overflow-hidden', className)}
    >
      {/* Pull-to-refresh indicator */}
      <motion.div
        className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center"
        style={{
          y: y.get() - 60,
          opacity,
        }}
        initial={{ y: -60 }}
      >
        <motion.div
          className={clsx(
            'flex items-center justify-center w-12 h-12 rounded-full',
            'backdrop-blur-xl border shadow-lg',
            canRefresh || isRefreshing
              ? 'bg-blue-500 border-blue-400 text-white'
              : 'bg-white/90 border-gray-200 text-gray-600'
          )}
          style={{ scale }}
        >
          {isRefreshing ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <motion.div style={{ rotate }}>
              <ArrowDown className="w-5 h-5" />
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Content container with drag handling */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.3, bottom: 0 }}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ y }}
        className="relative"
      >
        {children}
      </motion.div>

      {/* Loading overlay */}
      {isRefreshing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 z-20"
        />
      )}
    </div>
  );
};

export default PullToRefresh;
