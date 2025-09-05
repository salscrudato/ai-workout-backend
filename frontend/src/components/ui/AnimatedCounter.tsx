import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';

export interface AnimatedCounterProps {
  value: number;
  duration?: number;
  delay?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  decimals?: number;
  separator?: string;
}

/**
 * Animated Counter Component
 * 
 * Features:
 * - Smooth number animations with easing
 * - Customizable duration and delay
 * - Support for prefixes, suffixes, and decimals
 * - Mobile-optimized performance
 * - Intersection Observer for performance
 */
const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 2000,
  delay = 0,
  suffix = '',
  prefix = '',
  className,
  decimals = 0,
  separator = ',',
}) => {
  const [currentValue, setCurrentValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Intersection Observer for performance optimization
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById(`counter-${Math.random()}`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  // Animation logic with easing
  useEffect(() => {
    if (!isVisible || hasAnimated) return;

    const startTime = Date.now() + delay;
    const endTime = startTime + duration;

    const animate = () => {
      const now = Date.now();
      
      if (now < startTime) {
        requestAnimationFrame(animate);
        return;
      }

      if (now >= endTime) {
        setCurrentValue(value);
        setHasAnimated(true);
        return;
      }

      // Easing function (ease-out cubic)
      const progress = (now - startTime) / duration;
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      
      setCurrentValue(value * easedProgress);
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [isVisible, value, duration, delay, hasAnimated]);

  // Format number with separators
  const formatNumber = (num: number): string => {
    const rounded = Number(num.toFixed(decimals));
    const parts = rounded.toString().split('.');
    
    // Add thousand separators
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    
    return parts.join('.');
  };

  return (
    <span
      id={`counter-${Math.random()}`}
      className={clsx(
        'inline-block font-mono font-bold tabular-nums',
        'transition-all duration-300',
        className
      )}
    >
      {prefix}{formatNumber(currentValue)}{suffix}
    </span>
  );
};

export default AnimatedCounter;
