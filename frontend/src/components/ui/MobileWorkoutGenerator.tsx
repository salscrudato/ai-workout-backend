import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../services/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Zap,
  Clock,
  Target,
  Dumbbell,
  Activity,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Heart,
  Flame,
  Gauge,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Button from './Button';
import Card from './Card';
import Badge from './Badge';
import LoadingSpinner from './LoadingSpinner';
import type { GenerateWorkoutRequest } from '../../types/api';

// Enhanced validation schema with better UX considerations
const workoutSchema = z.object({
  workoutType: z.string().min(1, 'Please select a workout type'),
  equipmentAvailable: z.array(z.string()),
  duration: z.number().min(10, 'Minimum 10 minutes').max(120, 'Maximum 120 minutes'),
  energyLevel: z.number().min(1).max(5),
  constraints: z.array(z.string()),
});

type WorkoutFormData = z.infer<typeof workoutSchema>;

// Mobile-optimized workout type options with icons and descriptions
const WORKOUT_TYPES = [
  { 
    id: 'full_body', 
    label: 'Full Body', 
    icon: <Activity className="w-5 h-5" />,
    description: 'Complete workout targeting all muscle groups',
    duration: '30-60 min',
    difficulty: 'Moderate'
  },
  { 
    id: 'upper_body', 
    label: 'Upper Body', 
    icon: <Dumbbell className="w-5 h-5" />,
    description: 'Focus on chest, back, shoulders, and arms',
    duration: '25-45 min',
    difficulty: 'Moderate'
  },
  { 
    id: 'lower_body', 
    label: 'Lower Body', 
    icon: <Target className="w-5 h-5" />,
    description: 'Legs, glutes, and core strengthening',
    duration: '30-50 min',
    difficulty: 'Challenging'
  },
  { 
    id: 'cardio', 
    label: 'Cardio', 
    icon: <Heart className="w-5 h-5" />,
    description: 'Heart-pumping cardiovascular workout',
    duration: '20-40 min',
    difficulty: 'Variable'
  },
  { 
    id: 'hiit', 
    label: 'HIIT', 
    icon: <Flame className="w-5 h-5" />,
    description: 'High-intensity interval training',
    duration: '15-30 min',
    difficulty: 'High'
  },
  { 
    id: 'core', 
    label: 'Core', 
    icon: <Gauge className="w-5 h-5" />,
    description: 'Strengthen your core and improve stability',
    duration: '15-25 min',
    difficulty: 'Moderate'
  }
];

const DURATION_OPTIONS = [
  { value: 15, label: '15 min', description: 'Quick session' },
  { value: 30, label: '30 min', description: 'Standard workout' },
  { value: 45, label: '45 min', description: 'Extended session' },
  { value: 60, label: '60 min', description: 'Full workout' },
];

const ENERGY_LEVELS = [
  { value: 1, label: 'Low', emoji: '😴', description: 'Gentle movement' },
  { value: 2, label: 'Mild', emoji: '😌', description: 'Light activity' },
  { value: 3, label: 'Good', emoji: '😊', description: 'Moderate intensity' },
  { value: 4, label: 'High', emoji: '😄', description: 'Challenging workout' },
  { value: 5, label: 'Peak', emoji: '🔥', description: 'Maximum effort' },
];

interface MobileWorkoutGeneratorProps {
  className?: string;
}

const MobileWorkoutGenerator: React.FC<MobileWorkoutGeneratorProps> = ({ className }) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isValid },
  } = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutSchema),
    mode: 'onChange',
    defaultValues: {
      workoutType: '',
      equipmentAvailable: Array.from(profile?.equipmentAvailable || []),
      duration: 30,
      energyLevel: 3,
      constraints: Array.from(profile?.constraints || []),
    },
  });

  const watchedValues = watch();
  const totalSteps = 4;

  // Update form when profile changes
  useEffect(() => {
    if (profile) {
      setValue('equipmentAvailable', Array.from(profile.equipmentAvailable || []));
      setValue('constraints', Array.from(profile.constraints || []));
    }
  }, [profile, setValue]);

  // Simulate generation progress for better UX
  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isStepValid = await trigger(fieldsToValidate);
    
    if (isStepValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getFieldsForStep = (step: number): (keyof WorkoutFormData)[] => {
    switch (step) {
      case 1: return ['workoutType'];
      case 2: return ['duration'];
      case 3: return ['energyLevel'];
      case 4: return ['constraints'];
      default: return [];
    }
  };

  const onSubmit = async (data: WorkoutFormData) => {
    if (!user || !profile) {
      navigate('/profile-setup');
      return;
    }

    try {
      setIsGenerating(true);
      setGenerationProgress(0);

      const workoutRequest: GenerateWorkoutRequest = {
        experience: profile.experience,
        goals: Array.from(profile.goals || []),
        workoutType: data.workoutType,
        equipmentAvailable: data.equipmentAvailable,
        duration: data.duration,
        constraints: data.constraints,
      };

      const response = await apiClient.generateWorkout(workoutRequest);
      setGenerationProgress(100);
      navigate(`/workout/${response.workoutId}`);
    } catch (error) {
      console.error('Failed to generate workout:', error);
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const getStepTitle = (step: number) => {
    const titles = {
      1: 'Choose Your Focus',
      2: 'Set Your Time',
      3: 'Energy Check',
      4: 'Final Details'
    };
    return titles[step as keyof typeof titles];
  };

  const getStepDescription = (step: number) => {
    const descriptions = {
      1: 'What type of workout are you in the mood for?',
      2: 'How much time do you have available?',
      3: 'How are you feeling today?',
      4: 'Any specific considerations?'
    };
    return descriptions[step as keyof typeof descriptions];
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm text-center" padding="lg">
          <div className="mb-6">
            <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-secondary-900 mb-2">
              Creating Your Workout
            </h2>
            <p className="text-secondary-600 text-sm">
              Our AI is crafting the perfect workout just for you...
            </p>
          </div>

          <div className="mb-6">
            <div className="w-full bg-secondary-200 rounded-full h-2 mb-2">
              <div 
                className="bg-primary-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
            <p className="text-xs text-secondary-500">
              {generationProgress < 30 ? 'Analyzing your preferences...' :
               generationProgress < 60 ? 'Selecting optimal exercises...' :
               generationProgress < 90 ? 'Customizing intensity...' :
               'Almost ready!'}
            </p>
          </div>

          <div className="space-y-2 text-xs text-secondary-600">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary-500" />
              <span>Personalized for your {profile?.experience} level</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary-500" />
              <span>Optimized for {watchedValues.duration} minutes</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary-500" />
              <span>Tailored to your energy level</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Header */}
      <div className="bg-white border-b border-secondary-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold text-secondary-900">
              {getStepTitle(currentStep)}
            </h1>
            <Badge variant="secondary" size="sm">
              {currentStep}/{totalSteps}
            </Badge>
          </div>
          
          <p className="text-sm text-secondary-600 mb-4">
            {getStepDescription(currentStep)}
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-secondary-200 rounded-full h-1">
            <div 
              className="bg-primary-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="px-4 py-6">
        <form onSubmit={handleSubmit(onSubmit as any)}>
          {/* Step 1: Workout Type */}
          {currentStep === 1 && (
            <div className="space-y-3">
              {WORKOUT_TYPES.map((type) => (
                <Card
                  key={type.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    watchedValues.workoutType === type.id
                      ? 'ring-2 ring-primary-500 bg-primary-50 border-primary-200'
                      : 'hover:border-secondary-300'
                  }`}
                  padding="md"
                  clickable
                  onClick={() => setValue('workoutType', type.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      watchedValues.workoutType === type.id
                        ? 'bg-primary-500 text-white'
                        : 'bg-secondary-100 text-secondary-600'
                    }`}>
                      {type.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-secondary-900">
                          {type.label}
                        </h3>
                        <div className="flex gap-1">
                          <Badge variant="outline" size="xs">{type.duration}</Badge>
                          <Badge variant="outline" size="xs">{type.difficulty}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-secondary-600">
                        {type.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
              {errors.workoutType && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.workoutType.message}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Duration */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {DURATION_OPTIONS.map((option) => (
                  <Card
                    key={option.value}
                    className={`cursor-pointer transition-all duration-200 text-center ${
                      watchedValues.duration === option.value
                        ? 'ring-2 ring-primary-500 bg-primary-50 border-primary-200'
                        : 'hover:border-secondary-300'
                    }`}
                    padding="md"
                    clickable
                    onClick={() => setValue('duration', option.value)}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                      watchedValues.duration === option.value
                        ? 'bg-primary-500 text-white'
                        : 'bg-secondary-100 text-secondary-600'
                    }`}>
                      <Clock className="w-4 h-4" />
                    </div>
                    <h3 className="font-semibold text-secondary-900 mb-1">
                      {option.label}
                    </h3>
                    <p className="text-xs text-secondary-600">
                      {option.description}
                    </p>
                  </Card>
                ))}
              </div>

              {/* Custom Duration Slider */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Custom Duration: {watchedValues.duration} minutes
                </label>
                <input
                  type="range"
                  min="10"
                  max="120"
                  step="5"
                  value={watchedValues.duration}
                  onChange={(e) => setValue('duration', parseInt(e.target.value))}
                  className="w-full h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-secondary-500 mt-1">
                  <span>10 min</span>
                  <span>120 min</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Energy Level */}
          {currentStep === 3 && (
            <div className="space-y-3">
              {ENERGY_LEVELS.map((level) => (
                <Card
                  key={level.value}
                  className={`cursor-pointer transition-all duration-200 ${
                    watchedValues.energyLevel === level.value
                      ? 'ring-2 ring-primary-500 bg-primary-50 border-primary-200'
                      : 'hover:border-secondary-300'
                  }`}
                  padding="md"
                  clickable
                  onClick={() => setValue('energyLevel', level.value)}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {level.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-secondary-900">
                          {level.label} Energy
                        </h3>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                i < level.value ? 'bg-primary-500' : 'bg-secondary-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-secondary-600">
                        {level.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Step 4: Constraints */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <Card padding="md" variant="outline">
                <h3 className="font-semibold text-secondary-900 mb-3">
                  Workout Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Type:</span>
                    <span className="font-medium">
                      {WORKOUT_TYPES.find(t => t.id === watchedValues.workoutType)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Duration:</span>
                    <span className="font-medium">{watchedValues.duration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Energy:</span>
                    <span className="font-medium">
                      {ENERGY_LEVELS.find(l => l.value === watchedValues.energyLevel)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Experience:</span>
                    <span className="font-medium capitalize">{profile?.experience}</span>
                  </div>
                </div>
              </Card>

              <div className="text-center">
                <p className="text-sm text-secondary-600 mb-4">
                  Ready to generate your personalized workout?
                </p>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  leftIcon={<Sparkles className="w-5 h-5" />}
                  disabled={!isValid}
                >
                  Generate My Workout
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Navigation Footer */}
      {currentStep < 4 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-secondary-200 p-4">
          <div className="flex gap-3">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={prevStep}
                leftIcon={<ChevronLeft className="w-4 h-4" />}
              >
                Back
              </Button>
            )}
            <Button
              variant="primary"
              fullWidth
              onClick={nextStep}
              rightIcon={<ChevronRight className="w-4 h-4" />}
              disabled={!isValid && currentStep === 1}
            >
              {currentStep === totalSteps ? 'Generate' : 'Continue'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileWorkoutGenerator;
