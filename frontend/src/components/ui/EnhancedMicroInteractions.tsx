import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { clsx } from 'clsx';

/**
 * Enhanced Micro-Interactions Component Library
 * 
 * Provides sophisticated animations and interactions that enhance user experience
 * while maintaining performance and accessibility standards.
 */

// Floating Action Button with enhanced interactions
export interface FloatingActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label?: string;
  variant?: 'primary' | 'secondary' | 'success';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  icon,
  label = 'Action',
  variant = 'primary',
  size = 'md',
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16',
  };

  const variantClasses = {
    primary: 'gradient-aurora shadow-glow-blue',
    secondary: 'gradient-purple shadow-glow-purple',
    success: 'gradient-blue shadow-glow-green',
  };

  return (
    <motion.button
      className={clsx(
        'fixed bottom-6 right-6 z-50 rounded-full flex items-center justify-center',
        'premium-shadow-xl transition-all duration-300 touch-target',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.95, rotate: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onTapStart={() => setIsPressed(true)}
      onTapEnd={() => setIsPressed(false)}
      onClick={onClick}
      aria-label={label}
    >
      <motion.div
        animate={{
          scale: isPressed ? 0.8 : isHovered ? 1.2 : 1,
          rotate: isHovered ? 360 : 0,
        }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="text-white"
      >
        {icon}
      </motion.div>

      {/* Ripple effect */}
      <motion.div
        className="absolute inset-0 rounded-full bg-white/20"
        initial={{ scale: 0, opacity: 0 }}
        animate={isPressed ? { scale: 1.5, opacity: [0, 1, 0] } : {}}
        transition={{ duration: 0.6 }}
      />
    </motion.button>
  );
};

// Enhanced Card with hover effects
export interface InteractiveCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  hoverEffect?: 'lift' | 'glow' | 'scale' | 'tilt';
  glowColor?: 'blue' | 'purple' | 'green';
}

export const InteractiveCard: React.FC<InteractiveCardProps> = ({
  children,
  onClick,
  className,
  hoverEffect = 'lift',
  glowColor = 'blue',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const hoverVariants = {
    lift: {
      y: -8,
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    },
    glow: {
      boxShadow: `0 0 30px rgba(${glowColor === 'blue' ? '59, 130, 246' : glowColor === 'purple' ? '147, 51, 234' : '34, 197, 94'}, 0.4)`,
    },
    scale: {
      scale: 1.03,
    },
    tilt: {
      rotateY: 5,
      rotateX: 5,
    },
  };

  return (
    <motion.div
      ref={ref}
      className={clsx(
        'glass-premium rounded-2xl p-6 cursor-pointer transition-all duration-300',
        onClick && 'touch-target',
        className
      )}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      whileHover={hoverVariants[hoverEffect]}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

// Animated Counter
export interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 2,
  className,
  prefix = '',
  suffix = '',
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOutCubic * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration, isInView]);

  return (
    <span ref={ref} className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

// Progress Ring
export interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  className?: string;
  children?: React.ReactNode;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color = '#3B82F6',
  backgroundColor = '#E5E7EB',
  className,
  children,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={clsx('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          strokeLinecap="round"
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
};

// Stagger Animation Container
export interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  staggerDelay = 0.1,
  className,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};
