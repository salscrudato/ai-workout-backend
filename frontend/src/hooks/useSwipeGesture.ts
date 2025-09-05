import { useEffect, useRef, useState } from 'react';

export interface SwipeGestureOptions {
  threshold?: number;
  preventDefaultTouchmoveEvent?: boolean;
  trackMouse?: boolean;
}

export interface SwipeGestureHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeStart?: (event: TouchEvent | MouseEvent) => void;
  onSwipeEnd?: (event: TouchEvent | MouseEvent) => void;
}

export interface SwipeGestureState {
  isSwiping: boolean;
  direction: 'left' | 'right' | 'up' | 'down' | null;
  deltaX: number;
  deltaY: number;
}

/**
 * Custom hook for handling swipe gestures on mobile devices
 * 
 * Features:
 * - Touch and mouse support
 * - Configurable swipe threshold
 * - Direction detection
 * - Swipe state tracking
 * - Performance optimized
 */
export const useSwipeGesture = (
  handlers: SwipeGestureHandlers,
  options: SwipeGestureOptions = {}
) => {
  const {
    threshold = 50,
    preventDefaultTouchmoveEvent = false,
    trackMouse = false,
  } = options;

  const [swipeState, setSwipeState] = useState<SwipeGestureState>({
    isSwiping: false,
    direction: null,
    deltaX: 0,
    deltaY: 0,
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
