import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { pageVariants } from './variants';

export interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Page Transition Component
 * 
 * Provides smooth page transitions with:
 * - Route-based animations
 * - Consistent timing and easing
 * - Performance optimized
 * - Accessibility support
 */
const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className,
}) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        className={className}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
