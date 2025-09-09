import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { clsx } from 'clsx';
import { CheckCircle2, Sparkles, Zap, Heart, Target } from 'lucide-react';

export interface EnhancedUserFlowProps {
  children: React.ReactNode;
  className?: string;
  enableMicroInteractions?: boolean;
  showProgressIndicator?: boolean;
  celebrateSuccess?: boolean;
}

export interface SuccessCelebrationProps {
  isVisible: boolean;
  message?: string;
  onComplete?: () => void;
  variant?: 'confetti' | 'sparkles' | 'pulse' | 'bounce';
}

export interface MicroInteractionProps {
  children: React.ReactNode;
  type?: 'hover' | 'tap' | 'focus' | 'success' | 'error';
  intensity?: 'subtle' | 'medium' | 'strong';
  className?: string;
}

/**
 * Enhanced User Flow Component
 * 
 * Provides sophisticated micro-interactions and user experience enhancements:
 * - Smooth page transitions
 * - Success celebrations with animations
 * - Micro-interactions for better feedback
 * - Progress indicators
 * - Haptic feedback simulation
 */

// Micro-interaction wrapper component
export const MicroInteraction: React.FC<MicroInteractionProps> = ({
  children,
  type = 'hover',
  intensity = 'medium',
  className,
}) => {
  const [isInteracting, setIsInteracting] = useState(false);
  const controls = useAnimation();

  const getAnimationVariants = () => {
    const intensityMap = {
      subtle: { scale: 1.02, y: -1 },
      medium: { scale: 1.05, y: -2 },
      strong: { scale: 1.08, y: -4 },
    };

    const baseVariants = {
      initial: { scale: 1, y: 0 },
      hover: intensityMap[intensity],
      tap: { scale: 0.98, y: 0 },
      focus: { ...intensityMap[intensity], boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.3)' },
      success: {
        scale: [1, 1.1, 1],
        rotate: [0, 5, -5, 0]
      },
      error: {
        x: [-10, 10, -10, 10, 0],
        transition: { duration: 0.4 },
      },
    };

    return baseVariants;
  };

  const variants = getAnimationVariants();

  const handleInteractionStart = () => {
    setIsInteracting(true);
    if ('vibrate' in navigator) {
      navigator.vibrate(10); // Haptic feedback
    }
  };

  const handleInteractionEnd = () => {
    setIsInteracting(false);
  };

  return (
    <motion.div
      className={clsx('cursor-pointer', className)}
      variants={variants}
      initial="initial"
      whileHover={type === 'hover' ? 'hover' : undefined}
      whileTap={type === 'tap' ? 'tap' : undefined}
      whileFocus={type === 'focus' ? 'focus' : undefined}
      animate={type === 'success' ? 'success' : type === 'error' ? 'error' : 'initial'}
      onHoverStart={handleInteractionStart}
      onHoverEnd={handleInteractionEnd}
      onTapStart={handleInteractionStart}
      onTap={handleInteractionEnd}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
      }}
    >
      {children}
    </motion.div>
  );
};

// Success celebration component
export const SuccessCelebration: React.FC<SuccessCelebrationProps> = ({
  isVisible,
  message = 'Success!',
  onComplete,
  variant = 'confetti',
}) => {
  useEffect(() => {
    if (isVisible && onComplete) {
      const timer = setTimeout(onComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  const getVariantAnimation = () => {
    switch (variant) {
      case 'confetti':
        return {
          initial: { scale: 0, rotate: -180, opacity: 0 },
          animate: { 
            scale: [0, 1.2, 1], 
            rotate: [0, 360, 720], 
            opacity: [0, 1, 1, 0],
            transition: { duration: 2.5, times: [0, 0.3, 0.8, 1] }
          },
        };
      case 'sparkles':
        return {
          initial: { scale: 0, opacity: 0 },
          animate: {
            scale: [0, 1.1, 1],
            opacity: [0, 1, 0]
          },
        };
      case 'pulse':
        return {
          initial: { scale: 1 },
          animate: { 
            scale: [1, 1.3, 1], 
            transition: { duration: 1.5, repeat: 2 }
          },
        };
      case 'bounce':
        return {
          initial: { y: -100, opacity: 0 },
          animate: { 
            y: [0, -20, 0], 
            opacity: [1, 1, 0],
            transition: { duration: 2, times: [0, 0.5, 1] }
          },
        };
      default:
        return {
          initial: { scale: 0, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
        };
    }
  };

  const variantAnimation = getVariantAnimation();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={clsx(
              'flex flex-col items-center justify-center',
              'bg-gradient-to-r from-primary-500 to-purple-500',
              'text-white rounded-3xl p-8 shadow-2xl',
              'border border-white/20'
            )}
            {...variantAnimation}
          >
            <motion.div
              className="mb-4"
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity
              }}
            >
              {variant === 'confetti' && <Sparkles className="w-12 h-12" />}
              {variant === 'sparkles' && <Zap className="w-12 h-12" />}
              {variant === 'pulse' && <Heart className="w-12 h-12" />}
              {variant === 'bounce' && <Target className="w-12 h-12" />}
            </motion.div>
            
            <motion.h2
              className="text-2xl font-bold mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {message}
            </motion.h2>
            
            <motion.div
              className="flex items-center text-white/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              <span>Well done!</span>
            </motion.div>
          </motion.div>

          {/* Floating particles for confetti variant */}
          {variant === 'confetti' && (
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-gradient-to-r from-primary-400 to-purple-400 rounded-full"
                  initial={{
                    x: '50vw',
                    y: '50vh',
                    scale: 0,
                  }}
                  animate={{
                    x: `${Math.random() * 100}vw`,
                    y: `${Math.random() * 100}vh`,
                    scale: [0, 1, 0],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    delay: Math.random() * 0.5,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Progress indicator component
export const ProgressIndicator: React.FC<{
  progress: number;
  showPercentage?: boolean;
  className?: string;
}> = ({ progress, showPercentage = true, className }) => {
  return (
    <div className={clsx('w-full', className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-neutral-600">Progress</span>
        {showPercentage && (
          <span className="text-sm font-semibold text-primary-600">
            {Math.round(progress)}%
          </span>
        )}
      </div>
      <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{
            duration: 0.8,
            ease: 'easeOut',
          }}
        />
      </div>
    </div>
  );
};

// Main enhanced user flow component
const EnhancedUserFlow: React.FC<EnhancedUserFlowProps> = ({
  children,
  className,
  enableMicroInteractions = true,
  showProgressIndicator = false,
  celebrateSuccess = false,
}) => {
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (celebrateSuccess) {
      setShowCelebration(true);
    }
  }, [celebrateSuccess]);

  return (
    <div className={clsx('relative', className)}>
      {enableMicroInteractions ? (
        <MicroInteraction type="hover" intensity="subtle">
          {children}
        </MicroInteraction>
      ) : (
        children
      )}

      <SuccessCelebration
        isVisible={showCelebration}
        onComplete={() => setShowCelebration(false)}
        variant="sparkles"
      />
    </div>
  );
};

EnhancedUserFlow.displayName = 'EnhancedUserFlow';

export default EnhancedUserFlow;
