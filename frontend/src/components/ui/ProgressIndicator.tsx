import React from 'react';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';

export interface ProgressStep {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface ProgressIndicatorProps {
  steps: ProgressStep[];
  currentStep: number;
  completedSteps?: number[];
  variant?: 'default' | 'blue' | 'gradient';
  orientation?: 'horizontal' | 'vertical';
  showLabels?: boolean;
  className?: string;
}

/**
 * Enhanced Progress Indicator with Blue Gradients
 * 
 * Features:
 * - Horizontal and vertical orientations
 * - Blue gradient themes
 * - Animated transitions
 * - Mobile-first responsive design
 * - Step completion indicators
 * - Motivational visual feedback
 */
const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep,
  completedSteps = [],
  variant = 'blue',
  orientation = 'horizontal',
  showLabels = true,
  className,
}) => {
  const totalSteps = steps.length;
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    'matchMedia' in window &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const isStepCompleted = (stepIndex: number) => {
    return completedSteps.includes(stepIndex) || stepIndex < currentStep;
  };

  const isStepActive = (stepIndex: number) => {
    return stepIndex === currentStep;
  };

  const getStepVariant = (stepIndex: number) => {
    if (isStepCompleted(stepIndex)) return 'completed';
    if (isStepActive(stepIndex)) return 'active';
    return 'pending';
  };

  const stepStyles = {
    completed: {
      default: 'bg-green-500 text-white border-green-500',
      blue: 'gradient-blue text-white border-primary-500 shadow-glow-blue',
      gradient: 'gradient-blue-deep text-white border-primary-600 shadow-glow-blue',
    },
    active: {
      default: 'bg-primary-500 text-white border-primary-500',
      blue: 'gradient-blue-cyan text-white border-primary-500 shadow-glow-blue animate-pulse motion-reduce:animate-none',
      gradient: 'gradient-blue-deep text-white border-primary-600 shadow-glow-blue animate-pulse motion-reduce:animate-none',
    },
    pending: {
      default: 'bg-secondary-100 text-secondary-500 border-secondary-300',
      blue: 'bg-primary-50 text-primary-400 border-primary-200',
      gradient: 'bg-primary-50 text-primary-400 border-primary-200',
    },
  };

  const connectorStyles = {
    completed: {
      default: 'bg-green-500',
      blue: 'gradient-blue',
      gradient: 'gradient-blue-deep',
    },
    pending: {
      default: 'bg-secondary-200',
      blue: 'bg-primary-200',
      gradient: 'bg-primary-200',
    },
  };

  if (orientation === 'vertical') {
    return (
      <div role="list" aria-label="Progress steps" className={clsx('flex flex-col', className)}>
        {steps.map((step, index) => {
          const stepVariant = getStepVariant(index);
          const isLast = index === steps.length - 1;
          
          return (
            <div
              key={step.id}
              className="flex items-start"
              role="listitem"
              aria-current={isStepActive(index) ? 'step' : undefined}
              aria-label={`Step ${index + 1} of ${totalSteps}: ${step.label}${isStepCompleted(index) ? ' (completed)' : isStepActive(index) ? ' (current)' : ''}`}
            >
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={clsx(
                    'w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center',
                    'transition-all duration-300 transform-gpu motion-reduce:transform-none motion-reduce:transition-none',
                    stepStyles[stepVariant][variant],
                    isStepActive(index) && 'scale-110'
                  )}
                >
                  {isStepCompleted(index) ? (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>
                
                {/* Connector */}
                {!isLast && (
                  <div
                    className={clsx(
                      'w-0.5 h-8 sm:h-12 mt-2',
                      'transition-all duration-300 motion-reduce:transition-none',
                      isStepCompleted(index)
                        ? connectorStyles.completed[variant]
                        : connectorStyles.pending[variant]
                    )}
                  />
                )}
              </div>
              
              {/* Step Content */}
              {showLabels && (
                <div className="ml-4 pb-8">
                  <h4
                    className={clsx(
                      'text-sm sm:text-base font-medium',
                      isStepActive(index) ? 'gradient-text-blue' : 'text-secondary-900'
                    )}
                  >
                    {step.label}
                  </h4>
                  {step.description && (
                    <p className="text-xs sm:text-sm text-secondary-600 mt-1">
                      {step.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal orientation
  return (
    <div role="list" aria-label="Progress steps" className={clsx('flex items-center justify-between w-full', className)}>
      {steps.map((step, index) => {
        const stepVariant = getStepVariant(index);
        const isLast = index === steps.length - 1;
        
        return (
          <React.Fragment key={step.id}>
            <div
              className="flex flex-col items-center"
              role="listitem"
              aria-current={isStepActive(index) ? 'step' : undefined}
              aria-label={`Step ${index + 1} of ${totalSteps}: ${step.label}${isStepCompleted(index) ? ' (completed)' : isStepActive(index) ? ' (current)' : ''}`}
            >
              {/* Step Circle */}
              <div
                className={clsx(
                  'w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center',
                  'transition-all duration-300 transform-gpu motion-reduce:transform-none motion-reduce:transition-none',
                  stepStyles[stepVariant][variant],
                  isStepActive(index) && 'scale-110'
                )}
              >
                {isStepCompleted(index) ? (
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </div>
              
              {/* Step Label */}
              {showLabels && (
                <div className="mt-2 text-center max-w-20 sm:max-w-24">
                  <p
                    className={clsx(
                      'text-xs sm:text-sm font-medium truncate',
                      isStepActive(index) ? 'gradient-text-blue' : 'text-secondary-700'
                    )}
                  >
                    {step.label}
                  </p>
                </div>
              )}
            </div>
            
            {/* Connector */}
            {!isLast && (
              <div
                className={clsx(
                  'flex-1 h-0.5 mx-2 sm:mx-4',
                  'transition-all duration-300 motion-reduce:transition-none',
                  isStepCompleted(index)
                    ? connectorStyles.completed[variant]
                    : connectorStyles.pending[variant]
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default ProgressIndicator;
