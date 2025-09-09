import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Target, 
  Dumbbell, 
  Clock, 
  User,
  Zap,
  Award,
  Heart,
  TrendingUp
} from 'lucide-react';
import Button from './Button';
import Badge from './Badge';
import ProgressBar from './ProgressBar';

export interface OnboardingData {
  personalInfo: {
    name: string;
    age: number;
    gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  };
  goals: string[];
  preferences: {
    workoutDuration: number;
    workoutFrequency: number;
    preferredTime: 'morning' | 'afternoon' | 'evening' | 'flexible';
  };
  equipment: string[];
  constraints: string[];
  motivation: {
    primaryMotivation: string;
    reminderPreference: boolean;
    socialSharing: boolean;
  };
}

export interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
  onSkip?: () => void;
  className?: string;
}

const STEPS = [
  { id: 'welcome', title: 'Welcome', icon: Heart },
  { id: 'personal', title: 'About You', icon: User },
  { id: 'goals', title: 'Your Goals', icon: Target },
  { id: 'preferences', title: 'Preferences', icon: Clock },
  { id: 'equipment', title: 'Equipment', icon: Dumbbell },
  { id: 'motivation', title: 'Motivation', icon: Zap },
  { id: 'complete', title: 'Ready!', icon: Award },
];

const FITNESS_GOALS = [
  { id: 'weight_loss', label: 'Weight Loss', icon: '🔥', description: 'Burn calories and lose weight' },
  { id: 'muscle_gain', label: 'Muscle Gain', icon: '💪', description: 'Build strength and muscle mass' },
  { id: 'endurance', label: 'Endurance', icon: '🏃', description: 'Improve cardiovascular fitness' },
  { id: 'flexibility', label: 'Flexibility', icon: '🧘', description: 'Increase mobility and flexibility' },
  { id: 'general_fitness', label: 'General Fitness', icon: '⚡', description: 'Overall health and wellness' },
  { id: 'sport_specific', label: 'Sport Specific', icon: '🏆', description: 'Train for specific sports' },
];

const EQUIPMENT_OPTIONS = [
  { id: 'bodyweight', label: 'Bodyweight Only', icon: '🤸' },
  { id: 'dumbbells', label: 'Dumbbells', icon: '🏋️' },
  { id: 'resistance_bands', label: 'Resistance Bands', icon: '🎯' },
  { id: 'kettlebells', label: 'Kettlebells', icon: '⚫' },
  { id: 'barbell', label: 'Barbell', icon: '🏋️‍♀️' },
  { id: 'pull_up_bar', label: 'Pull-up Bar', icon: '🔗' },
  { id: 'yoga_mat', label: 'Yoga Mat', icon: '🧘‍♀️' },
  { id: 'full_gym', label: 'Full Gym Access', icon: '🏢' },
];

/**
 * Comprehensive onboarding flow with personalized setup
 */
const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onComplete,
  onSkip,
  className,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    personalInfo: {
      name: '',
      age: 25,
      gender: 'prefer_not_to_say',
      fitnessLevel: 'beginner',
    },
    goals: [],
    preferences: {
      workoutDuration: 30,
      workoutFrequency: 3,
      preferredTime: 'flexible',
    },
    equipment: ['bodyweight'],
    constraints: [],
    motivation: {
      primaryMotivation: '',
      reminderPreference: true,
      socialSharing: false,
    },
  });

  const currentStepData = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  // Accessibility: reduced motion
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    'matchMedia' in window &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Stable section id for region/heading
  const sectionId = `onb-step-${currentStepData.id}`;
  useEffect(() => {
    const region = document.getElementById(sectionId);
    if (region) {
      // Make region programmatically focusable and move focus for SR users
      region.setAttribute('tabindex', '-1');
      region.focus({ preventScroll: false });
    }
  }, [sectionId, currentStep]);

  const updateData = (section: keyof OnboardingData, updates: any) => {
    setData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates },
    }));
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  const canProceed = () => {
    switch (currentStepData.id) {
      case 'personal':
        return data.personalInfo.name.trim().length > 0;
      case 'goals':
        return data.goals.length > 0;
      case 'equipment':
        return data.equipment.length > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete(data);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStepData.id) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="bg-primary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-10 h-10 text-primary-600" />
            </div>
            <div>
              <h2 id={sectionId} className="text-3xl font-bold text-secondary-900 mb-4">
                Welcome to AI Workout! 🎉
              </h2>
              <p className="text-lg text-secondary-600 max-w-md mx-auto">
                Let's create a personalized fitness experience just for you. 
                This will only take a few minutes.
              </p>
            </div>
            <div className="bg-primary-50 rounded-xl p-6">
              <h3 className="font-semibold text-primary-900 mb-2">What you'll get:</h3>
              <ul className="text-sm text-primary-800 space-y-1">
                <li>✨ AI-powered workout plans</li>
                <li>📊 Progress tracking & analytics</li>
                <li>🎯 Personalized recommendations</li>
                <li>⏰ Flexible scheduling</li>
              </ul>
            </div>
          </div>
        );

      case 'personal':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 id={sectionId} className="text-2xl font-bold text-secondary-900 mb-2">
                Tell us about yourself
              </h2>
              <p className="text-secondary-600">
                This helps us create better workouts for you
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="onb-name" className="block text-sm font-medium text-secondary-700 mb-2">
                  What should we call you?
                </label>
                <input
                  id="onb-name"
                  type="text"
                  value={data.personalInfo.name}
                  onChange={(e) => updateData('personalInfo', { name: e.target.value })}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 border border-secondary-300 dark:border-secondary-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 bg-white dark:bg-secondary-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="onb-age" className="block text-sm font-medium text-secondary-700 mb-2">
                    Age
                  </label>
                  <input
                    id="onb-age"
                    type="number"
                    value={data.personalInfo.age}
                    onChange={(e) => updateData('personalInfo', { age: parseInt(e.target.value) || 25 })}
                    min="13"
                    max="100"
                    className="w-full px-4 py-3 border border-secondary-300 dark:border-secondary-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 bg-white dark:bg-secondary-900"
                  />
                </div>

                <div>
                  <label htmlFor="onb-fitness" className="block text-sm font-medium text-secondary-700 mb-2">
                    Fitness Level
                  </label>
                  <select
                    id="onb-fitness"
                    value={data.personalInfo.fitnessLevel}
                    onChange={(e) => updateData('personalInfo', { fitnessLevel: e.target.value })}
                    className="w-full px-4 py-3 border border-secondary-300 dark:border-secondary-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 bg-white dark:bg-secondary-900"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'goals':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 id={sectionId} className="text-2xl font-bold text-secondary-900 mb-2">
                What are your fitness goals?
              </h2>
              <p className="text-secondary-600">
                Select all that apply - we'll tailor your workouts accordingly
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FITNESS_GOALS.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => setData(prev => ({
                    ...prev,
                    goals: toggleArrayItem(prev.goals, goal.id)
                  }))}
                  className={clsx(
                    'p-4 rounded-xl border-2 transition-all text-left',
                    data.goals.includes(goal.id)
                      ? 'border-primary-300 bg-primary-50'
                      : 'border-secondary-200 hover:border-secondary-300'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{goal.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-secondary-900">{goal.label}</h3>
                      <p className="text-sm text-secondary-600">{goal.description}</p>
                    </div>
                    {data.goals.includes(goal.id) && (
                      <Check className="w-5 h-5 text-primary-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 id={sectionId} className="text-2xl font-bold text-secondary-900 mb-2">
                Workout Preferences
              </h2>
              <p className="text-secondary-600">
                Help us schedule the perfect workouts for you
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-3">
                  Preferred workout duration: {data.preferences.workoutDuration} minutes
                </label>
                <input
                  type="range"
                  min="15"
                  max="90"
                  step="15"
                  value={data.preferences.workoutDuration}
                  onChange={(e) => updateData('preferences', { workoutDuration: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-secondary-500 mt-1">
                  <span>15 min</span>
                  <span>45 min</span>
                  <span>90 min</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-3">
                  Workouts per week: {data.preferences.workoutFrequency}
                </label>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={data.preferences.workoutFrequency}
                  onChange={(e) => updateData('preferences', { workoutFrequency: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-secondary-500 mt-1">
                  <span>1</span>
                  <span>4</span>
                  <span>7</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-3">
                  Preferred workout time
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 'morning', label: 'Morning', icon: '🌅' },
                    { value: 'afternoon', label: 'Afternoon', icon: '☀️' },
                    { value: 'evening', label: 'Evening', icon: '🌆' },
                    { value: 'flexible', label: 'Flexible', icon: '⏰' },
                  ].map((time) => (
                    <button
                      key={time.value}
                      onClick={() => updateData('preferences', { preferredTime: time.value })}
                      className={clsx(
                        'p-3 rounded-lg border-2 transition-all text-center',
                        data.preferences.preferredTime === time.value
                          ? 'border-primary-300 bg-primary-50'
                          : 'border-secondary-200 hover:border-secondary-300'
                      )}
                    >
                      <div className="text-xl mb-1">{time.icon}</div>
                      <div className="text-sm font-medium">{time.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'equipment':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 id={sectionId} className="text-2xl font-bold text-secondary-900 mb-2">
                What equipment do you have?
              </h2>
              <p className="text-secondary-600">
                We'll create workouts based on your available equipment
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {EQUIPMENT_OPTIONS.map((equipment) => (
                <button
                  key={equipment.id}
                  onClick={() => setData(prev => ({
                    ...prev,
                    equipment: toggleArrayItem(prev.equipment, equipment.id)
                  }))}
                  className={clsx(
                    'p-4 rounded-xl border-2 transition-all text-center',
                    data.equipment.includes(equipment.id)
                      ? 'border-primary-300 bg-primary-50'
                      : 'border-secondary-200 hover:border-secondary-300'
                  )}
                >
                  <div className="text-2xl mb-2">{equipment.icon}</div>
                  <div className="text-sm font-medium">{equipment.label}</div>
                  {data.equipment.includes(equipment.id) && (
                    <Check className="w-4 h-4 text-primary-600 mx-auto mt-2" />
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 'motivation':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 id={sectionId} className="text-2xl font-bold text-secondary-900 mb-2">
                Stay motivated! 💪
              </h2>
              <p className="text-secondary-600">
                Let us help you stay on track with your fitness journey
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-secondary-900">Workout Reminders</h3>
                  <p className="text-sm text-secondary-600">Get notified when it's time to work out</p>
                </div>
                <button
                  onClick={() => updateData('motivation', { 
                    reminderPreference: !data.motivation.reminderPreference 
                  })}
                  className={clsx(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    data.motivation.reminderPreference ? 'bg-primary-600' : 'bg-secondary-300'
                  )}
                >
                  <span
                    className={clsx(
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      data.motivation.reminderPreference ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="bg-success-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
              <Award className="w-10 h-10 text-success-600" />
            </div>
            <div>
              <h2 id={sectionId} className="text-3xl font-bold text-secondary-900 mb-4">
                You're all set, {data.personalInfo.name}! 🎉
              </h2>
              <p className="text-lg text-secondary-600 max-w-md mx-auto">
                Your personalized AI workout experience is ready. 
                Let's start your fitness journey!
              </p>
            </div>
            <div className="bg-primary-50 rounded-xl p-6">
              <h3 className="font-semibold text-primary-900 mb-3">Your Setup Summary:</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-primary-700">Goals:</span>
                  <p className="font-medium">{data.goals.length} selected</p>
                </div>
                <div>
                  <span className="text-primary-700">Duration:</span>
                  <p className="font-medium">{data.preferences.workoutDuration} min</p>
                </div>
                <div>
                  <span className="text-primary-700">Frequency:</span>
                  <p className="font-medium">{data.preferences.workoutFrequency}x per week</p>
                </div>
                <div>
                  <span className="text-primary-700">Equipment:</span>
                  <p className="font-medium">{data.equipment.length} types</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={clsx('max-w-2xl mx-auto', className)}>
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-secondary-900">
            {currentStepData.title}
          </h1>
          <Badge variant="secondary" size="sm">
            {currentStep + 1} of {STEPS.length}
          </Badge>
        </div>
        <ProgressBar
          value={progress}
          variant="primary"
          animated
        />
      </div>

      {/* Content */}
      <div
        id={sectionId}
        role="region"
        aria-labelledby={sectionId}
        className={clsx(
          'bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-secondary-800 p-8 mb-8',
          'transition-colors duration-300',
          prefersReducedMotion && 'motion-reduce:transition-none'
        )}
      >
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div>
          {currentStep > 0 && currentStepData.id !== 'welcome' && (
            <Button
              type="button"
              variant="outline"
              leftIcon={<ChevronLeft className="w-4 h-4" />}
              onClick={handlePrevious}
            >
              Previous
            </Button>
          )}
        </div>

        <div className="flex gap-3">
          {onSkip && currentStep < STEPS.length - 1 && (
            <Button type="button" variant="ghost" onClick={onSkip}>
              Skip Setup
            </Button>
          )}
          
          <Button
            type="button"
            variant="primary"
            rightIcon={currentStep < STEPS.length - 1 ? <ChevronRight className="w-4 h-4" /> : undefined}
            onClick={handleNext}
            disabled={!canProceed()}
          >
            {currentStep < STEPS.length - 1 ? 'Continue' : 'Start My Journey!'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
