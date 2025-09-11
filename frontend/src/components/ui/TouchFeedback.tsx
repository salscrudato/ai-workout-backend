import React, { useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';

export interface TouchFeedbackProps {
  children: React.ReactNode;
  onTap?: () => void;
  onLongPress?: () => void;
  onDoubleTap?: () => void;
  disabled?: boolean;
  className?: string;
  feedbackType?: 'ripple' | 'scale' | 'glow' | 'none';
  longPressDelay?: number;
  doubleTapDelay?: number;
}

/**
 * Enhanced touch feedback component for mobile workout interactions
 */
const TouchFeedback: React.FC<TouchFeedbackProps> = ({
  children,
  onTap,
  onLongPress,
  onDoubleTap,
  disabled = false,
  className,
  feedbackType = 'ripple',
  longPressDelay = 500,
  doubleTapDelay = 300,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [tapCount, setTapCount] = useState(0);
  
  const elementRef = useRef<HTMLDivElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const doubleTapTimerRef = useRef<NodeJS.Timeout | null>(null);
  const rippleIdRef = useRef(0);

  const createRipple = (e: React.TouchEvent | React.MouseEvent) => {
    if (feedbackType !== 'ripple' || disabled) return;

    const rect = elementRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;

    const newRipple = {
      id: rippleIdRef.current++,
      x,
      y,
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;

    setIsPressed(true);
    createRipple(e);

    // Start long press timer
    if (onLongPress) {
      longPressTimerRef.current = setTimeout(() => {
        onLongPress();
        setIsPressed(false);
      }, longPressDelay);
    }
  };

  const handleTouchEnd = () => {
    if (disabled) return;

    setIsPressed(false);

    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Handle tap and double tap
    if (onTap || onDoubleTap) {
      setTapCount(prev => prev + 1);

      if (doubleTapTimerRef.current) {
        clearTimeout(doubleTapTimerRef.current);
      }

      doubleTapTimerRef.current = setTimeout(() => {
        if (tapCount === 1 && onTap) {
          onTap();
        } else if (tapCount === 2 && onDoubleTap) {
          onDoubleTap();
        }
        setTapCount(0);
      }, doubleTapDelay);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    setIsPressed(true);
    createRipple(e);
  };

  const handleMouseUp = () => {
    if (disabled) return;
    setIsPressed(false);
  };

  const handleMouseLeave = () => {
    if (disabled) return;
    setIsPressed(false);
    
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
      if (doubleTapTimerRef.current) {
        clearTimeout(doubleTapTimerRef.current);
      }
    };
  }, []);

  const getFeedbackClasses = () => {
    if (disabled) return '';

    switch (feedbackType) {
      case 'scale':
        return isPressed ? 'scale-95' : 'scale-100';
      case 'glow':
        return isPressed ? 'shadow-glow-blue' : '';
      case 'none':
        return '';
      default:
        return '';
    }
  };

  return (
    <div
      ref={elementRef}
      className={clsx(
        'relative overflow-hidden touch-manipulation select-none',
        'transition-all duration-150 ease-out',
        getFeedbackClasses(),
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && 'cursor-pointer',
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{
        WebkitTapHighlightColor: 'transparent',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
    >
      {children}
      
      {/* Ripple Effects */}
      {feedbackType === 'ripple' && ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <span className="block w-0 h-0 rounded-full bg-white/30 animate-ping" 
                style={{
                  animation: 'ripple 0.6s linear',
                  animationFillMode: 'forwards',
                }}
          />
        </span>
      ))}
      
      <style jsx>{`
        @keyframes ripple {
          to {
            width: 200px;
            height: 200px;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default TouchFeedback;
