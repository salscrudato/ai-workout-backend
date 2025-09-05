import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

export interface CountUpAnimationProps {
  end: number;
  start?: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  onComplete?: () => void;
  triggerOnView?: boolean;
}

/**
 * Count Up Animation Component
 * 
 * Provides smooth number counting animations with:
 * - Customizable start and end values
 * - Decimal precision control
 * - Prefix and suffix support
 * - Intersection observer trigger
 * - Easing functions
 */
const CountUpAnimation: React.FC<CountUpAnimationProps> = ({
  end,
  start = 0,
  duration = 2000,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
  onComplete,
  triggerOnView = true,
}) => {
  const [count, setCount] = useState(start);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const startAnimation = () => {
    if (hasStarted) return;
    
    setHasStarted(true);
    const startTime = Date.now();
    const startValue = start;
    const difference = end - startValue;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + difference * easeOut;

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
        onComplete?.();
      }
    };

    requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (triggerOnView && isInView) {
      startAnimation();
    } else if (!triggerOnView) {
      startAnimation();
    }
  }, [isInView, triggerOnView]);

  const formatNumber = (num: number) => {
    return num.toFixed(decimals);
  };

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {prefix}{formatNumber(count)}{suffix}
    </motion.span>
  );
};

export default CountUpAnimation;
