import React, { useState } from 'react';
import { motion, HTMLMotionProps, useAnimation } from 'framer-motion';
import { buttonVariants, cardVariants } from './variants';

export type MicroInteractionType = 'button' | 'card' | 'icon' | 'custom';

export interface MicroInteractionProps extends HTMLMotionProps<'div'> {
  type?: MicroInteractionType;
  disabled?: boolean;
  loading?: boolean;
  success?: boolean;
  error?: boolean;
  hapticFeedback?: boolean;
  children: React.ReactNode;
  onInteraction?: () => void;
}

/**
 * Micro Interaction Component
 * 
 * Provides delightful micro-interactions with:
 * - Hover, tap, and focus animations
 * - Success and error state animations
 * - Haptic feedback for mobile devices
 * - Loading state animations
 * - Accessibility support
 */
const MicroInteraction: React.FC<MicroInteractionProps> = ({
  type = 'button',
  disabled = false,
  loading = false,
  success = false,
  error = false,
  hapticFeedback = true,
  children,
  onInteraction,
  className,
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const controls = useAnimation();

  const getVariants = () => {
    switch (type) {
      case 'button':
        return buttonVariants;
      case 'card':
        return cardVariants;
      case 'icon':
        return {
          initial: { scale: 1, rotate: 0 },
          hover: { scale: 1.1, rotate: 5 },
          tap: { scale: 0.9, rotate: -5 },
        };
      case 'custom':
        return props.variants;
      default:
        return buttonVariants;
    }
  };

  const handleTapStart = () => {
    if (disabled) return;
    
    setIsPressed(true);
    
    // Haptic feedback for mobile devices
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10); // Short vibration
    }
    
    onInteraction?.();
  };

  const handleTapEnd = () => {
    setIsPressed(false);
  };

  const handleHoverStart = () => {
    if (disabled) return;
    controls.start('hover');
  };

  const handleHoverEnd = () => {
    if (disabled) return;
    controls.start('initial');
  };

  // Success animation
  React.useEffect(() => {
    if (success) {
      controls.start({
        scale: [1, 1.1, 1],
        backgroundColor: ['#3b82f6', '#10b981', '#3b82f6'],
        transition: { duration: 0.6 },
      });
    }
  }, [success, controls]);

  // Error animation
  React.useEffect(() => {
    if (error) {
      controls.start({
        x: [0, -10, 10, -10, 10, 0],
        backgroundColor: ['#3b82f6', '#ef4444', '#3b82f6'],
        transition: { duration: 0.6 },
      });
    }
  }, [error, controls]);

  // Loading animation
  React.useEffect(() => {
    if (loading) {
      controls.start('loading');
    } else {
      controls.start('initial');
    }
  }, [loading, controls]);

  const getCurrentVariant = () => {
    if (loading) return 'loading';
    if (isPressed) return 'tap';
    return 'initial';
  };

  return (
    <motion.div
      className={className}
      variants={getVariants()}
      initial="initial"
      animate={controls}
      whileHover={!disabled ? 'hover' : undefined}
      whileTap={!disabled ? 'tap' : undefined}
      onTapStart={handleTapStart}
      onTapCancel={handleTapEnd}
      onTap={handleTapEnd}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      style={{
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden',
        ...props.style,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default MicroInteraction;
