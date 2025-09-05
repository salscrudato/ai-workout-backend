import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Star, ThumbsUp, ThumbsDown, MessageSquare, Send, TrendingUp, Target } from 'lucide-react';
import Button from './Button';
import Badge from './Badge';

export interface WorkoutFeedbackProps {
  onSubmit: (feedback: WorkoutFeedbackData) => void;
  onSkip?: () => void;
  className?: string;
  workoutType?: string;
  duration?: number;
}

export interface WorkoutFeedbackData {
  rating: number; // 1-5 stars
  difficulty: 'too_easy' | 'just_right' | 'too_hard';
  enjoyment: number; // 1-5 stars
  completionStatus: 'completed' | 'partially_completed' | 'skipped';
  exerciseFeedback: {
    tooEasy: string[];
    tooHard: string[];
    favorites: string[];
  };
  suggestions: string;
  wouldRecommend: boolean;
  nextWorkoutPreference: 'same_type' | 'different_type' | 'easier' | 'harder';
}

/**
 * Comprehensive workout feedback component for collecting user insights
 */
const WorkoutFeedback: React.FC<WorkoutFeedbackProps> = ({
  onSubmit,
  onSkip,
  className,
  workoutType = 'workout',
  duration = 30,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [feedback, setFeedback] = useState<Partial<WorkoutFeedbackData>>({
    rating: 0,
    difficulty: 'just_right',
    enjoyment: 0,
    completionStatus: 'completed',
    exerciseFeedback: {
      tooEasy: [],
      tooHard: [],
      favorites: [],
    },
    suggestions: '',
    wouldRecommend: false,
    nextWorkoutPreference: 'same_type',
  });

  const totalSteps = 4;

  const handleRatingChange = (field: 'rating' | 'enjoyment', value: number) => {
    setFeedback(prev => ({ ...prev, [field]: value }));
  };

  const handleDifficultyChange = (difficulty: 'too_easy' | 'just_right' | 'too_hard') => {
    setFeedback(prev => ({ ...prev, difficulty }));
  };

  const handleSubmit = () => {
    if (feedback.rating && feedback.enjoyment) {
      onSubmit(feedback as WorkoutFeedbackData);
    }
  };

  const renderStarRating = (
    value: number,
    onChange: (value: number) => void,
    label: string
  ) => (
    <div className="text-center">
      <p className="text-sm font-medium text-secondary-700 mb-3">{label}</p>
      <div className="flex justify-center gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onChange(star)}
            className={clsx(
              'p-1 transition-colors',
              star <= value ? 'text-yellow-400' : 'text-secondary-300 hover:text-yellow-300'
            )}
          >
            <Star className="w-8 h-8 fill-current" />
          </button>
        ))}
      </div>
      <p className="text-xs text-secondary-500">
        {value === 0 ? 'Tap to rate' : `${value} star${value !== 1 ? 's' : ''}`}
      </p>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-secondary-900 mb-2">
                How was your {workoutType}?
              </h3>
              <p className="text-secondary-600">
                Your feedback helps us create better workouts for you
              </p>
            </div>

            {renderStarRating(
              feedback.rating || 0,
              (value) => handleRatingChange('rating', value),
              'Overall Rating'
            )}

            <div className="text-center">
              <p className="text-sm font-medium text-secondary-700 mb-4">
                How was the difficulty?
              </p>
              <div className="flex justify-center gap-3">
                {[
                  { value: 'too_easy', label: 'Too Easy', icon: ThumbsDown, color: 'error' },
                  { value: 'just_right', label: 'Just Right', icon: ThumbsUp, color: 'success' },
                  { value: 'too_hard', label: 'Too Hard', icon: ThumbsDown, color: 'warning' },
                ].map(({ value, label, icon: Icon, color }) => (
                  <button
                    key={value}
                    onClick={() => handleDifficultyChange(value as any)}
                    className={clsx(
                      'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                      feedback.difficulty === value
                        ? `border-${color}-300 bg-${color}-50`
                        : 'border-secondary-200 hover:border-secondary-300'
                    )}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-secondary-900 mb-2">
                How much did you enjoy it?
              </h3>
            </div>

            {renderStarRating(
              feedback.enjoyment || 0,
              (value) => handleRatingChange('enjoyment', value),
              'Enjoyment Level'
            )}

            <div className="text-center">
              <p className="text-sm font-medium text-secondary-700 mb-4">
                Would you recommend this workout to a friend?
              </p>
              <div className="flex justify-center gap-4">
                <Button
                  variant={feedback.wouldRecommend === true ? 'primary' : 'outline'}
                  onClick={() => setFeedback(prev => ({ ...prev, wouldRecommend: true }))}
                  leftIcon={<ThumbsUp className="w-4 h-4" />}
                >
                  Yes
                </Button>
                <Button
                  variant={feedback.wouldRecommend === false ? 'primary' : 'outline'}
                  onClick={() => setFeedback(prev => ({ ...prev, wouldRecommend: false }))}
                  leftIcon={<ThumbsDown className="w-4 h-4" />}
                >
                  No
                </Button>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-secondary-900 mb-2">
                What's next?
              </h3>
              <p className="text-secondary-600">
                Help us plan your next workout
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-secondary-700 mb-4">
                For your next workout, would you prefer:
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'same_type', label: 'Same Type', icon: Target },
                  { value: 'different_type', label: 'Different Type', icon: TrendingUp },
                  { value: 'easier', label: 'Easier Version', icon: ThumbsDown },
                  { value: 'harder', label: 'Harder Version', icon: ThumbsUp },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setFeedback(prev => ({ ...prev, nextWorkoutPreference: value as any }))}
                    className={clsx(
                      'flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left',
                      feedback.nextWorkoutPreference === value
                        ? 'border-primary-300 bg-primary-50'
                        : 'border-secondary-200 hover:border-secondary-300'
                    )}
                  >
                    <Icon className="w-5 h-5 text-secondary-500" />
                    <span className="font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-secondary-900 mb-2">
                Any additional thoughts?
              </h3>
              <p className="text-secondary-600">
                Optional feedback to help us improve
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Suggestions or comments
              </label>
              <textarea
                value={feedback.suggestions}
                onChange={(e) => setFeedback(prev => ({ ...prev, suggestions: e.target.value }))}
                placeholder="What could we improve? Any exercises you particularly liked or disliked?"
                className="w-full p-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows={4}
              />
            </div>

            <div className="bg-primary-50 rounded-xl p-6 text-center">
              <h4 className="font-semibold text-primary-900 mb-2">
                Thank you for your feedback! 🎉
              </h4>
              <p className="text-primary-700 text-sm">
                Your insights help us create better, more personalized workouts for you.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={clsx('bg-white rounded-2xl border border-secondary-200 p-6', className)}>
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex space-x-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={clsx(
                'w-3 h-3 rounded-full transition-colors',
                i + 1 <= currentStep ? 'bg-primary-500' : 'bg-secondary-200'
              )}
            />
          ))}
        </div>
        <Badge variant="secondary" size="sm">
          Step {currentStep} of {totalSteps}
        </Badge>
      </div>

      {/* Step content */}
      <div className="mb-8">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <div>
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => prev - 1)}
            >
              Previous
            </Button>
          )}
        </div>

        <div className="flex gap-3">
          {onSkip && (
            <Button variant="ghost" onClick={onSkip}>
              Skip Feedback
            </Button>
          )}
          
          {currentStep < totalSteps ? (
            <Button
              variant="primary"
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={currentStep === 1 && (!feedback.rating || !feedback.difficulty)}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="primary"
              leftIcon={<Send className="w-4 h-4" />}
              onClick={handleSubmit}
            >
              Submit Feedback
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutFeedback;
