import React, { useState } from 'react';
import { clsx } from 'clsx';
import { ChevronLeft, ChevronRight, Sparkles, Target, Zap } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import ProgressIndicator, { ProgressStep } from './ProgressIndicator';
import { Display, Heading, Body } from './Typography';

export interface WizardStep {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
  validation?: () => boolean;
}

export interface WorkoutWizardProps {
  steps: WizardStep[];
  onComplete: (data: any) => void;
  onCancel?: () => void;
  className?: string;
  motivationalMessages?: string[];
}

/**
 * Immersive Workout Wizard Component
 * 
 * Features:
 * - Step-by-step guided experience
 * - Blue gradient themes and glass morphism
 * - Motivational elements and animations
 * - Mobile-first responsive design
 * - Progress tracking with visual feedback
 * - Smooth transitions between steps
 */
const WorkoutWizard: React.FC<WorkoutWizardProps> = ({
  steps,
  onComplete,
  onCancel,
  className,
  motivationalMessages = [
    "Let's create your perfect workout! 💪",
    "You're doing great! Keep going! 🔥",
    "Almost there! Your workout awaits! ⚡",
    "Perfect! Time to crush your goals! 🎯"
  ]
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [wizardData, setWizardData] = useState<any>({});

  const progressSteps: ProgressStep[] = steps.map((step, index) => ({
    id: step.id,
    label: `Step ${index + 1}`,
    description: step.title,
  }));

  const canGoNext = () => {
    const step = steps[currentStep];
    return !step.validation || step.validation();
  };

  const canGoPrevious = () => {
    return currentStep > 0;
  };

  const handleNext = () => {
    if (canGoNext()) {
      if (currentStep < steps.length - 1) {
        setCompletedSteps(prev => [...prev, currentStep]);
        setCurrentStep(prev => prev + 1);
      } else {
        // Final step - complete wizard
        setCompletedSteps(prev => [...prev, currentStep]);
        onComplete(wizardData);
      }
    }
  };

  const handlePrevious = () => {
    if (canGoPrevious()) {
      setCurrentStep(prev => prev - 1);
      setCompletedSteps(prev => prev.filter(step => step !== currentStep - 1));
    }
  };

  const updateWizardData = (stepData: any) => {
    setWizardData(prev => ({
      ...prev,
      [steps[currentStep].id]: stepData,
    }));
  };

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const motivationalMessage = motivationalMessages[Math.min(currentStep, motivationalMessages.length - 1)];

  return (
    <div className={clsx('max-w-4xl mx-auto', className)}>
      {/* Header with Progress */}
      <div className="mb-8">
        <div className="text-center mb-6">
          <Display level={2} gradient color="blue" className="mb-2">
            AI Workout Generator
          </Display>
          <Body size={1} color="secondary" className="mb-4">
            {motivationalMessage}
          </Body>
          
          {/* Motivational Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 gradient-blue rounded-full shadow-glow-blue animate-bounce-gentle mb-6">
            {currentStep === 0 && <Sparkles className="w-8 h-8 text-white" />}
            {currentStep === 1 && <Target className="w-8 h-8 text-white" />}
            {currentStep >= 2 && <Zap className="w-8 h-8 text-white" />}
          </div>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator
          steps={progressSteps}
          currentStep={currentStep}
          completedSteps={completedSteps}
          variant="gradient"
          className="mb-6"
        />

        {/* Progress Bar */}
        <div className="w-full bg-secondary-200 rounded-full h-2 mb-2">
          <div 
            className="gradient-blue h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-center">
          <Body size={2} color="secondary">
            Step {currentStep + 1} of {steps.length}
          </Body>
        </div>
      </div>

      {/* Step Content */}
      <Card
        variant="glass"
        className="mb-8 animate-fade-in-up"
        key={currentStep} // Force re-render for animation
      >
        <div className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <Heading level={2} gradient color="deep" className="mb-2">
              {currentStepData.title}
            </Heading>
            <Body size={1} color="secondary">
              {currentStepData.description}
            </Body>
          </div>

          {/* Step Component */}
          <div className="min-h-[300px] flex items-center justify-center">
            {React.cloneElement(currentStepData.component as React.ReactElement, {
              onDataChange: updateWizardData,
              data: wizardData[currentStepData.id],
            } as any)}
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="lg"
          leftIcon={<ChevronLeft className="w-5 h-5" />}
          onClick={handlePrevious}
          disabled={!canGoPrevious()}
          className="min-w-[120px]"
        >
          Previous
        </Button>

        <div className="flex gap-3">
          {onCancel && (
            <Button
              variant="ghost"
              size="lg"
              onClick={onCancel}
              className="min-w-[100px]"
            >
              Cancel
            </Button>
          )}

          <Button
            variant="gradient"
            size="lg"
            rightIcon={
              currentStep === steps.length - 1 ? 
                <Zap className="w-5 h-5" /> : 
                <ChevronRight className="w-5 h-5" />
            }
            onClick={handleNext}
            disabled={!canGoNext()}
            className="min-w-[120px] shadow-glow-blue"
          >
            {currentStep === steps.length - 1 ? 'Generate' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutWizard;
