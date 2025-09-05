import React, { useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import {
  Play,
  Pause,
  SkipForward,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Zap,
  Heart,
  Target,
  Timer,
  TrendingUp,
  MessageCircle,
  Camera,
  Smartphone
} from 'lucide-react';
import Button from './Button';
import Badge from './Badge';
import Card from './Card';
import type { WorkoutExercise } from '../../types/api';

interface SmartWorkoutGuideProps {
  exercise: WorkoutExercise;
  currentSet: number;
  totalSets: number;
  onSetComplete: (feedback: SetFeedback) => void;
  onExerciseComplete: () => void;
  isActive: boolean;
  className?: string;
}

interface SetFeedback {
  repsCompleted: number;
  difficultyRating: 1 | 2 | 3 | 4 | 5; // 1 = too easy, 5 = too hard
  formQuality: 1 | 2 | 3 | 4 | 5; // 1 = poor, 5 = excellent
  notes?: string;
  actualRestTime?: number;
}

interface RealTimeGuidance {
  phase: 'prepare' | 'work' | 'rest' | 'complete';
  message: string;
  intensity: 'low' | 'medium' | 'high';
  countdown?: number;
}

const SmartWorkoutGuide: React.FC<SmartWorkoutGuideProps> = ({
  exercise,
  currentSet,
  totalSets,
  onSetComplete,
  onExerciseComplete,
  isActive,
  className
}) => {
  const [guidance, setGuidance] = useState<RealTimeGuidance>({
    phase: 'prepare',
    message: 'Get ready to start your set',
    intensity: 'low'
  });
  
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showFormTips, setShowFormTips] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [repsCompleted, setRepsCompleted] = useState(0);
  const [restStartTime, setRestStartTime] = useState<Date | null>(null);
  const [formReminders, setFormReminders] = useState<string[]>([]);
  const [adaptiveCoaching, setAdaptiveCoaching] = useState<string>('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentSetData = exercise.sets?.[currentSet - 1];

  // Timer management
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning]);

  // Real-time guidance system
  useEffect(() => {
    if (!isActive || !currentSetData) return;

    const updateGuidance = () => {
      const targetReps = currentSetData.reps || 0;
      const targetTime = currentSetData.time_sec || 0;
      const rpe = currentSetData.rpe || 7;

      if (guidance.phase === 'prepare') {
        setGuidance({
          phase: 'prepare',
          message: `Prepare for ${targetReps > 0 ? `${targetReps} reps` : `${targetTime} seconds`}`,
          intensity: 'low',
          countdown: 5
        });
      } else if (guidance.phase === 'work') {
        const progress = targetReps > 0 ? (repsCompleted / targetReps) * 100 : (timer / targetTime) * 100;
        
        let message = '';
        let intensity: 'low' | 'medium' | 'high' = 'medium';

        if (progress < 25) {
          message = 'Focus on form and controlled movement';
          intensity = 'low';
        } else if (progress < 50) {
          message = 'Great start! Maintain your pace';
          intensity = 'medium';
        } else if (progress < 75) {
          message = 'Halfway there! Keep pushing';
          intensity = 'medium';
        } else if (progress < 90) {
          message = 'Almost done! Give it your all';
          intensity = 'high';
        } else {
          message = 'Final push! You\'ve got this!';
          intensity = 'high';
        }

        setGuidance({
          phase: 'work',
          message,
          intensity
        });
      } else if (guidance.phase === 'rest') {
        const restTime = currentSetData.rest_sec || 60;
        const elapsed = restStartTime ? Math.floor((Date.now() - restStartTime.getTime()) / 1000) : 0;
        const remaining = Math.max(0, restTime - elapsed);

        if (remaining > 30) {
          setGuidance({
            phase: 'rest',
            message: 'Take your time to recover',
            intensity: 'low',
            countdown: remaining
          });
        } else if (remaining > 10) {
          setGuidance({
            phase: 'rest',
            message: 'Get ready for your next set',
            intensity: 'medium',
            countdown: remaining
          });
        } else if (remaining > 0) {
          setGuidance({
            phase: 'rest',
            message: 'Almost time! Prepare yourself',
            intensity: 'high',
            countdown: remaining
          });
        } else {
          setGuidance({
            phase: 'prepare',
            message: 'Rest complete! Ready for next set?',
            intensity: 'medium'
          });
        }
      }
    };

    const interval = setInterval(updateGuidance, 1000);
    updateGuidance(); // Initial call

    return () => clearInterval(interval);
  }, [guidance.phase, repsCompleted, timer, restStartTime, currentSetData, isActive]);

  // Generate form reminders based on exercise type
  useEffect(() => {
    if (!exercise || !currentSetData) return;

    const exerciseName = exercise.display_name?.toLowerCase() || '';
    const reminders = [];

    // Common form cues based on exercise type
    if (exerciseName.includes('squat')) {
      reminders.push('Keep chest up and knees tracking over toes');
      reminders.push('Descend until thighs are parallel to floor');
      reminders.push('Drive through heels to stand');
    } else if (exerciseName.includes('push') || exerciseName.includes('press')) {
      reminders.push('Maintain straight line from head to heels');
      reminders.push('Lower with control, push up explosively');
      reminders.push('Keep core engaged throughout');
    } else if (exerciseName.includes('pull') || exerciseName.includes('row')) {
      reminders.push('Squeeze shoulder blades together');
      reminders.push('Pull with your back, not just arms');
      reminders.push('Control the negative portion');
    } else if (exerciseName.includes('plank') || exerciseName.includes('hold')) {
      reminders.push('Maintain neutral spine position');
      reminders.push('Breathe steadily, don\'t hold breath');
      reminders.push('Engage core and glutes');
    }

    // RPE-based intensity cues
    const rpe = currentSetData.rpe || 7;
    if (rpe >= 8) {
      reminders.push('This should feel challenging - push your limits');
    } else if (rpe <= 5) {
      reminders.push('Focus on perfect form over speed');
    }

    setFormReminders(reminders);
  }, [exercise, currentSetData]);

  // Adaptive coaching based on performance
  useEffect(() => {
    if (currentSet === 1) {
      setAdaptiveCoaching('First set - establish your rhythm and focus on form');
    } else if (currentSet === totalSets) {
      setAdaptiveCoaching('Final set! Leave everything on the table');
    } else {
      setAdaptiveCoaching('Maintain consistency from your previous set');
    }
  }, [currentSet, totalSets]);

  const startSet = () => {
    setTimer(0);
    setRepsCompleted(0);
    setIsTimerRunning(true);
    setGuidance({
      phase: 'work',
      message: 'Set started! Focus on your form',
      intensity: 'medium'
    });
  };

  const completeSet = () => {
    setIsTimerRunning(false);
    setRestStartTime(new Date());
    setGuidance({
      phase: 'rest',
      message: 'Great set! Take your rest',
      intensity: 'low'
    });

    // Collect feedback
    const feedback: SetFeedback = {
      repsCompleted: repsCompleted || currentSetData?.reps || 0,
      difficultyRating: 3, // Default, would be user input
      formQuality: 4, // Default, would be user input
      actualRestTime: timer
    };

    onSetComplete(feedback);
  };

  const skipRest = () => {
    setRestStartTime(null);
    setGuidance({
      phase: 'prepare',
      message: 'Ready for your next set?',
      intensity: 'low'
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getIntensityColor = (intensity: 'low' | 'medium' | 'high') => {
    switch (intensity) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  if (!currentSetData) {
    return (
      <Card padding="lg" className={className}>
        <div className="text-center">
          <CheckCircle2 className="w-12 h-12 text-primary-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">
            Exercise Complete!
          </h3>
          <p className="text-secondary-600 mb-4">
            Great job completing all sets for {exercise.display_name}
          </p>
          <Button variant="primary" onClick={onExerciseComplete}>
            Next Exercise
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Exercise Header */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-secondary-900">
              {exercise.display_name}
            </h2>
            <p className="text-sm text-secondary-600">
              Set {currentSet} of {totalSets}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" size="sm">
              {currentSetData.reps > 0 ? `${currentSetData.reps} reps` : `${currentSetData.time_sec}s`}
            </Badge>
            {currentSetData.rpe && (
              <Badge variant="outline" size="sm">
                RPE {currentSetData.rpe}
              </Badge>
            )}
          </div>
        </div>

        {/* Real-time Guidance */}
        <div className={clsx(
          'p-4 rounded-lg border-2 mb-4',
          getIntensityColor(guidance.intensity)
        )}>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {guidance.phase === 'work' && <Zap className="w-6 h-6" />}
              {guidance.phase === 'rest' && <Timer className="w-6 h-6" />}
              {guidance.phase === 'prepare' && <Target className="w-6 h-6" />}
            </div>
            <div className="flex-1">
              <p className="font-medium">{guidance.message}</p>
              {guidance.countdown && (
                <p className="text-sm mt-1">
                  {guidance.countdown > 0 ? `${guidance.countdown}s remaining` : 'Time\'s up!'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Adaptive Coaching */}
        {adaptiveCoaching && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-primary-600" />
              <p className="text-sm text-primary-800">{adaptiveCoaching}</p>
            </div>
          </div>
        )}

        {/* Timer and Progress */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary-900">
              {formatTime(timer)}
            </div>
            <div className="text-xs text-secondary-600">Elapsed Time</div>
          </div>
          
          {currentSetData.reps > 0 && (
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {repsCompleted}/{currentSetData.reps}
              </div>
              <div className="text-xs text-secondary-600">Reps</div>
            </div>
          )}
        </div>

        {/* Rep Counter for rep-based exercises */}
        {currentSetData.reps > 0 && guidance.phase === 'work' && (
          <div className="flex justify-center gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRepsCompleted(Math.max(0, repsCompleted - 1))}
              disabled={repsCompleted === 0}
            >
              -1
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setRepsCompleted(Math.min(currentSetData.reps, repsCompleted + 1))}
              disabled={repsCompleted >= currentSetData.reps}
            >
              +1 Rep
            </Button>
          </div>
        )}

        {/* Control Buttons */}
        <div className="space-y-3">
          {guidance.phase === 'prepare' && (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              leftIcon={<Play className="w-5 h-5" />}
              onClick={startSet}
            >
              Start Set
            </Button>
          )}

          {guidance.phase === 'work' && (
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="secondary"
                size="lg"
                leftIcon={<Pause className="w-5 h-5" />}
                onClick={() => setIsTimerRunning(!isTimerRunning)}
              >
                {isTimerRunning ? 'Pause' : 'Resume'}
              </Button>
              <Button
                variant="primary"
                size="lg"
                leftIcon={<CheckCircle2 className="w-5 h-5" />}
                onClick={completeSet}
              >
                Complete Set
              </Button>
            </div>
          )}

          {guidance.phase === 'rest' && (
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="lg"
                leftIcon={<SkipForward className="w-5 h-5" />}
                onClick={skipRest}
              >
                Skip Rest
              </Button>
              <Button
                variant="secondary"
                size="lg"
                disabled
              >
                Resting...
              </Button>
            </div>
          )}
        </div>

        {/* Secondary Controls */}
        <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-secondary-200">
          <button
            onClick={() => setShowFormTips(!showFormTips)}
            className="flex items-center gap-2 text-sm text-secondary-600 hover:text-secondary-900"
          >
            {showFormTips ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            Form Tips
          </button>
          
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-2 text-sm text-secondary-600 hover:text-secondary-900"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            Sound
          </button>
        </div>
      </Card>

      {/* Form Tips */}
      {showFormTips && formReminders.length > 0 && (
        <Card padding="md" variant="outline">
          <h4 className="font-semibold text-secondary-900 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Form Reminders
          </h4>
          <div className="space-y-2">
            {formReminders.map((reminder, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0" />
                <p className="text-secondary-700">{reminder}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Exercise Instructions */}
      {exercise.instructions && exercise.instructions.length > 0 && (
        <Card padding="md" variant="outline">
          <h4 className="font-semibold text-secondary-900 mb-3">
            Exercise Instructions
          </h4>
          <div className="space-y-2">
            {exercise.instructions.map((instruction, index) => (
              <div key={index} className="flex items-start gap-3 text-sm">
                <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <p className="text-secondary-700">{instruction}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default SmartWorkoutGuide;
