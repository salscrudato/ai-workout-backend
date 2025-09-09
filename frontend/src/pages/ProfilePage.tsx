import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ArrowLeft, 
  User, 
  Edit3, 
  Save, 
  X,
  Target,
  Dumbbell,
  AlertTriangle
} from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
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
  health_ack: z.boolean(),
  data_consent: z.boolean(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

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

const ProfilePage: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const watchedValues = watch();

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [equipmentResponse] = await Promise.all([
          apiClient.getEquipment(),
        ]);
        
        setEquipment(equipmentResponse.items);

        // Initialize form with profile data
        if (profile) {
          reset({
            experience: profile.experience,
            goals: Array.from(profile.goals || []),
            equipmentAvailable: Array.from(profile.equipmentAvailable || []),
            age: profile.age,
            sex: profile.sex,
            height_ft: profile.height_ft,
            height_in: profile.height_in,
            weight_lb: profile.weight_lb,
            injury_notes: profile.injury_notes || '',
            constraints: Array.from(profile.constraints || []),
            health_ack: profile.health_ack,
            data_consent: profile.data_consent,
          });
        }
      } catch (error) {
        console.error('Failed to load profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [profile, reset]);

  const toggleArrayValue = (array: string[], value: string, fieldName: keyof ProfileFormData) => {
    const newArray = array.includes(value)
      ? array.filter(item => item !== value)
      : [...array, value];
    setValue(fieldName, newArray);
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user?.id) return;

    try {
      setIsSaving(true);
      
      const profileData: Partial<CreateProfileInput> = {
        experience: data.experience,
        goals: data.goals,
        equipmentAvailable: data.equipmentAvailable,
        age: data.age,
        sex: data.sex,
        height_ft: data.height_ft,
        height_in: data.height_in,
        weight_lb: data.weight_lb,
        injury_notes: data.injury_notes,
        constraints: data.constraints,
        health_ack: data.health_ack,
        data_consent: data.data_consent,
      };

      await apiClient.updateProfile(user.id, profileData);
      await refreshProfile();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    if (profile) {
      reset({
        experience: profile.experience,
        goals: Array.from(profile.goals || []),
        equipmentAvailable: Array.from(profile.equipmentAvailable || []),
        age: profile.age,
        sex: profile.sex,
        height_ft: profile.height_ft,
        height_in: profile.height_in,
        weight_lb: profile.weight_lb,
        injury_notes: profile.injury_notes || '',
        constraints: Array.from(profile.constraints || []),
        health_ack: profile.health_ack,
        data_consent: profile.data_consent,
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-950 transition-colors duration-300">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-950 transition-colors duration-300">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-2">Profile not found</h2>
          <Link to="/profile-setup" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
            Complete profile setup
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-secondary-900 shadow-sm border-b border-secondary-200 dark:border-secondary-800 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="flex items-center text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-200 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="bg-primary-600 p-2 rounded-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-secondary-900 dark:text-secondary-100">Profile</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  leftIcon={<Edit3 className="h-4 w-4" />}
                >
                  Edit
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={cancelEdit}
                    leftIcon={<X className="h-4 w-4" />}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSubmit(onSubmit)}
                    loading={isSaving}
                    leftIcon={<Save className="h-4 w-4" />}
                  >
                    Save
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-secondary-800 p-6 transition-colors duration-300">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="input bg-secondary-50 dark:bg-secondary-800"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Experience Level
                </label>
                {isEditing ? (
                  <select {...register('experience')} className="input">
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                ) : (
                  <div className="input bg-secondary-50 dark:bg-secondary-800 capitalize">{profile.experience}</div>
                )}
              </div>
            </div>
          </div>

          {/* Fitness Goals */}
          <div className="bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-secondary-800 p-6 transition-colors duration-300">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              <Target className="inline h-5 w-5 mr-2" />
              Fitness Goals
            </h3>
            
            {isEditing ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {GOAL_OPTIONS.map((goal) => (
                  <label
                    key={goal}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      watchedValues.goals?.includes(goal)
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-secondary-200 hover:border-secondary-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      onChange={() => toggleArrayValue(watchedValues.goals || [], goal, 'goals')}
                      checked={watchedValues.goals?.includes(goal) || false}
                    />
                    <div className="flex-1 text-sm font-medium text-center">{goal}</div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.goals.map((goal) => (
                  <span
                    key={goal}
                    className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded-full text-sm font-medium transition-colors"
                  >
                    {goal}
                  </span>
                ))}
              </div>
            )}
            {errors.goals && (
              <p className="text-sm text-red-600 mt-2">{errors.goals.message}</p>
            )}
          </div>

          {/* Equipment */}
          <div className="bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-secondary-800 p-6 transition-colors duration-300">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              <Dumbbell className="inline h-5 w-5 mr-2" />
              Available Equipment
            </h3>
            
            {isEditing ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {equipment.map((item) => (
                  <label
                    key={item.slug}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      watchedValues.equipmentAvailable?.includes(item.slug)
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-secondary-200 hover:border-secondary-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      onChange={() => toggleArrayValue(watchedValues.equipmentAvailable || [], item.slug, 'equipmentAvailable')}
                      checked={watchedValues.equipmentAvailable?.includes(item.slug) || false}
                    />
                    <div className="flex-1 text-sm font-medium">{item.label}</div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.equipmentAvailable.length > 0 ? (
                  profile.equipmentAvailable.map((equipmentSlug) => {
                    const equipmentItem = equipment.find(e => e.slug === equipmentSlug);
                    return (
                      <span
                        key={equipmentSlug}
                        className="px-3 py-1 bg-secondary-100 dark:bg-secondary-800 text-secondary-800 dark:text-secondary-200 rounded-full text-sm font-medium transition-colors"
                      >
                        {equipmentItem?.label || equipmentSlug}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-secondary-600 dark:text-secondary-400 italic">No equipment selected (bodyweight workouts)</span>
                )}
              </div>
            )}
          </div>

          {/* Personal Details */}
          <div className="bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-secondary-800 p-6 transition-colors duration-300">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Personal Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Age
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    {...register('age', { valueAsNumber: true })}
                    className="input"
                    placeholder="25"
                  />
                ) : (
                  <div className="input bg-secondary-50 dark:bg-secondary-800">{profile.age || 'Not specified'}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Sex
                </label>
                {isEditing ? (
                  <select {...register('sex')} className="input">
                    <option value="prefer_not_to_say">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                ) : (
                  <div className="input bg-secondary-50 dark:bg-secondary-800 capitalize">
                    {profile.sex === 'prefer_not_to_say' ? 'Prefer not to say' : profile.sex}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Height
                </label>
                {isEditing ? (
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      {...register('height_ft', { valueAsNumber: true })}
                      className="input"
                      placeholder="5"
                    />
                    <span className="flex items-center text-sm text-secondary-600">ft</span>
                    <input
                      type="number"
                      {...register('height_in', { valueAsNumber: true })}
                      className="input"
                      placeholder="10"
                    />
                    <span className="flex items-center text-sm text-secondary-600">in</span>
                  </div>
                ) : (
                  <div className="input bg-secondary-50 dark:bg-secondary-800">
                    {profile.height_ft && profile.height_in 
                      ? `${profile.height_ft}'${profile.height_in}"`
                      : 'Not specified'
                    }
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Weight (lbs)
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    {...register('weight_lb', { valueAsNumber: true })}
                    className="input"
                    placeholder="150"
                  />
                ) : (
                  <div className="input bg-secondary-50 dark:bg-secondary-800">{profile.weight_lb || 'Not specified'}</div>
                )}
              </div>
            </div>
          </div>

          {/* Health & Constraints */}
          <div className="bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-secondary-800 p-6 transition-colors duration-300">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              <AlertTriangle className="inline h-5 w-5 mr-2" />
              Health & Constraints
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Injury Notes
                </label>
                {isEditing ? (
                  <textarea
                    {...register('injury_notes')}
                    className="input min-h-[100px]"
                    placeholder="Describe any injuries or physical limitations..."
                  />
                ) : (
                  <div className="input bg-secondary-50 dark:bg-secondary-800 min-h-[100px] whitespace-pre-wrap">
                    {profile.injury_notes || 'None specified'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-3">
                  Constraints & Limitations
                </label>
                {isEditing ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {CONSTRAINT_OPTIONS.map((constraint) => (
                      <label
                        key={constraint}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          watchedValues.constraints?.includes(constraint)
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-secondary-200 hover:border-secondary-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          onChange={() => toggleArrayValue(watchedValues.constraints || [], constraint, 'constraints')}
                          checked={watchedValues.constraints?.includes(constraint) || false}
                        />
                        <div className="flex-1 text-sm font-medium">{constraint}</div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.constraints.length > 0 ? (
                      profile.constraints.map((constraint) => (
                        <span
                          key={constraint}
                          className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full text-sm font-medium transition-colors"
                        >
                          {constraint}
                        </span>
                      ))
                    ) : (
                      <span className="text-secondary-600 dark:text-secondary-400 italic">No constraints specified</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Created */}
          <div className="bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-secondary-800 p-6 transition-colors duration-300">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Profile Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-secondary-600">Created:</span>
                <p className="font-medium">{new Date(profile.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-secondary-600">Last Updated:</span>
                <p className="font-medium">{new Date(profile.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default ProfilePage;
