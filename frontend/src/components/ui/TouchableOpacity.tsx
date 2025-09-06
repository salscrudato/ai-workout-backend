import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';
import { safeVibrate } from '../../utils/userInteraction';

export type HapticFeedback = 'light' | 'medium' | 'heavy' | 'none';
export type TouchableVariant = 'default' | 'card' | 'button' | 'icon';

export interface TouchableOpacityProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  hapticFeedback?: HapticFeedback;
  variant?: TouchableVariant;
  activeScale?: number;
  activeOpacity?: number;
  className?: string;
}

/**
 * TouchableOpacity Component
 * 
 * Provides native-like touch interactions for mobile devices with:
 * - Haptic feedback simulation
 * - Customizable press animations
 * - Accessibility support
 * - Performance optimized
 */
const TouchableOpacity = forwardRef<HTMLDivElement, TouchableOpacityProps>(({
  children,
  onPress,
  disabled = false,
  hapticFeedback = 'light',
  variant = 'default',
  activeScale = 0.96,
  activeOpacity = 0.8,
  className,
  ...props
}, ref) => {
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'card':
        return 'rounded-xl p-4 bg-white shadow-soft hover:shadow-medium';
      case 'button':
        return 'rounded-lg px-4 py-2 bg-primary-500 text-white';
      case 'icon':
        return 'rounded-full p-2 flex items-center justify-center';
      default:
        return '';
    }
  };

  const getHapticClass = () => {
    if (hapticFeedback === 'none') return '';
    return `haptic-${hapticFeedback}`;
  };

  const handlePress = () => {
    if (disabled || !onPress) return;

    // Simulate haptic feedback with visual cues (only after user interaction)
    if (hapticFeedback !== 'none') {
      const vibrationPattern = {
        light: [10],
        medium: [20],
        heavy: [30, 10, 30],
      };
      // Use safe vibration that respects user interaction requirements
      safeVibrate(vibrationPattern[hapticFeedback] || [10]);
    }

    onPress();
  };

  return (
    <motion.div
      ref={ref}
      className={clsx(
        'mobile-touch cursor-pointer select-none',
        'transition-all duration-150 ease-out',
        getVariantStyles(),
        getHapticClass(),
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className
      )}
      whileTap={!disabled ? {
        scale: activeScale,
        opacity: activeOpacity,
        transition: { duration: 0.1 }
      } : undefined}
      whileHover={!disabled ? {
        scale: 1.02,
        transition: { duration: 0.2 }
      } : undefined}
      onClick={handlePress}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
          e.preventDefault();
          handlePress();
        }
      }}
      style={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        willChange: 'transform, opacity',
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
});

TouchableOpacity.displayName = 'TouchableOpacity';

export default TouchableOpacity;
