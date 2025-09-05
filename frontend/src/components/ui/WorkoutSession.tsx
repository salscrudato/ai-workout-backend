import React, { useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  Volume2, 
  VolumeX,
  Eye,
  EyeOff,
  CheckCircle,
  Clock,
  Target,
  Zap
} from 'lucide-react';
import Button from './Button';
import Badge from './Badge';
import ProgressBar from './ProgressBar';
import WorkoutTimer from './WorkoutTimer';
import ExerciseCard from './ExerciseCard';
import type { WorkoutExercise, WorkoutPlan } from '../../types/api';

// Exercise form tips database
const FORM_TIPS: Record<string, string[]> = {
  'push-up': [
    'Keep your body in a straight line from head to heels',
    'Lower your chest to just above the ground',
    'Push through your palms, not your fingertips',
    'Engage your core throughout the movement'
  ],
  'squat': [
    'Keep your chest up and shoulders back',
    'Lower until your thighs are parallel to the ground',
    'Keep your knees in line with your toes',
    'Drive through your heels to stand up'
  ],
  'plank': [
    'Keep your body in a straight line',
    'Engage your core and glutes',
    'Don\'t let your hips sag or pike up',
    'Breathe steadily throughout the hold'
  ],
  'lunge': [
    'Step forward with control',
    'Lower your back knee toward the ground',
    'Keep your front knee over your ankle',
    'Push through your front heel to return'
  ],
  'burpee': [
    'Start in a standing position',
    'Drop into a squat, then jump back to plank',
    'Do a push-up, then jump feet to hands',
    'Explode up with arms overhead'
  ],
  'mountain climber': [
    'Start in a plank position',
    'Keep your core tight and hips level',
    'Drive your knees toward your chest alternately',
    'Maintain a steady, controlled pace'
  ],
  'deadlift': [
    'Keep the bar close to your body',
    'Hinge at the hips, not the knees',
    'Keep your back straight and chest up',
    'Drive through your heels to stand'
  ],
  'row': [
    'Pull your shoulder blades together',
    'Keep your elbows close to your body',
    'Squeeze at the top of the movement',
    'Control the weight on the way down'
  ]
};

const getFormTips = (exerciseName: string): string[] => {
  const name = exerciseName.toLowerCase();
  for (const [key, tips] of Object.entries(FORM_TIPS)) {
    if (name.includes(key)) {
      return tips;
    }
  }
  return [
    'Focus on proper form over speed',
    'Breathe steadily throughout the movement',
    'Control both the lifting and lowering phases',
    'Stop if you feel any pain or discomfort'
  ];
};

export interface WorkoutSessionProps {
  workout: WorkoutPlan;
  onComplete: (sessionData: WorkoutSessionData) => void;
  onPause?: () => void;
  onResume?: () => void;
  className?: string;
}

export interface WorkoutSessionData {
  completedExercises: string[];
  totalDuration: number;
  restTimes: Record<string, number>;
  skippedExercises: string[];
  notes: string;
}

type SessionPhase = 'warmup' | 'main' | 'cooldown' | 'complete';

/**
 * Advanced workout session component with real-time tracking and guidance
 */
const WorkoutSession: React.FC<WorkoutSessionProps> = ({
  workout,
  onComplete,
  onPause,
  onResume,
  className,
}) => {
  const [currentPhase, setCurrentPhase] = useState<SessionPhase>('warmup');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [totalElapsedTime, setTotalElapsedTime] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [skippedExercises, setSkippedExercises] = useState<Set<string>>(new Set());
  const [restTimes, setRestTimes] = useState<Record<string, number>>({});
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showFormTips, setShowFormTips] = useState(true);
  const [currentRestTime, setCurrentRestTime] = useState<number | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      speechSynthesisRef.current = window.speechSynthesis;
    }
  }, []);

  // Session timer
  useEffect(() => {
    if (isSessionActive && sessionStartTime) {
      timerRef.current = setInterval(() => {
        setTotalElapsedTime(Math.floor((Date.now() - sessionStartTime.getTime()) / 1000));
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
  }, [isSessionActive, sessionStartTime]);

  const getCurrentExercises = (): WorkoutExercise[] => {
    switch (currentPhase) {
      case 'warmup':
        return workout.warmup || [];
      case 'main':
        return workout.exercises || [];
      case 'cooldown':
        return workout.cooldown || [];
      default:
        return [];
    }
  };

  const getCurrentExercise = (): WorkoutExercise | null => {
    const exercises = getCurrentExercises();
    return exercises[currentExerciseIndex] || null;
  };

  const getTotalExercises = (): number => {
    return (workout.warmup?.length || 0) + 
           (workout.exercises?.length || 0) + 
           (workout.cooldown?.length || 0);
  };

  const getCompletedCount = (): number => {
    return completedExercises.size;
  };

  const speak = (text: string) => {
    if (voiceEnabled && speechSynthesisRef.current) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesisRef.current.speak(utterance);
    }
  };

  const startSession = () => {
    setIsSessionActive(true);
    setSessionStartTime(new Date());
    speak(`Starting your ${workout.meta?.workout_name || 'workout'}. Let's begin with the warmup.`);
    onResume?.();
  };

  const pauseSession = () => {
    setIsSessionActive(false);
    speak('Workout paused. Take your time.');
    onPause?.();
  };

  const resumeSession = () => {
    setIsSessionActive(true);
    speak('Resuming workout. Let\'s keep going!');
    onResume?.();
  };

  const completeExercise = () => {
    const currentExercise = getCurrentExercise();
    if (!currentExercise) return;

    const exerciseId = `${currentPhase}-${currentExerciseIndex}`;
    setCompletedExercises(prev => new Set([...prev, exerciseId]));
    
    speak(`Great job completing ${currentExercise.name}!`);
    
    // Start rest timer if specified
    if (currentExercise.rest) {
      const restSeconds = parseRestTime(currentExercise.rest);
      setCurrentRestTime(restSeconds);
      speak(`Take a ${currentExercise.rest} rest.`);
    } else {
      moveToNextExercise();
    }
  };

  const skipExercise = () => {
    const exerciseId = `${currentPhase}-${currentExerciseIndex}`;
    setSkippedExercises(prev => new Set([...prev, exerciseId]));
    speak('Exercise skipped. Moving to the next one.');
    moveToNextExercise();
  };

  const moveToNextExercise = () => {
    const exercises = getCurrentExercises();
    
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      const nextExercise = exercises[currentExerciseIndex + 1];
      speak(`Next exercise: ${nextExercise.name}`);
    } else {
      moveToNextPhase();
    }
  };

  const moveToNextPhase = () => {
    switch (currentPhase) {
      case 'warmup':
        setCurrentPhase('main');
        setCurrentExerciseIndex(0);
        speak('Warmup complete! Moving to the main workout.');
        break;
      case 'main':
        setCurrentPhase('cooldown');
        setCurrentExerciseIndex(0);
        speak('Main workout complete! Time for cooldown.');
        break;
      case 'cooldown':
        completeSession();
        break;
    }
  };

  const completeSession = () => {
    setCurrentPhase('complete');
    setIsSessionActive(false);
    speak('Congratulations! Workout complete. Great job!');
    
    const sessionData: WorkoutSessionData = {
      completedExercises: Array.from(completedExercises),
      totalDuration: totalElapsedTime,
      restTimes,
      skippedExercises: Array.from(skippedExercises),
      notes: sessionNotes,
    };
    
    onComplete(sessionData);
  };

  const parseRestTime = (restString: string): number => {
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

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const currentExercise = getCurrentExercise();
  const exercises = getCurrentExercises();
  const progressPercentage = (getCompletedCount() / getTotalExercises()) * 100;

  if (currentPhase === 'complete') {
    return (
      <div className={clsx('bg-white rounded-2xl border border-secondary-200 p-8 text-center', className)}>
        <div className="bg-success-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-success-600" />
        </div>
        <h2 className="text-3xl font-bold text-secondary-900 mb-4">
          Workout Complete! 🎉
        </h2>
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <p className="text-2xl font-bold text-secondary-900">{formatTime(totalElapsedTime)}</p>
            <p className="text-sm text-secondary-600">Total Time</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-secondary-900">{getCompletedCount()}</p>
            <p className="text-sm text-secondary-600">Exercises Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-secondary-900">{Math.round(progressPercentage)}%</p>
            <p className="text-sm text-secondary-600">Completion Rate</p>
          </div>
        </div>
        <p className="text-secondary-600 mb-6">
          Great job pushing through! Your consistency is building stronger habits every day.
        </p>
      </div>
    );
  }

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Session Header */}
      <div className="bg-white rounded-2xl border border-secondary-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-secondary-900">
              {workout.meta?.workout_name || 'Workout Session'}
            </h2>
            <div className="flex items-center gap-4 mt-2">
              <Badge variant="primary" size="sm">
                {currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)}
              </Badge>
              <span className="text-sm text-secondary-600">
                {formatTime(totalElapsedTime)} elapsed
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              onClick={() => setVoiceEnabled(!voiceEnabled)}
            >
              {voiceEnabled ? 'Voice On' : 'Voice Off'}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              leftIcon={showFormTips ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              onClick={() => setShowFormTips(!showFormTips)}
            >
              Form Tips
            </Button>
          </div>
        </div>

        {/* Progress */}
        <ProgressBar
          value={progressPercentage}
          variant="success"
          showLabel
          label={`${getCompletedCount()} of ${getTotalExercises()} exercises`}
          animated={isSessionActive}
        />
      </div>

      {/* Session Controls */}
      <div className="bg-white rounded-2xl border border-secondary-200 p-6">
        <div className="flex items-center justify-center gap-4">
          {!isSessionActive ? (
            <Button
              variant="primary"
              size="lg"
              leftIcon={<Play className="w-5 h-5" />}
              onClick={sessionStartTime ? resumeSession : startSession}
            >
              {sessionStartTime ? 'Resume Workout' : 'Start Workout'}
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="lg"
              leftIcon={<Pause className="w-5 h-5" />}
              onClick={pauseSession}
            >
              Pause Workout
            </Button>
          )}
          
          <Button
            variant="outline"
            size="lg"
            leftIcon={<RotateCcw className="w-5 h-5" />}
            onClick={() => {
              setCurrentPhase('warmup');
              setCurrentExerciseIndex(0);
              setCompletedExercises(new Set());
              setSkippedExercises(new Set());
              setTotalElapsedTime(0);
              setSessionStartTime(null);
              setIsSessionActive(false);
            }}
          >
            Restart
          </Button>
        </div>
      </div>

      {/* Current Exercise */}
      {currentExercise && (
        <ExerciseCard
          exercise={currentExercise}
          isActive={isSessionActive}
          isCompleted={completedExercises.has(`${currentPhase}-${currentExerciseIndex}`)}
          onComplete={completeExercise}
          variant="detailed"
          showTimer={isSessionActive}
        />
      )}

      {/* Exercise Navigation */}
      <div className="bg-white rounded-2xl border border-secondary-200 p-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-secondary-600">
            Exercise {currentExerciseIndex + 1} of {exercises.length} in {currentPhase}
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={skipExercise}
              disabled={!isSessionActive}
            >
              Skip Exercise
            </Button>
            
            <Button
              variant="primary"
              size="sm"
              leftIcon={<SkipForward className="w-4 h-4" />}
              onClick={moveToNextExercise}
              disabled={!isSessionActive}
            >
              Next Exercise
            </Button>
          </div>
        </div>
      </div>

      {/* Rest Timer Modal */}
      {currentRestTime !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <WorkoutTimer
              duration={currentRestTime}
              variant="rest"
              title="Rest Period"
              subtitle="Take your time to recover"
              onComplete={() => {
                setCurrentRestTime(null);
                moveToNextExercise();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutSession;
