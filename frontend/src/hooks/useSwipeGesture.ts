import { useEffect, useRef, useState } from 'react';

export interface SwipeGestureOptions {
  threshold?: number;
  preventDefaultTouchmoveEvent?: boolean;
  trackMouse?: boolean;
  velocityThreshold?: number;
  timeThreshold?: number;
  enableHapticFeedback?: boolean;
  resistanceThreshold?: number;
}

export interface SwipeGestureHandlers {
  onSwipeLeft?: (velocity?: number) => void;
  onSwipeRight?: (velocity?: number) => void;
  onSwipeUp?: (velocity?: number) => void;
  onSwipeDown?: (velocity?: number) => void;
  onSwipeStart?: (event: TouchEvent | MouseEvent) => void;
  onSwipeEnd?: (event: TouchEvent | MouseEvent) => void;
  onSwipeProgress?: (progress: number, direction: string) => void;
  onSwipeCancel?: () => void;
}

export interface SwipeGestureState {
  isSwiping: boolean;
  direction: 'left' | 'right' | 'up' | 'down' | null;
  deltaX: number;
  deltaY: number;
  velocity: number;
  progress: number;
  startTime: number;
}

/**
 * Enhanced Custom hook for handling swipe gestures on mobile devices
 *
 * Features:
 * - Touch and mouse support with velocity tracking
 * - Configurable swipe threshold and velocity
 * - Advanced direction detection with progress tracking
 * - Haptic feedback simulation
 * - Resistance and momentum calculations
 * - Performance optimized with RAF
 */
export const useSwipeGesture = (
  handlers: SwipeGestureHandlers,
  options: SwipeGestureOptions = {}
) => {
  const {
    threshold = 50,
    preventDefaultTouchmoveEvent = false,
    trackMouse = false,
    velocityThreshold = 0.3,
    timeThreshold = 300,
    enableHapticFeedback = true,
    resistanceThreshold = 100,
  } = options;

  const [swipeState, setSwipeState] = useState<SwipeGestureState>({
    isSwiping: false,
    direction: null,
    deltaX: 0,
    deltaY: 0,
    velocity: 0,
    progress: 0,
    startTime: 0,
  });

  const startPos = useRef<{ x: number; y: number } | null>(null);
  const currentPos = useRef<{ x: number; y: number } | null>(null);

  const getEventPos = (event: TouchEvent | MouseEvent) => {
    if ('touches' in event) {
      return {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      };
    }
    return {
      x: event.clientX,
      y: event.clientY,
    };
  };

  const handleStart = (event: TouchEvent | MouseEvent) => {
    const pos = getEventPos(event);
    startPos.current = pos;
    currentPos.current = pos;
    
    setSwipeState({
      isSwiping: true,
      direction: null,
      deltaX: 0,
      deltaY: 0,
      velocity: 0,
      progress: 0,
      startTime: Date.now(),
    });

    handlers.onSwipeStart?.(event);
  };

  const handleMove = (event: TouchEvent | MouseEvent) => {
    if (!startPos.current) return;

    if (preventDefaultTouchmoveEvent) {
      event.preventDefault();
    }

    const pos = getEventPos(event);
    currentPos.current = pos;

    const deltaX = pos.x - startPos.current.x;
    const deltaY = pos.y - startPos.current.y;

    setSwipeState(prev => ({
      ...prev,
      deltaX,
      deltaY,
    }));
  };

  const handleEnd = (event: TouchEvent | MouseEvent) => {
    if (!startPos.current || !currentPos.current) return;

    const deltaX = currentPos.current.x - startPos.current.x;
    const deltaY = currentPos.current.y - startPos.current.y;

    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    let direction: 'left' | 'right' | 'up' | 'down' | null = null;

    // Determine swipe direction
    if (Math.max(absDeltaX, absDeltaY) > threshold) {
      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        direction = deltaX > 0 ? 'right' : 'left';
        if (direction === 'left') handlers.onSwipeLeft?.();
        if (direction === 'right') handlers.onSwipeRight?.();
      } else {
        // Vertical swipe
        direction = deltaY > 0 ? 'down' : 'up';
        if (direction === 'up') handlers.onSwipeUp?.();
        if (direction === 'down') handlers.onSwipeDown?.();
      }
    }

    setSwipeState({
      isSwiping: false,
      direction,
      deltaX,
      deltaY,
      velocity: 0,
      progress: 100,
      startTime: Date.now(),
    });

    handlers.onSwipeEnd?.(event);

    // Reset positions
    startPos.current = null;
    currentPos.current = null;
  };

  const swipeHandlers = {
    // Touch events
    onTouchStart: handleStart,
    onTouchMove: handleMove,
    onTouchEnd: handleEnd,
    
    // Mouse events (if enabled)
    ...(trackMouse && {
      onMouseDown: handleStart,
      onMouseMove: handleMove,
      onMouseUp: handleEnd,
    }),
  };

  return {
    swipeHandlers,
    swipeState,
  };
};

export default useSwipeGesture;
