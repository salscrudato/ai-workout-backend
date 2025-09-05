import React, { useEffect, useState } from 'react';
import { motion, useTransform, useScroll } from 'framer-motion';

export interface ParallaxContainerProps {
  children: React.ReactNode;
  speed?: number; // Parallax speed multiplier (0.1 to 2.0)
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
  offset?: number; // Initial offset
  disabled?: boolean; // Disable on mobile for performance
}

/**
 * Parallax Container Component
 * 
 * Provides smooth parallax scrolling effects with:
 * - Configurable speed and direction
 * - Performance optimized
 * - Mobile-friendly options
 * - Smooth transforms
 */
const ParallaxContainer: React.FC<ParallaxContainerProps> = ({
  children,
  speed = 0.5,
  direction = 'up',
  className,
  offset = 0,
  disabled = false,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const { scrollY } = useScroll();

  // Check if mobile to disable parallax for performance
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Transform scroll position based on direction and speed
  const transform = useTransform(
    scrollY,
    [0, 1000],
    direction === 'up' 
      ? [offset, offset - (1000 * speed)]
      : direction === 'down'
      ? [offset, offset + (1000 * speed)]
      : direction === 'left'
      ? [offset, offset - (1000 * speed)]
      : [offset, offset + (1000 * speed)]
  );

  // Don't apply parallax on mobile or when disabled
  if (disabled || isMobile) {
    return <div className={className}>{children}</div>;
  }

  const getTransformStyle = () => {
    switch (direction) {
      case 'up':
      case 'down':
        return { y: transform };
      case 'left':
      case 'right':
        return { x: transform };
      default:
        return { y: transform };
    }
  };

  return (
    <motion.div
      className={className}
      style={{
        ...getTransformStyle(),
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden',
      }}
    >
      {children}
    </motion.div>
  );
};

export default ParallaxContainer;
