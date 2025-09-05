import React from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { Clock, Target, Zap, Calendar, CheckCircle, Play } from 'lucide-react';
import Badge from './Badge';
import Button from './Button';
import Card from './Card';
import { Heading, Body } from './Typography';
import { MicroInteraction } from './animations';
import { workoutCardVariants } from './animations/variants';
import type { WorkoutPlanResponse } from '../../types/api';

export interface WorkoutCardProps {
  workout: WorkoutPlanResponse;
  onStart?: () => void;
  onView?: () => void;
  className?: string;
  variant?: 'default' | 'compact' | 'featured';
}

/**
 * Enhanced WorkoutCard component with modern design and comprehensive workout information
 */
const WorkoutCard: React.FC<WorkoutCardProps> = ({
  workout,
  onStart,
  onView,
  className,
  variant = 'default',
}) => {
  const { plan, preWorkout, isCompleted, createdAt } = workout;
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getWorkoutTypeVariant = (type: string | undefined) => {
    if (!type) return 'primary';
    const lowerType = type.toLowerCase();
    if (lowerType.includes('cardio') || lowerType.includes('hiit')) return 'cardio';
    if (lowerType.includes('strength') || lowerType.includes('power')) return 'strength';
    if (lowerType.includes('muscle') || lowerType.includes('hypertrophy')) return 'muscle';
    return 'primary';
  };

  const getTotalExercises = () => {
    return (plan.warmup?.length || 0) + (plan.exercises?.length || 0) + (plan.cooldown?.length || 0);
  };

  const getEstimatedDuration = () => {
    return plan.estimatedDuration || preWorkout.duration || 30;
  };

  if (variant === 'compact') {
    return (
      <MicroInteraction type="card" className={className}>
        <motion.div
          variants={workoutCardVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          className={clsx(
            'bg-white rounded-lg border border-secondary-200 p-4',
            'hover:border-secondary-300 hover:shadow-soft transition-all duration-200',
            'cursor-pointer'
          )}
          onClick={onView}
        >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant={getWorkoutTypeVariant(preWorkout.workoutType)}
                size="sm"
              >
                {preWorkout.workoutType?.replace(/_/g, ' ') || 'Workout'}
              </Badge>
              {isCompleted && (
                <CheckCircle className="w-4 h-4 text-success-500" />
              )}
            </div>
            <p className="text-sm text-secondary-600">
              {formatDate(createdAt)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-secondary-900">
              {getEstimatedDuration()}min
            </p>
            <p className="text-xs text-secondary-500">
              {getTotalExercises()} exercises
            </p>
          </div>
        </div>
        </motion.div>
      </MicroInteraction>
    );
  }

  if (variant === 'featured') {
    return (
      <MicroInteraction type="card" className={className}>
        <motion.div
          variants={workoutCardVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          className={clsx(
            'bg-gradient-to-br from-primary-50 to-primary-100',
            'border border-primary-200 rounded-2xl p-6',
            'shadow-medium hover:shadow-hard transition-all duration-300',
            'relative overflow-hidden'
          )}
        >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-200/30 rounded-full -translate-y-16 translate-x-16" />
        
        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div>
              <Badge
                variant={getWorkoutTypeVariant(preWorkout.workoutType)}
                size="lg"
                icon={<Target className="w-4 h-4" />}
              >
                {preWorkout.workoutType?.replace(/_/g, ' ') || 'Workout'}
              </Badge>
              <h3 className="text-xl font-bold text-secondary-900 mt-2">
                {plan.meta?.workout_name || 'Custom Workout'}
              </h3>
            </div>
            {isCompleted && (
              <div className="flex items-center gap-1 text-success-600">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Completed</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <Clock className="w-5 h-5 text-secondary-500 mx-auto mb-1" />
              <p className="text-lg font-semibold text-secondary-900">
                {getEstimatedDuration()}
              </p>
              <p className="text-xs text-secondary-600">minutes</p>
            </div>
            <div className="text-center">
              <Zap className="w-5 h-5 text-secondary-500 mx-auto mb-1" />
              <p className="text-lg font-semibold text-secondary-900">
                {getTotalExercises()}
              </p>
              <p className="text-xs text-secondary-600">exercises</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="primary"
              size="md"
              fullWidth
              leftIcon={<Play className="w-4 h-4" />}
              onClick={onStart}
            >
              {isCompleted ? 'Restart' : 'Start Workout'}
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={onView}
            >
              View
            </Button>
          </div>
        </div>
        </motion.div>
      </MicroInteraction>
    );
  }

  // Default variant
  return (
    <MicroInteraction type="card" className={className}>
      <motion.div
        variants={workoutCardVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        className={clsx(
          'bg-white rounded-xl border border-secondary-200 p-6',
          'hover:border-secondary-300 hover:shadow-soft transition-all duration-200',
          'group'
        )}
      >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant={getWorkoutTypeVariant(preWorkout.workoutType)}
              size="md"
            >
              {preWorkout.workoutType?.replace(/_/g, ' ') || 'Workout'}
            </Badge>
            {isCompleted && (
              <Badge variant="success" size="sm" icon={<CheckCircle className="w-3 h-3" />}>
                Completed
              </Badge>
            )}
          </div>
          <h3 className="text-lg font-semibold text-secondary-900 mb-1">
            {plan.meta?.workout_name || 'Custom Workout'}
          </h3>
          <div className="flex items-center gap-1 text-sm text-secondary-500">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 mb-4 text-sm">
        <div className="flex items-center gap-1 text-secondary-600">
          <Clock className="w-4 h-4" />
          <span>{getEstimatedDuration()} min</span>
        </div>
        <div className="flex items-center gap-1 text-secondary-600">
          <Zap className="w-4 h-4" />
          <span>{getTotalExercises()} exercises</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Play className="w-4 h-4" />}
          onClick={onStart}
          className="flex-1"
        >
          {isCompleted ? 'Restart' : 'Start'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onView}
        >
          View Details
        </Button>
      </div>
      </motion.div>
    </MicroInteraction>
  );
};

export default WorkoutCard;
