import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { clsx } from 'clsx';
import {
  ArrowLeft,
  Zap,
  Clock,
  Target,
  Sparkles,
  Dumbbell,
  Activity,
  Settings,
  CheckCircle
} from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import WorkoutWizard from '../components/ui/WorkoutWizard';
import { Display, Heading, Body } from '../components/ui/Typography';
import { useToast } from '../contexts/ToastContext';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import type { GenerateWorkoutRequest } from '../types/api';

// Validation schema
const workoutSchema = z.object({
  workoutType: z.string().min(1, 'Please select a workout type'),
  equipmentAvailable: z.array(z.string()),
  duration: z.number().min(10, 'Minimum 10 minutes').max(120, 'Maximum 120 minutes'),
  constraints: z.array(z.string()),
});

type WorkoutFormData = z.infer<typeof workoutSchema>;

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

const DURATION_PRESETS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '60 min' },
  { value: 75, label: '75 min' },
  { value: 90, label: '90 min' },
];

const WorkoutGeneratorPage: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();


  const [isLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const { showError, showSuccess, showInfo } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      workoutType: '',
      equipmentAvailable: Array.from(profile?.equipmentAvailable || []),
      duration: 30,
      constraints: Array.from(profile?.constraints || []),
    },
  });

  const watchedValues = watch();

  // Update form when profile changes
  useEffect(() => {
    if (profile) {
      setValue('equipmentAvailable', Array.from(profile.equipmentAvailable));
      setValue('constraints', Array.from(profile.constraints));
    }
  }, [profile, setValue]);









  // Enhanced progress simulation for better UX
  const simulateProgress = () => {
    setLoadingProgress(0);
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90; // Stop at 90% until actual completion
        }
        return prev + Math.random() * 15;
      });
    }, 1000);
    return interval;
  };

  const onSubmit = async (data: WorkoutFormData, attempt = 1) => {
    console.log(`=== WORKOUT GENERATION START (Attempt ${attempt}) ===`);
    console.log('Form submitted with data:', data);

    if (!user) {
      showError('Authentication Required', 'Please log in to generate workouts.');
      navigate('/');
      return;
    }

    if (!profile) {
      showError('Profile Required', 'Please complete your profile first.');
      navigate('/profile');
      return;
    }

    try {
      setIsGenerating(true);
      setRetryCount(attempt - 1);

      // Show progress and info toast
      const progressInterval = simulateProgress();
      showInfo(
        'Generating Your Workout',
        'Our AI is creating a personalized workout just for you. This may take up to 2 minutes.'
      );

      const workoutRequest: GenerateWorkoutRequest = {
        experience: profile.experience,
        goals: Array.from(profile.goals),
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
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading generator..." />
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {WORKOUT_TYPE_OPTIONS.map((type) => (
                  <label
                    key={type}
                    className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 mobile-touch group ${
                      watchedValues.workoutType === type
                        ? 'border-primary-500 gradient-blue-light shadow-glow-blue'
                        : 'border-secondary-200 hover:border-primary-300 hover:shadow-medium glass'
                    }`}
                  >
                    <input
                      type="radio"
                      value={type}
                      {...register('workoutType')}
                      className="sr-only"
                    />
                    <div className="flex-1 text-sm font-medium text-center">{type}</div>
                  </label>
                ))}
              </div>
              {errors.workoutType && (
                <p className="text-sm text-red-600 mt-2">{errors.workoutType.message}</p>
              )}
            </div>

            {/* Duration Selection */}
            <div>
              <Heading
                level={3}
                gradient="modern"
                hover
                className="mb-5 flex items-center gentle-glow"
              >
                <Clock className="inline h-5 w-5 mr-2" />
                Workout Duration
              </Heading>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {DURATION_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setValue('duration', preset.value)}
                    className={`p-4 border rounded-lg text-center transition-colors ${
                      watchedValues.duration === preset.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-secondary-200 hover:border-secondary-300'
                    }`}
                  >
                    <div className="font-semibold">{preset.label}</div>
                  </button>
                ))}
              </div>
              {errors.duration && (
                <p className="text-sm text-red-600 mt-2">{errors.duration.message}</p>
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
                onClick={handleSubmit(onSubmit as any)}
                className={clsx(
                  'w-full flex items-center justify-center px-6 py-4 text-lg font-semibold',
                  'rounded-xl transition-all duration-300 transform mobile-touch',
                  'focus:outline-none focus:ring-4 focus:ring-primary-500/50',
                  isGenerating
                    ? 'bg-secondary-300 text-secondary-600 cursor-not-allowed'
                    : 'gradient-blue text-white hover:shadow-glow-blue hover:scale-105 active:scale-95'
                )}
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3" />
                    {retryCount > 0 ? 'Retrying...' : 'Generating...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-6 w-6 mr-2" />
                    Generate AI Workout
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
