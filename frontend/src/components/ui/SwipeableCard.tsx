import React, { useState } from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import { clsx } from 'clsx';

export interface SwipeAction {
  icon: React.ReactNode;
  color: string;
  backgroundColor: string;
  onAction: () => void;
  threshold?: number;
}

export interface SwipeableCardProps {
  children: React.ReactNode;
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
  className?: string;
  disabled?: boolean;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
}

/**
 * SwipeableCard Component
 * 
 * Provides swipe-to-action functionality for mobile interfaces with:
 * - Left and right swipe actions
 * - Visual feedback during swipe
 * - Smooth animations
 * - Customizable thresholds
 */
const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  leftAction,
  rightAction,
  className,
  disabled = false,
  onSwipeStart,
  onSwipeEnd,
}) => {
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const controls = useAnimation();

  const handleDragStart = () => {
    if (disabled) return;
    setIsSwipeActive(true);
    onSwipeStart?.();
  };

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled) return;
    
    const { offset } = info;
    const threshold = 80;
    
    if (Math.abs(offset.x) > threshold) {
      const direction = offset.x > 0 ? 'right' : 'left';
      setSwipeDirection(direction);
    } else {
      setSwipeDirection(null);
    }
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled) return;
    
    const { offset, velocity } = info;
    const threshold = 100;
    const velocityThreshold = 500;
    
    const shouldTriggerAction = 
      Math.abs(offset.x) > threshold || 
      Math.abs(velocity.x) > velocityThreshold;
    
    if (shouldTriggerAction) {
      if (offset.x > 0 && rightAction) {
        // Swipe right
        controls.start({
          x: window.innerWidth,
          opacity: 0,
          transition: { duration: 0.3, ease: 'easeOut' }
        }).then(() => {
          rightAction.onAction();
          controls.set({ x: 0, opacity: 1 });
        });
      } else if (offset.x < 0 && leftAction) {
        // Swipe left
        controls.start({
          x: -window.innerWidth,
          opacity: 0,
          transition: { duration: 0.3, ease: 'easeOut' }
        }).then(() => {
          leftAction.onAction();
          controls.set({ x: 0, opacity: 1 });
        });
      } else {
        // Snap back
        controls.start({
          x: 0,
          transition: { type: 'spring', stiffness: 300, damping: 30 }
        });
      }
    } else {
      // Snap back
      controls.start({
        x: 0,
        transition: { type: 'spring', stiffness: 300, damping: 30 }
      });
    }
    
    setIsSwipeActive(false);
    setSwipeDirection(null);
    onSwipeEnd?.();
  };

  const getActionBackground = (direction: 'left' | 'right') => {
    const action = direction === 'left' ? leftAction : rightAction;
    return action?.backgroundColor || 'bg-gray-100';
  };

  const getActionIcon = (direction: 'left' | 'right') => {
    const action = direction === 'left' ? leftAction : rightAction;
    return action?.icon;
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Left Action Background */}
      {leftAction && (
        <motion.div
          className={clsx(
            'absolute inset-y-0 left-0 flex items-center justify-start pl-6',
            'w-full z-0',
            getActionBackground('left')
          )}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: swipeDirection === 'left' ? 1 : 0,
            scale: swipeDirection === 'left' ? 1.1 : 1
          }}
          transition={{ duration: 0.2 }}
        >
          <div className={clsx('text-2xl', leftAction.color)}>
            {getActionIcon('left')}
          </div>
        </motion.div>
      )}

      {/* Right Action Background */}
      {rightAction && (
        <motion.div
          className={clsx(
            'absolute inset-y-0 right-0 flex items-center justify-end pr-6',
            'w-full z-0',
            getActionBackground('right')
          )}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: swipeDirection === 'right' ? 1 : 0,
            scale: swipeDirection === 'right' ? 1.1 : 1
          }}
          transition={{ duration: 0.2 }}
        >
          <div className={clsx('text-2xl', rightAction.color)}>
            {getActionIcon('right')}
          </div>
        </motion.div>
      )}

      {/* Main Card Content */}
      <motion.div
        className={clsx(
          'relative z-10 bg-white',
          'swipe-container',
          isSwipeActive && 'shadow-lg',
          className
        )}
        animate={controls}
        drag={!disabled ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        whileDrag={{
          scale: 1.02,
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
        }}
        style={{
          touchAction: 'pan-x',
        }}
      >
        {children}
        
        {/* Swipe Indicator */}
        {!disabled && (leftAction || rightAction) && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-1">
              <div className="w-8 h-1 bg-gray-300 rounded-full opacity-30" />
              <div className="w-8 h-1 bg-gray-300 rounded-full opacity-30" />
              <div className="w-8 h-1 bg-gray-300 rounded-full opacity-30" />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SwipeableCard;
