import React, { useEffect, useRef } from 'react';
import { motion, HTMLMotionProps, useReducedMotion } from 'framer-motion';
import {
  pageVariants,
  pageFadeScaleVariants,
  pageSlideVariants,
  staggerContainer,
  staggerItem,
  enhancedStaggerContainer,
  enhancedStaggerItem,
  morphVariants,
  floatVariants,
  textRevealVariants,
  premiumCardVariants
} from './variants';

export interface AnimatedContainerProps extends HTMLMotionProps<'div'> {
  variant?: 'page' | 'page-fade-scale' | 'page-slide' | 'stagger' | 'enhanced-stagger' | 'morph' | 'float' | 'text-reveal' | 'premium-card' | 'custom';
  stagger?: boolean;
  delay?: number;
  direction?: number; // For slide animations
  children: React.ReactNode;
}

/**
 * Animated Container Component
 * 
 * Provides consistent page and container animations with:
 * - Page transition animations
 * - Stagger animations for child elements
 * - Custom animation variants
 * - Performance optimized with transform-gpu
 */
const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  variant = 'page',
  stagger = false,
  delay = 0,
  direction = 1,
  children,
  className,
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  // Performance optimization: set will-change property
  useEffect(() => {
    const element = containerRef.current;
    if (element && !shouldReduceMotion) {
      element.style.willChange = 'transform, opacity';
      element.style.backfaceVisibility = 'hidden';

      return () => {
        element.style.willChange = 'auto';
        element.style.backfaceVisibility = '';
      };
    }
  }, [shouldReduceMotion]);
  const getVariants = () => {
    switch (variant) {
      case 'page':
        return pageVariants;
      case 'page-fade-scale':
        return pageFadeScaleVariants;
      case 'page-slide':
        return pageSlideVariants;
      case 'stagger':
        return stagger ? staggerContainer : staggerItem;
      case 'enhanced-stagger':
        return stagger ? enhancedStaggerContainer : enhancedStaggerItem;
      case 'morph':
        return morphVariants;
      case 'float':
        return floatVariants;
      case 'text-reveal':
        return textRevealVariants;
      case 'premium-card':
        return premiumCardVariants;
      case 'custom':
        return props.variants;
      default:
        return pageVariants;
    }
  };

  const getInitial = () => {
    if (variant === 'custom' && props.initial) return props.initial;
    return 'initial';
  };

  const getAnimate = () => {
    if (variant === 'custom' && props.animate) return props.animate;
    return 'animate';
  };

  const getTransition = () => {
    const baseTransition = props.transition || {};
    return delay > 0 ? { ...baseTransition, delay } : baseTransition;
  };

  return (
    <motion.div
      className={className}
      variants={getVariants()}
      initial={getInitial()}
      animate={getAnimate()}
      exit="exit"
      transition={getTransition()}
      style={{
        transformStyle: shouldReduceMotion ? 'flat' : 'preserve-3d',
        backfaceVisibility: shouldReduceMotion ? 'visible' : 'hidden',
        willChange: shouldReduceMotion ? 'auto' : 'transform, opacity',
        ...props.style,
      }}
      {...props}
    >
      {(stagger && (variant === 'stagger' || variant === 'enhanced-stagger')) ? (
        React.Children.map(children, (child, index) => (
          <motion.div
            key={index}
            variants={variant === 'enhanced-stagger' ? enhancedStaggerItem : staggerItem}
            custom={direction}
            style={{
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'hidden',
              willChange: 'transform, opacity',
            }}
          >
            {child}
          </motion.div>
        ))
      ) : (
        children
      )}
    </motion.div>
  );
};

export default AnimatedContainer;
