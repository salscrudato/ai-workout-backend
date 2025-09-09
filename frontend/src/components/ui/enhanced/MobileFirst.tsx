import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

/**
 * Mobile-First Responsive Design Components
 * 
 * This module provides components optimized for mobile devices with:
 * - Touch-friendly interactions and gestures
 * - Responsive layouts that work across all screen sizes
 * - Native-like animations and transitions
 * - Accessibility support for mobile screen readers
 * - Performance optimizations for mobile devices
 */

// Enhanced touch target component
export interface TouchTargetProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  minSize?: number; // Minimum touch target size in pixels (default: 44px)
  hapticFeedback?: boolean;
  onTap?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
}

export const TouchTarget = forwardRef<HTMLDivElement, TouchTargetProps>(({
  children,
  minSize = 44,
  hapticFeedback = false,
  onTap,
  onLongPress,
  disabled = false,
  className,
  style,
  ...props
}, ref) => {
  const [isPressed, setIsPressed] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = () => {
    if (disabled) return;
    
    setIsPressed(true);
    
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        onLongPress();
        if (hapticFeedback && 'vibrate' in navigator) {
          navigator.vibrate([10, 50, 10]);
        }
      }, 500);
    }
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
    
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    
    if (onTap && !disabled) {
      onTap();
    }
  };

  const touchTargetStyles = clsx(
    'relative inline-flex items-center justify-center',
    'transition-all duration-150 ease-out',
    'select-none touch-manipulation',
    isPressed && 'scale-95 opacity-80',
    disabled && 'opacity-50 pointer-events-none',
    className
  );

  return (
    <div
      ref={ref}
      className={touchTargetStyles}
      style={{
        minWidth: minSize,
        minHeight: minSize,
        ...style,
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={() => setIsPressed(false)}
      role={onTap ? 'button' : undefined}
      tabIndex={onTap && !disabled ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  );
});

TouchTarget.displayName = 'TouchTarget';

// Enhanced swipeable card component
export interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  swipeThreshold?: number;
  className?: string;
  disabled?: boolean;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  swipeThreshold = 100,
  className,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    
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
      className={clsx(
        'relative cursor-grab active:cursor-grabbing',
        isDragging && 'z-10',
        className
      )}
      drag={!disabled}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05, rotate: isDragging ? 2 : 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.div>
  );
};

// Mobile-optimized carousel component
export interface MobileCarouselProps {
  children: React.ReactNode[];
  showIndicators?: boolean;
  showArrows?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
}

export const MobileCarousel: React.FC<MobileCarouselProps> = ({
  children,
  showIndicators = true,
  showArrows = false,
  autoPlay = false,
  autoPlayInterval = 3000,
  className,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex(prev => (prev + 1) % children.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, children.length]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex(prev => {
      if (newDirection === 1) {
        return (prev + 1) % children.length;
      } else {
        return prev === 0 ? children.length - 1 : prev - 1;
      }
    });
  };

  return (
    <div className={clsx('relative overflow-hidden', className)}>
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x);

            if (swipe < -swipeConfidenceThreshold) {
              paginate(1);
            } else if (swipe > swipeConfidenceThreshold) {
              paginate(-1);
            }
          }}
          className="w-full"
        >
          {children[currentIndex]}
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows for larger screens */}
      {showArrows && (
        <>
          <button
            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white transition-colors md:block hidden"
            onClick={() => paginate(-1)}
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white transition-colors md:block hidden"
            onClick={() => paginate(1)}
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Indicators */}
      {showIndicators && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {children.map((_, index) => (
            <button
              key={index}
              className={clsx(
                'w-2 h-2 rounded-full transition-all duration-200',
                index === currentIndex
                  ? 'bg-blue-600 w-6'
                  : 'bg-white/50 hover:bg-white/70'
              )}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Mobile-optimized bottom sheet component
export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  snapPoints?: number[]; // Percentage heights [25, 50, 90]
  className?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = [90],
  className,
}) => {
  const [currentSnapPoint, setCurrentSnapPoint] = useState(snapPoints[0]);

  const sheetVariants = {
    hidden: { y: '100%' },
    visible: { y: `${100 - currentSnapPoint}%` },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={sheetVariants}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.1}
            onDragEnd={(e, { offset, velocity }) => {
              if (offset.y > 100 || velocity.y > 500) {
                onClose();
              }
            }}
            className={clsx(
              'fixed inset-x-0 bottom-0 z-50',
              'bg-white rounded-t-3xl shadow-2xl',
              'max-h-screen overflow-hidden',
              className
            )}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            {title && (
              <div className="px-6 pb-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
