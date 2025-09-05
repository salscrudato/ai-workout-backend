import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Target } from 'lucide-react';
import Button from './Button';
import { clsx } from 'clsx';

export interface TourStep {
  id: string;
  target: string; // CSS selector
  title: string;
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  offset?: { x: number; y: number };
  optional?: boolean;
  action?: () => void;
}

export interface GuidedTourProps {
  steps: TourStep[];
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
  className?: string;
  showProgress?: boolean;
  allowSkip?: boolean;
  highlightPadding?: number;
}

/**
 * Guided Tour Component
 * 
 * Features:
 * - Interactive step-by-step guidance
 * - Element highlighting with spotlight effect
 * - Smooth transitions between steps
 * - Responsive positioning
 * - Skip and navigation controls
 * - Progress tracking
 */
const GuidedTour: React.FC<GuidedTourProps> = ({
  steps,
  isActive,
  onComplete,
  onSkip,
  className,
  showProgress = true,
  allowSkip = true,
  highlightPadding = 8,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});
  
  const tooltipRef = useRef<HTMLDivElement>(null);

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  // Find target element and update positions
  useEffect(() => {
    if (!isActive || !currentStepData) return;

    const element = document.querySelector(currentStepData.target) as HTMLElement;
    if (!element) return;

    setTargetElement(element);

    // Calculate highlight position
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    setHighlightStyle({
      position: 'absolute',
      top: rect.top + scrollTop - highlightPadding,
      left: rect.left + scrollLeft - highlightPadding,
      width: rect.width + highlightPadding * 2,
      height: rect.height + highlightPadding * 2,
      borderRadius: '8px',
      zIndex: 9998,
    });

    // Calculate tooltip position
    const calculateTooltipPosition = () => {
      const position = currentStepData.position || 'bottom';
      const offset = currentStepData.offset || { x: 0, y: 0 };
      
      let x = rect.left + scrollLeft + rect.width / 2;
      let y = rect.top + scrollTop;

      switch (position) {
        case 'top':
          y = rect.top + scrollTop - 20 + offset.y;
          break;
        case 'bottom':
          y = rect.bottom + scrollTop + 20 + offset.y;
          break;
        case 'left':
          x = rect.left + scrollLeft - 20 + offset.x;
          y = rect.top + scrollTop + rect.height / 2 + offset.y;
          break;
        case 'right':
          x = rect.right + scrollLeft + 20 + offset.x;
          y = rect.top + scrollTop + rect.height / 2 + offset.y;
          break;
        case 'center':
          x = window.innerWidth / 2 + offset.x;
          y = window.innerHeight / 2 + offset.y;
          break;
      }

      setTooltipPosition({ x, y });
    };

    calculateTooltipPosition();

    // Scroll element into view
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    });

    // Execute step action if provided
    if (currentStepData.action) {
      setTimeout(currentStepData.action, 500);
    }
  }, [currentStep, isActive, currentStepData, highlightPadding]);

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const handleClose = () => {
    onSkip();
  };

  if (!isActive || !currentStepData) return null;

  const tourContent = (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-[9997]"
        style={{ pointerEvents: 'none' }}
      />

      {/* Highlight */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        style={highlightStyle}
        className="border-4 border-primary-500 shadow-glow-blue pointer-events-none"
      />

      {/* Tooltip */}
      <motion.div
        ref={tooltipRef}
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className={clsx(
          'fixed z-[9999] bg-white rounded-xl shadow-2xl border border-secondary-200 p-6 max-w-sm',
          className
        )}
        style={{
          left: tooltipPosition.x,
          top: tooltipPosition.y,
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-secondary-400 hover:text-secondary-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step Icon */}
        <div className="flex items-center mb-4">
          <div className="bg-gradient-to-br from-primary-500 to-blue-600 w-10 h-10 rounded-lg flex items-center justify-center text-white mr-3">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-secondary-900">
              {currentStepData.title}
            </h3>
            {showProgress && (
              <p className="text-xs text-secondary-500">
                Step {currentStep + 1} of {steps.length}
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="mb-6 text-secondary-700">
          {currentStepData.content}
        </div>

        {/* Progress Bar */}
        {showProgress && (
          <div className="mb-6">
            <div className="w-full bg-secondary-200 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-primary-500 to-blue-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={isFirstStep}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>
            
            {allowSkip && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-secondary-500"
              >
                Skip Tour
              </Button>
            )}
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleNext}
            rightIcon={
              isLastStep ? (
                <Target className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )
            }
          >
            {isLastStep ? 'Finish' : 'Next'}
          </Button>
        </div>
      </motion.div>
    </>
  );

  return createPortal(
    <AnimatePresence>
      {isActive && tourContent}
    </AnimatePresence>,
    document.body
  );
};

export default GuidedTour;
