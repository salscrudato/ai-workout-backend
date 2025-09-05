import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'auto';
export type TooltipTrigger = 'hover' | 'click' | 'focus' | 'manual';

export interface TooltipProps {
  content: React.ReactNode;
  position?: TooltipPosition;
  trigger?: TooltipTrigger;
  delay?: number;
  offset?: number;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
  disabled?: boolean;
  maxWidth?: number;
  arrow?: boolean;
  interactive?: boolean;
  onShow?: () => void;
  onHide?: () => void;
}

/**
 * Advanced Tooltip Component
 * 
 * Features:
 * - Multiple positioning options with auto-adjustment
 * - Various trigger methods
 * - Smooth animations
 * - Portal rendering for z-index issues
 * - Interactive tooltips
 * - Accessibility support
 * - Mobile-friendly
 */
const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'auto',
  trigger = 'hover',
  delay = 200,
  offset = 8,
  className,
  contentClassName,
  children,
  disabled = false,
  maxWidth = 300,
  arrow = true,
  interactive = false,
  onShow,
  onHide,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState<TooltipPosition>('top');
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate optimal position
  const calculatePosition = (): TooltipPosition => {
    if (!triggerRef.current || position !== 'auto') return position;

    const rect = triggerRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const spaceTop = rect.top;
    const spaceBottom = viewport.height - rect.bottom;
    const spaceLeft = rect.left;
    const spaceRight = viewport.width - rect.right;

    // Determine best position based on available space
    if (spaceTop > 100) return 'top';
    if (spaceBottom > 100) return 'bottom';
    if (spaceRight > 200) return 'right';
    if (spaceLeft > 200) return 'left';
    
    return 'bottom'; // fallback
  };

  // Calculate tooltip position and style
  const updateTooltipPosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const optimalPosition = calculatePosition();
    
    setActualPosition(optimalPosition);

    let top = 0;
    let left = 0;

    switch (optimalPosition) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - offset;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + offset;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - offset;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + offset;
        break;
    }

    // Ensure tooltip stays within viewport
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    if (left < 8) left = 8;
    if (left + tooltipRect.width > viewport.width - 8) {
      left = viewport.width - tooltipRect.width - 8;
    }
    if (top < 8) top = 8;
    if (top + tooltipRect.height > viewport.height - 8) {
      top = viewport.height - tooltipRect.height - 8;
    }

    setTooltipStyle({
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      zIndex: 9999,
    });
  };

  const showTooltip = () => {
    if (disabled) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      onShow?.();
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsVisible(false);
    onHide?.();
  };

  // Event handlers
  const handleMouseEnter = () => {
    if (trigger === 'hover') showTooltip();
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover' && !interactive) hideTooltip();
  };

  const handleClick = () => {
    if (trigger === 'click') {
      isVisible ? hideTooltip() : showTooltip();
    }
  };

  const handleFocus = () => {
    if (trigger === 'focus') showTooltip();
  };

  const handleBlur = () => {
    if (trigger === 'focus') hideTooltip();
  };

  // Update position when tooltip becomes visible
  useEffect(() => {
    if (isVisible) {
      // Small delay to ensure tooltip is rendered
      const timer = setTimeout(updateTooltipPosition, 10);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (isVisible) updateTooltipPosition();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isVisible]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getArrowClasses = () => {
    const baseClasses = 'absolute w-2 h-2 bg-secondary-800 transform rotate-45';
    
    switch (actualPosition) {
      case 'top':
        return `${baseClasses} -bottom-1 left-1/2 -translate-x-1/2`;
      case 'bottom':
        return `${baseClasses} -top-1 left-1/2 -translate-x-1/2`;
      case 'left':
        return `${baseClasses} -right-1 top-1/2 -translate-y-1/2`;
      case 'right':
        return `${baseClasses} -left-1 top-1/2 -translate-y-1/2`;
      default:
        return baseClasses;
    }
  };

  const tooltipContent = (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={tooltipRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.15 }}
          className={clsx(
            'bg-secondary-800 text-white text-sm rounded-lg px-3 py-2 shadow-lg',
            'pointer-events-auto relative',
            contentClassName
          )}
          onMouseEnter={() => interactive && trigger === 'hover' && showTooltip()}
          onMouseLeave={() => interactive && trigger === 'hover' && hideTooltip()}
          style={{
            ...tooltipStyle,
            maxWidth: `${maxWidth}px`,
          }}
        >
          {content}
          {arrow && <div className={getArrowClasses()} />}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <div
        ref={triggerRef}
        className={clsx('inline-block', className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
        tabIndex={trigger === 'focus' ? 0 : undefined}
        role={trigger === 'click' ? 'button' : undefined}
        aria-describedby={isVisible ? 'tooltip' : undefined}
      >
        {children}
      </div>
      
      {typeof document !== 'undefined' && createPortal(tooltipContent, document.body)}
    </>
  );
};

export default Tooltip;
