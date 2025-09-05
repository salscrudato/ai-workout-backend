import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Sparkles, Target, Dumbbell, Heart } from 'lucide-react';
import Button from '../Button';
import { AnimatedContainer } from '../animations';
import { pageVariants } from '../animations/variants';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ComponentType<OnboardingStepProps>;
  validation?: (data: any) => boolean;
  optional?: boolean;
}

export interface OnboardingStepProps {
  data: any;
  onDataChange: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
  isValid: boolean;
}

export interface OnboardingFlowProps {
  steps: OnboardingStep[];
  onComplete: (data: any) => void;
  onSkip?: () => void;
  className?: string;
  showProgress?: boolean;
  allowSkip?: boolean;
}

/**
 * Intelligent Onboarding Flow Component
 * 
 * Features:
 * - Progressive disclosure of information
 * - Smooth step transitions
 * - Data validation and persistence
 * - Skip functionality for optional steps
 * - Progress tracking
 * - Responsive design
 */
const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  steps,
  onComplete,
  onSkip,
  className,
  showProgress = true,
  allowSkip = false,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<Record<string, any>>({});
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  // Validate current step
  const isCurrentStepValid = currentStepData.validation 
    ? currentStepData.validation(data[currentStepData.id])
    : true;

  const handleDataChange = (stepId: string, stepData: any) => {
    setData(prev => ({
      ...prev,
      [stepId]: stepData,
    }));
  };

  const handleNext = () => {
    if (isCurrentStepValid) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      
      if (isLastStep) {
        onComplete(data);
      } else {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    if (allowSkip && onSkip) {
      onSkip();
    }
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      {/* Progress Bar */}
      {showProgress && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-secondary-700">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-secondary-500">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
          <div className="w-full bg-secondary-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-primary-500 to-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* Step Indicators */}
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <motion.div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                index <= currentStep
                  ? 'bg-primary-500 border-primary-500 text-white'
                  : completedSteps.has(index)
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'bg-white border-secondary-300 text-secondary-400'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {completedSteps.has(index) ? (
                <Check className="w-5 h-5" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </motion.div>
            {index < steps.length - 1 && (
              <div
                className={`w-12 h-0.5 mx-2 transition-colors duration-300 ${
                  index < currentStep ? 'bg-primary-500' : 'bg-secondary-300'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="bg-white rounded-2xl shadow-soft border border-secondary-200 p-8"
        >
          {/* Step Header */}
          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-blue-600 rounded-2xl mb-4"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="text-white text-2xl">
                {currentStepData.icon}
              </div>
            </motion.div>
            <h2 className="text-2xl font-bold text-secondary-900 mb-2">
              {currentStepData.title}
            </h2>
            <p className="text-secondary-600 max-w-md mx-auto">
              {currentStepData.description}
            </p>
          </div>

          {/* Step Component */}
          <div className="mb-8">
            <currentStepData.component
              data={data[currentStepData.id]}
              onDataChange={(stepData) => handleDataChange(currentStepData.id, stepData)}
              onNext={handleNext}
              onPrev={handlePrev}
              isValid={isCurrentStepValid}
            />
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={isFirstStep}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>

            <div className="flex items-center gap-3">
              {allowSkip && currentStepData.optional && (
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-secondary-500"
                >
                  Skip for now
                </Button>
              )}
              
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={!isCurrentStepValid}
                rightIcon={
                  isLastStep ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )
                }
                className="min-w-[120px]"
              >
                {isLastStep ? 'Complete' : 'Next'}
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default OnboardingFlow;
