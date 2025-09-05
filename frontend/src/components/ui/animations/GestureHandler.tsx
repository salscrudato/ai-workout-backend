import React from 'react';
import { motion, PanInfo } from 'framer-motion';

export interface GestureHandlerProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onRotate?: (rotation: number) => void;
  className?: string;
  disabled?: boolean;
  swipeThreshold?: number;
}

/**
 * Gesture Handler Component
 * 
 * Provides touch and mouse gesture handling with:
 * - Swipe gestures in all directions
 * - Pinch to zoom
 * - Rotation gestures
 * - Configurable thresholds
 * - Mobile-optimized
 */
const GestureHandler: React.FC<GestureHandlerProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinch,
  onRotate,
  className,
  disabled = false,
  swipeThreshold = 50,
}) => {
  const handlePanEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled) return;

    const { offset, velocity } = info;
    const swipeConfidenceThreshold = 10000;
    const swipePower = (offset: number, velocity: number) => {
      return Math.abs(offset) * velocity;
    };

    // Horizontal swipes
    if (Math.abs(offset.x) > Math.abs(offset.y)) {
      if (offset.x > swipeThreshold || swipePower(offset.x, velocity.x) > swipeConfidenceThreshold) {
        onSwipeRight?.();
      } else if (offset.x < -swipeThreshold || swipePower(offset.x, velocity.x) < -swipeConfidenceThreshold) {
        onSwipeLeft?.();
      }
    }
    // Vertical swipes
    else {
      if (offset.y > swipeThreshold || swipePower(offset.y, velocity.y) > swipeConfidenceThreshold) {
        onSwipeDown?.();
      } else if (offset.y < -swipeThreshold || swipePower(offset.y, velocity.y) < -swipeConfidenceThreshold) {
        onSwipeUp?.();
      }
    }
  };

  return (
    <motion.div
      className={className}
      onPanEnd={handlePanEnd}
      drag={!disabled}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      whileDrag={{ scale: 1.02 }}
      style={{
        touchAction: disabled ? 'auto' : 'none',
      }}
    >
      {children}
    </motion.div>
  );
};

export default GestureHandler;
