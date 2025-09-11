import React, { useState } from 'react';
import { clsx } from 'clsx';
import {
  CheckCircle,
  Clock,
  Repeat,
  Weight,
  Target,
  Info,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  SkipForward,
  Timer,
  Activity,
  Zap,
  Award,
  AlertCircle
} from 'lucide-react';
import Button from './Button';
import Badge from './Badge';
import WorkoutTimer from './WorkoutTimer';
import type { WorkoutExercise } from '../../types/api';

export interface ExerciseCardProps {
  exercise: WorkoutExercise;
  isCompleted?: boolean;
  isActive?: boolean;
  onComplete?: () => void;
  onStart?: () => void;
  className?: string;
  showTimer?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

/**
 * Enhanced ExerciseCard component with comprehensive exercise information and interactive features
 */
const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  isCompleted = false,
  isActive = false,
  onComplete,
  onStart,
  className,
  showTimer = false,
  variant = 'default',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);

  const parseRestTime = (restString: string): number => {
    if (!restString) return 60;
    
    const timeStr = restString.toLowerCase();
    let totalSeconds = 0;
    
    const minutesMatch = timeStr.match(/(\d+)m/);
    if (minutesMatch) {
      totalSeconds += parseInt(minutesMatch[1]) * 60;
    }
    
    const secondsMatch = timeStr.match(/(\d+)s/);
    if (secondsMatch) {
      totalSeconds += parseInt(secondsMatch[1]);
    }
    
    if (totalSeconds === 0) {
      const numberMatch = timeStr.match(/(\d+)/);
      if (numberMatch) {
        totalSeconds = parseInt(numberMatch[1]);
      }
    }
    
    return totalSeconds || 60;
  };

  const getExerciseType = () => {
    const name = exercise.name.toLowerCase();
    if (name.includes('cardio') || name.includes('run') || name.includes('bike')) return 'cardio';
    if (name.includes('stretch') || name.includes('mobility')) return 'mobility';
    if (name.includes('core') || name.includes('plank') || name.includes('crunch')) return 'core';
    return 'strength';
  };

  const getTypeVariant = () => {
    const type = getExerciseType();
    switch (type) {
      case 'cardio': return 'cardio';
      case 'mobility': return 'success';
      case 'core': return 'muscle';
      default: return 'strength';
    }
  };

  if (variant === 'compact') {
    return (
      <div
        className={clsx(
          'glass-light rounded-2xl border transition-all duration-300 p-4 hover-lift-subtle',
          isCompleted
            ? 'border-success-300 bg-success-50/50'
            : isActive
            ? 'border-primary-300 shadow-glow-blue glass-tinted'
            : 'border-neutral-200',
          className
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h4 className={clsx(
                "font-semibold truncate text-lg",
                isCompleted ? 'text-success-700' : isActive ? 'gradient-text-primary' : 'text-neutral-900'
              )}>
                {exercise.name}
              </h4>
              {isCompleted && <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0" />}
              {isActive && <Activity className="w-5 h-5 text-primary-500 flex-shrink-0 animate-pulse" />}
            </div>
            <div className="flex items-center gap-4 text-sm flex-wrap">
              {exercise.sets && (
                <div className="flex items-center gap-1 glass-subtle rounded-full px-2 py-1">
                  <Repeat className="w-3 h-3 text-primary-600" />
                  <span className="font-medium text-primary-700">
                    {typeof exercise.sets === 'number' ? exercise.sets : exercise.sets.length} sets
                  </span>
                </div>
              )}
              {exercise.reps && (
                <div className="flex items-center gap-1 glass-subtle rounded-full px-2 py-1">
                  <Target className="w-3 h-3 text-purple-600" />
                  <span className="font-medium text-purple-700">{exercise.reps} reps</span>
                </div>
              )}
              {exercise.duration && (
                <div className="flex items-center gap-1 glass-subtle rounded-full px-2 py-1">
                  <Timer className="w-3 h-3 text-cyan-600" />
                  <span className="font-medium text-cyan-700">{exercise.duration}</span>
                </div>
              )}
            </div>
          </div>
          {onStart && !isCompleted && (
            <Button
              variant={isActive ? "secondary" : "primary"}
              size="md"
              leftIcon={isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              onClick={onStart}
              className="hover-lift ml-4"
            >
              {isActive ? 'Pause' : 'Start'}
            </Button>
          )}
          {isCompleted && (
            <div className="ml-4 flex items-center gap-2 glass-light rounded-full px-3 py-2">
              <Award className="w-4 h-4 text-success-600" />
              <span className="text-sm font-semibold text-success-700">Complete</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'glass-premium rounded-3xl border transition-all duration-300 hover-lift-subtle',
        isActive
          ? 'border-primary-300 shadow-glow-blue glass-tinted'
          : isCompleted
          ? 'border-success-300 bg-success-50/30'
          : 'border-neutral-200',
        className
      )}
    >
      <div className="p-8">
        {/* Enhanced Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <Badge
                variant={getTypeVariant()}
                size="md"
                className="glass-light border-0 font-semibold"
              >
                {getExerciseType()}
              </Badge>
              {exercise.primaryMuscles && (
                <Badge
                  variant="secondary"
                  size="md"
                  icon={<Target className="w-4 h-4" />}
                  className="glass-light border-0 font-semibold"
                >
                  {exercise.primaryMuscles}
                </Badge>
              )}
              {isCompleted && (
                <Badge
                  variant="success"
                  size="md"
                  icon={<Award className="w-4 h-4" />}
                  className="glass-light border-0 font-semibold"
                >
                  Complete
                </Badge>
              )}
              {isActive && (
                <Badge
                  variant="primary"
                  size="md"
                  icon={<Activity className="w-4 h-4 animate-pulse" />}
                  className="glass-light border-0 font-semibold"
                >
                  Active
                </Badge>
              )}
            </div>
            <h3 className={clsx(
              "text-3xl font-bold mb-2",
              isActive ? 'gradient-text-primary' : isCompleted ? 'text-success-700' : 'text-neutral-900'
            )}>
              {exercise.name}
            </h3>
            {exercise.equipment && (
              <div className="flex items-center gap-2 glass-subtle rounded-full px-3 py-1.5 inline-flex">
                <Zap className="w-4 h-4 text-cyan-600" />
                <span className="text-sm font-medium text-cyan-700">
                  Equipment: {exercise.equipment}
                </span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="ml-6">
            {!isCompleted && onStart && (
              <Button
                variant={isActive ? "secondary" : "primary"}
                size="lg"
                leftIcon={isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                onClick={onStart}
                className="hover-lift shadow-glow-blue"
              >
                {isActive ? 'Pause' : 'Start Exercise'}
              </Button>
            )}
            {isCompleted && onComplete && (
              <div className="flex items-center gap-3 glass-light rounded-full px-4 py-3">
                <CheckCircle className="w-6 h-6 text-success-600" />
                <span className="font-semibold text-success-700">Completed!</span>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Exercise Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {exercise.sets && (
            <div className="text-center p-4 glass-light rounded-2xl border border-primary-200/30 hover-lift-subtle">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full glass-tinted flex items-center justify-center">
                <Repeat className="w-6 h-6 text-primary-600" />
              </div>
              <p className="text-2xl font-bold gradient-text-primary mb-1">
                {typeof exercise.sets === 'number' ? exercise.sets : exercise.sets.length}
              </p>
              <p className="text-sm font-medium text-neutral-600 uppercase tracking-wide">Sets</p>
            </div>
          )}

          {exercise.reps && (
            <div className="text-center p-4 glass-light rounded-2xl border border-purple-200/30 hover-lift-subtle">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full glass-tinted flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-2xl font-bold gradient-text-purple mb-1">{exercise.reps}</p>
              <p className="text-sm font-medium text-neutral-600 uppercase tracking-wide">Reps</p>
            </div>
          )}

          {exercise.duration && (
            <div className="text-center p-4 glass-light rounded-2xl border border-cyan-200/30 hover-lift-subtle">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full glass-tinted flex items-center justify-center">
                <Timer className="w-6 h-6 text-cyan-600" />
              </div>
              <p className="text-2xl font-bold gradient-text-blue mb-1">{exercise.duration}</p>
              <p className="text-sm font-medium text-neutral-600 uppercase tracking-wide">Duration</p>
            </div>
          )}

          {exercise.weight && (
            <div className="text-center p-4 glass-light rounded-2xl border border-orange-200/30 hover-lift-subtle">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full glass-tinted flex items-center justify-center">
                <Weight className="w-6 h-6 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-orange-700 mb-1">{exercise.weight}</p>
              <p className="text-sm font-medium text-neutral-600 uppercase tracking-wide">Weight</p>
            </div>
          )}
        </div>

        {/* Enhanced Progressive Disclosure */}
        {(exercise.tempo || exercise.intensity || exercise.rpe || exercise.notes) && (
          <div className="mb-8">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-between p-4 glass-light rounded-2xl border border-neutral-200/50 hover:border-primary-200/50 transition-all duration-300 hover-lift-subtle"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full glass-tinted flex items-center justify-center">
                  <Info className="w-4 h-4 text-primary-600" />
                </div>
                <span className="font-semibold text-neutral-700">Additional Details</span>
              </div>
              <div className={clsx(
                "transition-transform duration-300",
                isExpanded ? "rotate-180" : "rotate-0"
              )}>
                <ChevronDown className="w-5 h-5 text-neutral-500" />
              </div>
            </button>

            {isExpanded && (
              <div className="mt-4 p-6 glass-subtle rounded-2xl border border-neutral-200/30 space-y-4 animate-fade-in-up">
                {exercise.tempo && (
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                      <Timer className="w-3 h-3 text-primary-600" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-neutral-700">Tempo: </span>
                      <span className="text-sm text-neutral-600">{exercise.tempo}</span>
                    </div>
                  </div>
                )}
                {exercise.intensity && (
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                      <Zap className="w-3 h-3 text-purple-600" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-neutral-700">Intensity: </span>
                      <span className="text-sm text-neutral-600">{exercise.intensity}</span>
                    </div>
                  </div>
                )}
                {exercise.rpe && (
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-cyan-100 flex items-center justify-center">
                      <Target className="w-3 h-3 text-cyan-600" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-neutral-700">RPE: </span>
                      <span className="text-sm text-neutral-600">{exercise.rpe}/10</span>
                    </div>
                  </div>
                )}
                {exercise.notes && (
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center mt-0.5">
                      <AlertCircle className="w-3 h-3 text-orange-600" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-neutral-700">Notes: </span>
                      <span className="text-sm text-neutral-600">{exercise.notes}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Enhanced Instructions */}
        {exercise.instructions && exercise.instructions.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full glass-tinted flex items-center justify-center">
                <Info className="w-4 h-4 text-primary-600" />
              </div>
              <h4 className="text-lg font-semibold gradient-text-subtle">Exercise Instructions</h4>
            </div>
            <div className="glass-subtle rounded-2xl p-6 border border-neutral-200/30">
              <ol className="space-y-3">
                {exercise.instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary-600">{index + 1}</span>
                    </div>
                    <span className="text-sm text-neutral-700 leading-relaxed">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {onStart && !isCompleted && (
            <Button
              variant="primary"
              size="md"
              leftIcon={<Play className="w-4 h-4" />}
              onClick={onStart}
              className="flex-1"
            >
              Start Exercise
            </Button>
          )}
          
          {onComplete && !isCompleted && (
            <Button
              variant="outline"
              size="md"
              leftIcon={<CheckCircle className="w-4 h-4" />}
              onClick={onComplete}
              className="flex-1"
            >
              Mark Complete
            </Button>
          )}
          
          {exercise.rest && !isCompleted && (
            <Button
              variant="secondary"
              size="md"
              leftIcon={<Clock className="w-4 h-4" />}
              onClick={() => setShowRestTimer(true)}
            >
              Rest Timer
            </Button>
          )}
        </div>
      </div>

      {/* Rest Timer Modal */}
      {showRestTimer && exercise.rest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <WorkoutTimer
              duration={parseRestTime(exercise.rest)}
              variant="rest"
              title="Rest Period"
              subtitle={`${exercise.rest} recommended`}
              onComplete={() => setShowRestTimer(false)}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRestTimer(false)}
              className="mt-4 w-full"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseCard;
