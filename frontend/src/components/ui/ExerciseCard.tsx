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
  Play
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
          'bg-white rounded-lg border p-4 transition-all duration-200',
          isActive ? 'border-primary-300 bg-primary-50' : 'border-secondary-200',
          isCompleted && 'bg-success-50 border-success-200',
          className
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-secondary-900 truncate">
                {exercise.name}
              </h4>
              {isCompleted && <CheckCircle className="w-4 h-4 text-success-500 flex-shrink-0" />}
            </div>
            <div className="flex items-center gap-3 text-sm text-secondary-600">
              {exercise.sets && (
                <span className="flex items-center gap-1">
                  <Repeat className="w-3 h-3" />
                  {typeof exercise.sets === 'number' ? exercise.sets : exercise.sets.length} sets
                </span>
              )}
              {exercise.reps && (
                <span>{exercise.reps} reps</span>
              )}
              {exercise.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {exercise.duration}
                </span>
              )}
            </div>
          </div>
          {onStart && !isCompleted && (
            <Button variant="outline" size="sm" onClick={onStart}>
              <Play className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'bg-white rounded-2xl border transition-all duration-300',
        isActive ? 'border-primary-300 shadow-glow' : 'border-secondary-200',
        isCompleted && 'bg-success-50 border-success-200',
        'hover:shadow-medium',
        className
      )}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <Badge variant={getTypeVariant()} size="sm">
                {getExerciseType()}
              </Badge>
              {exercise.primaryMuscles && (
                <Badge variant="secondary" size="sm" icon={<Target className="w-3 h-3" />}>
                  {exercise.primaryMuscles}
                </Badge>
              )}
              {isCompleted && (
                <Badge variant="success" size="sm" icon={<CheckCircle className="w-3 h-3" />}>
                  Complete
                </Badge>
              )}
            </div>
            <h3 className="text-xl font-bold text-secondary-900 mb-1">
              {exercise.name}
            </h3>
            {exercise.equipment && (
              <p className="text-sm text-secondary-600">
                Equipment: {exercise.equipment}
              </p>
            )}
          </div>
        </div>

        {/* Exercise Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {exercise.sets && (
            <div className="text-center p-3 bg-secondary-50 rounded-lg">
              <Repeat className="w-5 h-5 text-secondary-500 mx-auto mb-1" />
              <p className="text-lg font-semibold text-secondary-900">
                {typeof exercise.sets === 'number' ? exercise.sets : exercise.sets.length}
              </p>
              <p className="text-xs text-secondary-600">sets</p>
            </div>
          )}
          
          {exercise.reps && (
            <div className="text-center p-3 bg-secondary-50 rounded-lg">
              <Target className="w-5 h-5 text-secondary-500 mx-auto mb-1" />
              <p className="text-lg font-semibold text-secondary-900">{exercise.reps}</p>
              <p className="text-xs text-secondary-600">reps</p>
            </div>
          )}
          
          {exercise.duration && (
            <div className="text-center p-3 bg-secondary-50 rounded-lg">
              <Clock className="w-5 h-5 text-secondary-500 mx-auto mb-1" />
              <p className="text-lg font-semibold text-secondary-900">{exercise.duration}</p>
              <p className="text-xs text-secondary-600">duration</p>
            </div>
          )}
          
          {exercise.weight && (
            <div className="text-center p-3 bg-secondary-50 rounded-lg">
              <Weight className="w-5 h-5 text-secondary-500 mx-auto mb-1" />
              <p className="text-lg font-semibold text-secondary-900">{exercise.weight}</p>
              <p className="text-xs text-secondary-600">weight</p>
            </div>
          )}
        </div>

        {/* Additional Info */}
        {(exercise.tempo || exercise.intensity || exercise.rpe || exercise.notes) && (
          <div className="mb-6">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-sm font-medium text-secondary-700 hover:text-secondary-900 transition-colors"
            >
              <Info className="w-4 h-4" />
              Additional Details
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {isExpanded && (
              <div className="mt-3 p-4 bg-secondary-50 rounded-lg space-y-2">
                {exercise.tempo && (
                  <div>
                    <span className="text-sm font-medium text-secondary-700">Tempo: </span>
                    <span className="text-sm text-secondary-600">{exercise.tempo}</span>
                  </div>
                )}
                {exercise.intensity && (
                  <div>
                    <span className="text-sm font-medium text-secondary-700">Intensity: </span>
                    <span className="text-sm text-secondary-600">{exercise.intensity}</span>
                  </div>
                )}
                {exercise.rpe && (
                  <div>
                    <span className="text-sm font-medium text-secondary-700">RPE: </span>
                    <span className="text-sm text-secondary-600">{exercise.rpe}/10</span>
                  </div>
                )}
                {exercise.notes && (
                  <div>
                    <span className="text-sm font-medium text-secondary-700">Notes: </span>
                    <span className="text-sm text-secondary-600">{exercise.notes}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        {exercise.instructions && exercise.instructions.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-secondary-700 mb-2">Instructions:</h4>
            <ol className="list-decimal list-inside space-y-1">
              {exercise.instructions.map((instruction, index) => (
                <li key={index} className="text-sm text-secondary-600">
                  {instruction}
                </li>
              ))}
            </ol>
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
