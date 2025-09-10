import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { clsx } from 'clsx';

// Icons - imported individually for better tree shaking
import {
  Clock,
  Target,
  CheckCircle,
  Sparkles
} from 'lucide-react';

// UI Components
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Display, Heading, Body } from '../components/ui/Typography';

// Contexts and hooks
import { useToast } from '../contexts/ToastContext';

// Types
import type { GenerateWorkoutRequest } from '../types/api';

// Utils
import { safeArrayFrom } from '../utils/profileUtils';

/**
 * Validation schema for workout generation form
 * Ensures all required fields are present and valid
 */
const workoutSchema = z.object({
  workoutType: z.string().min(1, 'Please select a workout type'),
  equipmentAvailable: z.array(z.string()).default([]),
  duration: z.number()
    .min(10, 'Minimum workout duration is 10 minutes')
    .max(180, 'Maximum workout duration is 180 minutes'),
  constraints: z.array(z.string()).default([]),
});

type WorkoutFormData = z.infer<typeof workoutSchema>;

/**
 * Available workout type options
 * Optimized as a constant to prevent re-creation on each render
 */
const WORKOUT_TYPE_OPTIONS = [
  'Chest/Triceps',
  'Back/Biceps',
  'Legs',
  'Shoulders',
  'Core',
  'Upper Body',
  'Lower Body',
  'Full Body',
  'Push',
  'Pull',
  'Cardio',
  'HIIT',
];

/**
 * Duration preset options for quick selection
 * Memoized to prevent re-creation on each render
 */
const DURATION_PRESETS = [
  { value: 15, label: '15 min', icon: '⚡' },
  { value: 30, label: '30 min', icon: '🎯' },
  { value: 45, label: '45 min', icon: '💪' },
  { value: 60, label: '60 min', icon: '🔥' },
  { value: 75, label: '75 min', icon: '💯' },
  { value: 90, label: '90 min', icon: '🚀' },
] as const;

/**
 * WorkoutGeneratorPage Component
 *
 * Provides an intuitive interface for generating AI-powered workout plans.
 * Features:
 * - Form validation with Zod schema
 * - Real-time progress tracking
 * - Optimized re-renders with React.memo and useCallback
 * - Accessibility support with ARIA labels
 * - Error handling with user-friendly messages
 */
const WorkoutGeneratorPage: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { showError, showSuccess, showInfo } = useToast();

  // Component state
  const [isGenerating, setIsGenerating] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Memoized default values to prevent form re-initialization
  const defaultValues = useMemo(() => ({
    workoutType: '',
    equipmentAvailable: safeArrayFrom(profile?.equipmentAvailable),
    duration: 30,
    constraints: safeArrayFrom(profile?.constraints),
  }), [profile]);

  // Form setup with React Hook Form
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutSchema),
    defaultValues,
    mode: 'onChange', // Enable real-time validation
  });

  const watchedValues = watch();

  // Update form when profile changes (memoized to prevent unnecessary updates)
  useEffect(() => {
    if (profile) {
      setValue('equipmentAvailable', safeArrayFrom(profile.equipmentAvailable));
      setValue('constraints', safeArrayFrom(profile.constraints));
    }
  }, [profile, setValue]);









  /**
   * Simulates progress for better user experience during AI generation
   * Provides visual feedback while the actual API call is in progress
   */
  const simulateProgress = useCallback(() => {
    setLoadingProgress(0);
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90; // Stop at 90% until actual completion
        }
        // Simulate realistic progress with some randomness
        return prev + Math.random() * 10 + 5;
      });
    }, 800);
    return interval;
  }, []);

  /**
   * Handles workout generation form submission
   * Includes retry logic, progress tracking, and comprehensive error handling
   */
  const onSubmit = useCallback(async (data: WorkoutFormData, attempt: number = 1) => {
    console.log(`🚀 Workout generation started (Attempt ${attempt})`);
    console.log('📋 Form data:', data);

    // Validation checks
    if (!user) {
      showError('Authentication Required', 'Please log in to generate workouts.');
      navigate('/');
      return;
    }

    if (!profile) {
      showError('Profile Required', 'Please complete your profile setup first.');
      navigate('/profile-setup');
      return;
    }

    try {
      setIsGenerating(true);
      setRetryCount(attempt - 1);

      // Start progress simulation and show user feedback
      const progressInterval = simulateProgress();
      showInfo(
        'Generating Your Workout',
        'Our AI is creating a personalized workout plan just for you. This may take up to 2 minutes.'
      );

      const workoutRequest: GenerateWorkoutRequest = {
        experience: profile.experience,
        goals: safeArrayFrom(profile.goals),
        workoutType: data.workoutType,
        equipmentAvailable: data.equipmentAvailable,
        duration: data.duration,
        constraints: data.constraints,
      };

      console.log('Sending workout request:', workoutRequest);

      const response = await apiClient.generateWorkout(workoutRequest);

      // Complete progress and show success
      clearInterval(progressInterval);
      setLoadingProgress(100);

      console.log('✅ Workout generated successfully:', response);
      showSuccess('Workout Generated!', 'Your personalized workout is ready.');

      setTimeout(() => {
        navigate(`/workout/${response.workoutId}`);
      }, 1000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const isTimeout = errorMessage.includes('timeout') || errorMessage.includes('timed out');

      console.error(`=== WORKOUT GENERATION ERROR (Attempt ${attempt}) ===`);
      console.error('Failed to generate workout:', error);

      // Retry logic for timeouts
      if (isTimeout && attempt < 3) {
        showInfo(
          'Retrying...',
          `Generation timed out. Retrying (${attempt + 1}/3)...`
        );

        // Exponential backoff: wait 2^attempt seconds
        setTimeout(() => {
          onSubmit(data, attempt + 1);
        }, Math.pow(2, attempt) * 1000);
        return;
      }

      // Final error handling
      setIsGenerating(false);
      setLoadingProgress(0);

      if (isTimeout) {
        showError(
          'Generation Timeout',
          'The AI is taking longer than expected. Please try again or contact support if this persists.'
        );
      } else {
        showError(
          'Generation Failed',
          errorMessage || 'Failed to generate workout. Please try again.'
        );
      }
    } finally {
      setIsGenerating(false);
      setLoadingProgress(0);
    }
  }, [user, profile, navigate, showError, showInfo, showSuccess, simulateProgress]);

  // Wrapper function for form submission that ensures proper parameter handling
  const handleFormSubmit = useCallback((data: WorkoutFormData) => {
    onSubmit(data, 1);
  }, [onSubmit]);

  // Show loading state while profile is being loaded
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your profile..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass rounded-2xl shadow-medium hover:shadow-glow-blue transition-all duration-300 animate-fade-in-up">
          <div className="gradient-blue-light p-8 border-b border-primary-200 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-200/30 rounded-full -translate-y-12 translate-x-12 animate-float"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-primary-300/20 rounded-full translate-y-8 -translate-x-8 animate-float" style={{animationDelay: '1s'}}></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="gradient-blue p-3 rounded-xl animate-glow">
                  <Sparkles className="w-6 h-6 text-white animate-bounce-gentle" />
                </div>
                <div>
                  <Display
                    level={2}
                    gradient="fresh"
                    animate="shimmer"
                    hover
                    className="mb-3 gentle-glow"
                  >
                    Create Your Perfect Workout
                  </Display>
                  <Body size={1} color="secondary" className="text-lg">
                    Choose your workout type and duration to get started
                  </Body>
                </div>
              </div>
            </div>
          </div>

          <form className="p-6 space-y-8">
            {/* Workout Type Selection */}
            <div>
              <Heading
                level={3}
                gradient="modern"
                hover
                className="mb-5 flex items-center gentle-glow"
              >
                <Target className="inline h-5 w-5 mr-2" />
                Workout Type
              </Heading>
              <div className="grid grid-cols-2 gap-3">
                {WORKOUT_TYPE_OPTIONS.map((type) => (
                  <label
                    key={type}
                    className={`relative flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 touch-target min-h-[60px] ${
                      watchedValues.workoutType === type
                        ? 'border-primary-500 bg-primary-50 shadow-lg shadow-primary-500/20 text-primary-800 scale-105'
                        : 'border-neutral-200 hover:border-primary-300 hover:bg-primary-50/30 hover:scale-102 active:scale-98'
                    }`}
                  >
                    <input
                      type="radio"
                      value={type}
                      {...register('workoutType')}
                      className="sr-only"
                    />
                    <div className="text-center w-full">
                      <div className="text-sm font-semibold leading-tight">{type}</div>
                    </div>

                    {/* Enhanced selection indicator - no dot, just highlight */}
                    {watchedValues.workoutType === type && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </label>
                ))}
              </div>
              {errors.workoutType && (
                <p className="text-sm text-red-600 mt-2">{errors.workoutType.message}</p>
              )}
            </div>

            {/* Enhanced Duration Selection - Mobile Optimized */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="gradient-purple p-2.5 rounded-lg premium-shadow-sm">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold gradient-text-purple">
                    Workout Duration
                  </h3>
                  <p className="text-neutral-600 text-sm">
                    How long do you want to work out?
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {DURATION_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setValue('duration', preset.value)}
                    className={`relative p-4 border-2 rounded-xl text-center transition-all duration-300 touch-target min-h-[70px] flex flex-col items-center justify-center ${
                      watchedValues.duration === preset.value
                        ? 'border-purple-500 bg-purple-50 shadow-lg shadow-purple-500/20 text-purple-800 scale-105'
                        : 'border-neutral-200 hover:border-purple-300 hover:bg-purple-50/30 hover:scale-102 active:scale-98'
                    }`}
                  >
                    <div className="text-xl mb-1">{preset.icon}</div>
                    <div className="text-sm font-semibold">{preset.label}</div>

                    {/* Selection indicator */}
                    {watchedValues.duration === preset.value && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Custom duration input - Mobile optimized */}
              <div className="mt-6 p-4 glass-light rounded-xl">
                <label className="block text-sm font-medium text-neutral-700 mb-3">
                  Or enter custom duration (10-180 minutes)
                </label>
                <input
                  type="number"
                  min="10"
                  max="180"
                  {...register('duration', { valueAsNumber: true })}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200 text-base touch-target"
                  placeholder="Enter minutes..."
                />
              </div>

              {errors.duration && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 font-medium">{errors.duration.message}</p>
                </div>
              )}
            </div>





            {/* Generate Button with Enhanced Loading */}
            <div className="pt-6 border-t border-secondary-200">
              {isGenerating && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <Body size={2} color="secondary">
                      Generating your workout...
                    </Body>
                    <Body size={2} color="secondary">
                      {Math.round(loadingProgress)}%
                    </Body>
                  </div>
                  <div className="w-full bg-secondary-200 rounded-full h-2">
                    <div
                      className="gradient-blue h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${loadingProgress}%` }}
                    />
                  </div>
                  {retryCount > 0 && (
                    <Body size={2} color="secondary" className="mt-2 text-center">
                      Retry attempt {retryCount + 1}/3
                    </Body>
                  )}
                </div>
              )}

              <button
                type="button"
                disabled={isGenerating}
                onClick={handleSubmit(handleFormSubmit)}
                className={clsx(
                  'w-full flex items-center justify-center px-6 py-5 text-lg font-bold',
                  'rounded-2xl transition-all duration-300 transform touch-target min-h-[60px]',
                  'focus:outline-none focus:ring-4 focus:ring-primary-500/50 focus:scale-105',
                  'shadow-lg hover:shadow-xl',
                  isGenerating
                    ? 'bg-neutral-300 text-neutral-600 cursor-not-allowed'
                    : 'gradient-aurora text-white hover:shadow-glow-blue hover:scale-105 active:scale-95'
                )}
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3" />
                    <span>{retryCount > 0 ? 'Retrying...' : 'Generating...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-6 w-6 mr-3 animate-pulse" />
                    <span>Generate AI Workout</span>
                  </>
                )}
              </button>

              <Body size={2} color="secondary" className="text-center mt-3">
                {isGenerating
                  ? 'Our AI is creating your personalized workout. This may take up to 2 minutes.'
                  : 'This may take a few seconds while our AI creates your personalized workout'
                }
              </Body>
            </div>
        </form>
      </div>
    </div>
  );
};

export default WorkoutGeneratorPage;
