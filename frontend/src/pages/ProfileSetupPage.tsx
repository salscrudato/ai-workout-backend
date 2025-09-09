import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { apiClient } from '../services/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import type { Equipment, CreateProfileInput } from '../types/api';

// Validation schema
const profileSchema = z.object({
  experience: z.enum(['beginner', 'intermediate', 'advanced']),
  goals: z.array(z.string()).min(1, 'Please select at least one goal'),
  equipmentAvailable: z.array(z.string()),
  age: z.number().min(13).max(100).optional(),
  sex: z.enum(['male', 'female', 'prefer_not_to_say']),
  height_ft: z.number().min(3).max(8).optional(),
  height_in: z.number().min(0).max(11).optional(),
  weight_lb: z.number().min(50).max(500).optional(),
  injury_notes: z.string().optional(),
  constraints: z.array(z.string()),
  health_ack: z.boolean().refine(val => val === true, 'You must acknowledge the health disclaimer'),
  data_consent: z.boolean().refine(val => val === true, 'You must consent to data processing'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const STEPS = [
  { id: 1, title: 'Experience Level', description: 'Tell us about your fitness background' },
  { id: 2, title: 'Goals', description: 'What do you want to achieve?' },
  { id: 3, title: 'Equipment', description: 'What equipment do you have access to?' },
  { id: 4, title: 'Personal Info', description: 'Help us personalize your workouts' },
  { id: 5, title: 'Health & Constraints', description: 'Any limitations we should know about?' },
];

const GOAL_OPTIONS = [
  'Weight Loss',
  'Muscle Building',
  'Strength Training',
  'Endurance',
  'Flexibility',
  'General Fitness',
  'Athletic Performance',
  'Rehabilitation',
];

const CONSTRAINT_OPTIONS = [
  'Lower Back Issues',
  'Knee Problems',
  'Shoulder Issues',
  'Limited Time',
  'Noise Restrictions',
  'Space Limitations',
  'Pregnancy',
  'Other Injuries',
];

const ProfileSetupPage: React.FC = () => {
  const { user, profile, isNewUser, refreshProfile } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      experience: 'beginner',
      goals: [],
      equipmentAvailable: [],
      sex: 'prefer_not_to_say',
      constraints: [],
      health_ack: false,
      data_consent: false,
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    const loadEquipment = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.getEquipment();
        setEquipment(response.items);
      } catch (error) {
        console.error('Failed to load equipment:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEquipment();
  }, []);

  const handleNext = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await trigger(fieldsToValidate);
    
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const getFieldsForStep = (step: number): (keyof ProfileFormData)[] => {
    switch (step) {
      case 1: return ['experience'];
      case 2: return ['goals'];
      case 3: return ['equipmentAvailable'];
      case 4: return ['age', 'sex', 'height_ft', 'height_in', 'weight_lb'];
      case 5: return ['constraints', 'health_ack', 'data_consent'];
      default: return [];
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user?.id) return;

    try {
      setIsSubmitting(true);

      const profileData: CreateProfileInput = {
        userId: user.id,
        ...data,
      };

      // Save profile (intelligently handles create vs update)
      const isUpdate = Boolean(!isNewUser && profile);
      showInfo(
        isUpdate ? 'Updating Profile' : 'Creating Profile',
        isUpdate
          ? 'Saving your profile changes...'
          : 'Setting up your personalized workout profile...'
      );

      await apiClient.saveProfile(profileData, isUpdate);
      await refreshProfile();

      showSuccess(
        isUpdate ? 'Profile Updated!' : 'Profile Created!',
        'Your workout profile has been saved successfully.'
      );

      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to save profile:', error);
      showError(
        'Profile Save Failed',
        error instanceof Error
          ? error.message
          : 'Failed to save your profile. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleArrayValue = (array: string[], value: string, fieldName: keyof ProfileFormData) => {
    const newArray = array.includes(value)
      ? array.filter(item => item !== value)
      : [...array, value];
    setValue(fieldName, newArray);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading setup..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-secondary-900">Profile Setup</h1>
            <span className="text-sm text-secondary-600">
              Step {currentStep} of {STEPS.length}
            </span>
          </div>
          <div className="w-full bg-secondary-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-secondary-900 mb-2">
              {STEPS[currentStep - 1].title}
            </h2>
            <p className="text-secondary-600">
              {STEPS[currentStep - 1].description}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Experience Level */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                    <label
                      key={level}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                        watchedValues.experience === level
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-secondary-200 hover:border-secondary-300'
                      }`}
                    >
                      <input
                        type="radio"
                        value={level}
                        {...register('experience')}
                        className="sr-only"
                      />
                      <div className="flex-1">
                        <div className="font-medium capitalize">{level}</div>
                        <div className="text-sm text-secondary-600">
                          {level === 'beginner' && 'New to fitness or returning after a break'}
                          {level === 'intermediate' && 'Regular exercise routine for 6+ months'}
                          {level === 'advanced' && 'Consistent training for 2+ years'}
                        </div>
                      </div>
                      {watchedValues.experience === level && (
                        <Check className="h-5 w-5 text-primary-600" />
                      )}
                    </label>
                  ))}
                </div>
                {errors.experience && (
                  <p className="text-sm text-red-600">{errors.experience.message}</p>
                )}
              </div>
            )}

            {/* Step 2: Goals */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {GOAL_OPTIONS.map((goal) => (
                    <label
                      key={goal}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        watchedValues.goals.includes(goal)
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-secondary-200 hover:border-secondary-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        onChange={() => toggleArrayValue(watchedValues.goals, goal, 'goals')}
                        checked={watchedValues.goals.includes(goal)}
                      />
                      <div className="flex-1 text-sm font-medium">{goal}</div>
                      {watchedValues.goals.includes(goal) && (
                        <Check className="h-4 w-4 text-primary-600" />
                      )}
                    </label>
                  ))}
                </div>
                {errors.goals && (
                  <p className="text-sm text-red-600">{errors.goals.message}</p>
                )}
              </div>
            )}

            {/* Step 3: Equipment */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {equipment.map((item) => (
                    <label
                      key={item.slug}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        watchedValues.equipmentAvailable.includes(item.slug)
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-secondary-200 hover:border-secondary-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        onChange={() => toggleArrayValue(watchedValues.equipmentAvailable, item.slug, 'equipmentAvailable')}
                        checked={watchedValues.equipmentAvailable.includes(item.slug)}
                      />
                      <div className="flex-1 text-sm font-medium">{item.label}</div>
                      {watchedValues.equipmentAvailable.includes(item.slug) && (
                        <Check className="h-4 w-4 text-primary-600" />
                      )}
                    </label>
                  ))}
                </div>
                <p className="text-sm text-secondary-600">
                  Select all equipment you have access to. Don't worry if you don't have any - we can create bodyweight workouts!
                </p>
              </div>
            )}

            {/* Step 4: Personal Info */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Age (optional)
                    </label>
                    <input
                      type="number"
                      {...register('age', { valueAsNumber: true })}
                      className="input"
                      placeholder="25"
                    />
                    {errors.age && (
                      <p className="text-sm text-red-600 mt-1">{errors.age.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Sex
                    </label>
                    <select {...register('sex')} className="input">
                      <option value="prefer_not_to_say">Prefer not to say</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Height (ft)
                    </label>
                    <input
                      type="number"
                      {...register('height_ft', { valueAsNumber: true })}
                      className="input"
                      placeholder="5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Height (in)
                    </label>
                    <input
                      type="number"
                      {...register('height_in', { valueAsNumber: true })}
                      className="input"
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Weight (lbs)
                    </label>
                    <input
                      type="number"
                      {...register('weight_lb', { valueAsNumber: true })}
                      className="input"
                      placeholder="150"
                    />
                  </div>
                </div>

                <p className="text-sm text-secondary-600">
                  This information helps us create more personalized workouts. All fields are optional.
                </p>
              </div>
            )}

            {/* Step 5: Health & Constraints */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Injury Notes (optional)
                  </label>
                  <textarea
                    {...register('injury_notes')}
                    className="input min-h-[100px]"
                    placeholder="Describe any injuries or physical limitations we should consider..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-3">
                    Constraints & Limitations
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {CONSTRAINT_OPTIONS.map((constraint) => (
                      <label
                        key={constraint}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          watchedValues.constraints.includes(constraint)
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-secondary-200 hover:border-secondary-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          onChange={() => toggleArrayValue(watchedValues.constraints, constraint, 'constraints')}
                          checked={watchedValues.constraints.includes(constraint)}
                        />
                        <div className="flex-1 text-sm font-medium">{constraint}</div>
                        {watchedValues.constraints.includes(constraint) && (
                          <Check className="h-4 w-4 text-primary-600" />
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-secondary-200">
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      {...register('health_ack')}
                      className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                    />
                    <div className="text-sm">
                      <span className="font-medium text-secondary-900">Health Disclaimer</span>
                      <p className="text-secondary-600 mt-1">
                        I acknowledge that I should consult with a physician before beginning any exercise program.
                        I understand that this AI workout generator is for informational purposes only.
                      </p>
                    </div>
                  </label>
                  {errors.health_ack && (
                    <p className="text-sm text-red-600">{errors.health_ack.message}</p>
                  )}

                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      {...register('data_consent')}
                      className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                    />
                    <div className="text-sm">
                      <span className="font-medium text-secondary-900">Data Processing Consent</span>
                      <p className="text-secondary-600 mt-1">
                        I consent to the processing of my personal data to provide personalized workout recommendations.
                      </p>
                    </div>
                  </label>
                  {errors.data_consent && (
                    <p className="text-sm text-red-600">{errors.data_consent.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="flex items-center px-4 py-2 text-sm font-medium text-secondary-600 bg-white border border-secondary-300 rounded-md hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </button>

              {currentStep < STEPS.length ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center px-6 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      Complete Setup
                      <Check className="h-4 w-4 ml-1" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupPage;
