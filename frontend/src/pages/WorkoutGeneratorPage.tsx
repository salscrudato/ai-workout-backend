import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Zap,
  Clock,
  Target,
  Sparkles
} from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
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
      equipmentAvailable: profile?.equipmentAvailable || [],
      duration: 30,
      constraints: profile?.constraints || [],
    },
  });

  const watchedValues = watch();

  // Update form when profile changes
  useEffect(() => {
    if (profile) {
      setValue('equipmentAvailable', profile.equipmentAvailable);
      setValue('constraints', profile.constraints);
    }
  }, [profile, setValue]);









  const onSubmit = async (data: WorkoutFormData) => {
    console.log('=== WORKOUT GENERATION START ===');
    console.log('Form submitted with data:', data);
    console.log('Current user:', user);
    console.log('Current profile:', profile);



    if (!user) {
      console.error('No user found - redirecting to login');
      navigate('/');
      return;
    }

    if (!profile) {
      console.error('No profile found - please complete your profile first');
      alert('Please complete your profile first before generating workouts.');
      navigate('/profile');
      return;
    }

    try {
      setIsGenerating(true);

      const workoutRequest: GenerateWorkoutRequest = {
        experience: profile.experience,
        goals: profile.goals,
        workoutType: data.workoutType,
        equipmentAvailable: data.equipmentAvailable,
        duration: data.duration,
        constraints: data.constraints,
      };

      console.log('Sending workout request:', workoutRequest);
      console.log('🔄 Using apiClient to generate workout...');

      // Use the apiClient which handles the correct baseURL and authentication
      const response = await apiClient.generateWorkout(workoutRequest);

      console.log('✅ Workout generated successfully:', response);

      navigate(`/workout/${response.workoutId}`);
    } catch (error) {
      const errorDetails = {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        response: (error as any)?.response?.data,
        status: (error as any)?.response?.status,
      };

      console.error('=== WORKOUT GENERATION ERROR ===');
      console.error('Failed to generate workout:', error);
      console.error('Error details:', errorDetails);

      // Show error to user instead of silent failure
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to generate workout: ${errorMessage}\n\nCheck console for details.`);
    } finally {
      setIsGenerating(false);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-secondary-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="flex items-center text-secondary-600 hover:text-secondary-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="bg-primary-600 p-2 rounded-lg">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-secondary-900">Generate Workout</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-secondary-200">
            <div>
              <h2 className="text-2xl font-bold text-secondary-900 mb-2">
                Create Your Perfect Workout
              </h2>
              <p className="text-secondary-600">
                Choose your workout type and duration to get started
              </p>
            </div>
          </div>

          <form className="p-6 space-y-8">
            {/* Workout Type Selection */}
            <div>
              <label className="block text-lg font-semibold text-secondary-900 mb-4">
                <Target className="inline h-5 w-5 mr-2" />
                Workout Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {WORKOUT_TYPE_OPTIONS.map((type) => (
                  <label
                    key={type}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      watchedValues.workoutType === type
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-secondary-200 hover:border-secondary-300'
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
              <label className="block text-lg font-semibold text-secondary-900 mb-4">
                <Clock className="inline h-5 w-5 mr-2" />
                Workout Duration
              </label>
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





            {/* Generate Button */}
            <div className="pt-6 border-t border-secondary-200">
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleSubmit(onSubmit)}
                className="w-full flex items-center justify-center px-6 py-4 text-lg font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isGenerating ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Sparkles className="h-6 w-6 mr-2" />
                    Generate AI Workout
                  </>
                )}
              </button>
              <p className="text-center text-sm text-secondary-600 mt-3">
                This may take a few seconds while our AI creates your personalized workout
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default WorkoutGeneratorPage;
