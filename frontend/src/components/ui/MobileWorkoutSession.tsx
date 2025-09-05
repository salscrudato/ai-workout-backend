import React, { useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  CheckCircle2,
  Clock,
  Target,
  Zap,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  Timer,
  Activity
} from 'lucide-react';
import Button from './Button';
import Badge from './Badge';
import Card from './Card';
import type { WorkoutExercise, WorkoutPlan } from '../../types/api';

interface MobileWorkoutSessionProps {
  workout: WorkoutPlan;
  onComplete: () => void;
  onPause?: () => void;
  onResume?: () => void;
  className?: string;
}

interface ExerciseTimer {
  isActive: boolean;
  timeRemaining: number;
  totalTime: number;
  type: 'work' | 'rest' | 'prepare';
}

const MobileWorkoutSession: React.FC<MobileWorkoutSessionProps> = ({
  workout,
  onComplete,
  onPause,
  onResume,
  className,
}) => {
  const [currentPhase, setCurrentPhase] = useState<'warmup' | 'main' | 'cooldown'>('warmup');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [totalElapsedTime, setTotalElapsedTime] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [exerciseTimer, setExerciseTimer] = useState<ExerciseTimer>({
    isActive: false,
    timeRemaining: 0,
    totalTime: 0,
    type: 'prepare'
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showExerciseDetails, setShowExerciseDetails] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Get current exercise based on phase and index
  const getCurrentExercise = () => {
    switch (currentPhase) {
      case 'warmup':
        return workout.warmup?.[currentExerciseIndex];
      case 'main':
        return workout.exercises?.[currentExerciseIndex];
      case 'cooldown':
        return workout.cooldown?.[currentExerciseIndex];
      default:
        return null;
    }
  };

  const currentExercise = getCurrentExercise();
  const currentSet = currentExercise?.sets?.[currentSetIndex];

  // Calculate total progress
  const getTotalProgress = () => {
    const warmupTotal = workout.warmup?.length || 0;
    const mainTotal = workout.exercises?.length || 0;
    const cooldownTotal = workout.cooldown?.length || 0;
    const totalExercises = warmupTotal + mainTotal + cooldownTotal;

    let completed = 0;
    if (currentPhase === 'warmup') {
      completed = currentExerciseIndex;
    } else if (currentPhase === 'main') {
      completed = warmupTotal + currentExerciseIndex;
    } else if (currentPhase === 'cooldown') {
      completed = warmupTotal + mainTotal + currentExerciseIndex;
    }

    return Math.round((completed / totalExercises) * 100);
  };

  // Timer management
  useEffect(() => {
    if (exerciseTimer.isActive && exerciseTimer.timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setExerciseTimer(prev => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        }));
      }, 1000);
    } else if (exerciseTimer.timeRemaining === 0 && exerciseTimer.isActive) {
      handleTimerComplete();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [exerciseTimer.isActive, exerciseTimer.timeRemaining]);

  // Session timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSessionActive && sessionStartTime) {
      interval = setInterval(() => {
        setTotalElapsedTime(Math.floor((Date.now() - sessionStartTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive, sessionStartTime]);

  const handleTimerComplete = () => {
    if (soundEnabled) {
      playSound();
    }
    
    setExerciseTimer(prev => ({ ...prev, isActive: false }));
    
    // Auto-advance logic
    if (exerciseTimer.type === 'work') {
      startRestTimer();
    } else if (exerciseTimer.type === 'rest') {
      nextSet();
    }
  };

  const playSound = () => {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const startSession = () => {
    setIsSessionActive(true);
    setSessionStartTime(new Date());
    onResume?.();
  };

  const pauseSession = () => {
    setIsSessionActive(false);
    setExerciseTimer(prev => ({ ...prev, isActive: false }));
    onPause?.();
  };

  const resumeSession = () => {
    setIsSessionActive(true);
    onResume?.();
  };

  const startWorkTimer = () => {
    if (!currentSet) return;
    
    const workTime = currentSet.time_sec || 30;
    setExerciseTimer({
      isActive: true,
      timeRemaining: workTime,
      totalTime: workTime,
      type: 'work'
    });
  };

  const startRestTimer = () => {
    if (!currentSet) return;
    
    const restTime = currentSet.rest_sec || 60;
    setExerciseTimer({
      isActive: true,
      timeRemaining: restTime,
      totalTime: restTime,
      type: 'rest'
    });
  };

  const nextSet = () => {
    if (!currentExercise) return;

    const setsCount = typeof currentExercise.sets === 'number' ? currentExercise.sets : currentExercise.sets?.length || 1;
    if (currentSetIndex < setsCount - 1) {
      setCurrentSetIndex(currentSetIndex + 1);
    } else {
      nextExercise();
    }
  };

  const nextExercise = () => {
    const exerciseId = `${currentPhase}-${currentExerciseIndex}`;
    setCompletedExercises(prev => new Set([...prev, exerciseId]));
    
    const currentPhaseExercises = getCurrentPhaseExercises();
    
    if (currentExerciseIndex < currentPhaseExercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSetIndex(0);
    } else {
      nextPhase();
    }
  };

  const getCurrentPhaseExercises = () => {
    switch (currentPhase) {
      case 'warmup': return workout.warmup || [];
      case 'main': return workout.exercises || [];
      case 'cooldown': return workout.cooldown || [];
      default: return [];
    }
  };

  const nextPhase = () => {
    if (currentPhase === 'warmup') {
      setCurrentPhase('main');
    } else if (currentPhase === 'main') {
      setCurrentPhase('cooldown');
    } else {
      completeWorkout();
    }
    setCurrentExerciseIndex(0);
    setCurrentSetIndex(0);
  };

  const completeWorkout = () => {
    setIsSessionActive(false);
    onComplete();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (exerciseTimer.type === 'work') return 'bg-primary-500';
    if (exerciseTimer.type === 'rest') return 'bg-blue-500';
    return 'bg-secondary-500';
  };

  const getTimerProgress = () => {
    if (exerciseTimer.totalTime === 0) return 0;
    return ((exerciseTimer.totalTime - exerciseTimer.timeRemaining) / exerciseTimer.totalTime) * 100;
  };

  if (!currentExercise) {
    return (
      <div className="text-center p-8">
        <CheckCircle2 className="w-16 h-16 text-primary-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-secondary-900 mb-2">
          Workout Complete!
        </h2>
        <p className="text-secondary-600 mb-6">
          Great job! You've completed your workout.
        </p>
        <Button variant="primary" onClick={onComplete}>
          Finish Workout
        </Button>
      </div>
    );
  }

  return (
    <div className={clsx('min-h-screen bg-gray-50', className)}>
      {/* Header with Progress */}
      <div className="bg-white border-b border-secondary-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-bold text-secondary-900 capitalize">
                {currentPhase} Phase
              </h1>
              <p className="text-sm text-secondary-600">
                Exercise {currentExerciseIndex + 1} of {getCurrentPhaseExercises().length}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-secondary-900">
                {formatTime(totalElapsedTime)}
              </div>
              <div className="text-xs text-secondary-600">
                {getTotalProgress()}% complete
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-secondary-200 rounded-full h-2">
            <div 
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getTotalProgress()}%` }}
            />
          </div>
        </div>
      </div>

      {/* Timer Display */}
      {exerciseTimer.isActive && (
        <div className="bg-white border-b border-secondary-200">
          <div className="px-4 py-6 text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-secondary-200"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 54}`}
                  strokeDashoffset={`${2 * Math.PI * 54 * (1 - getTimerProgress() / 100)}`}
                  className={exerciseTimer.type === 'work' ? 'text-primary-500' : 'text-blue-500'}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary-900">
                    {formatTime(exerciseTimer.timeRemaining)}
                  </div>
                  <div className="text-xs text-secondary-600 uppercase tracking-wide">
                    {exerciseTimer.type}
                  </div>
                </div>
              </div>
            </div>
            
            <Badge 
              variant={exerciseTimer.type === 'work' ? 'primary' : 'secondary'}
              size="lg"
            >
              {exerciseTimer.type === 'work' ? 'Work Time' : 'Rest Time'}
            </Badge>
          </div>
        </div>
      )}

      {/* Current Exercise */}
      <div className="p-4">
        <Card padding="lg">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-secondary-900 mb-2">
              {currentExercise.display_name || currentExercise.name}
            </h2>
            
            {currentSet && (
              <div className="flex justify-center gap-4 mb-4">
                {currentSet.reps > 0 && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">
                      {currentSet.reps}
                    </div>
                    <div className="text-xs text-secondary-600">REPS</div>
                  </div>
                )}
                
                {currentSet.time_sec > 0 && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">
                      {currentSet.time_sec}s
                    </div>
                    <div className="text-xs text-secondary-600">TIME</div>
                  </div>
                )}
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {currentSet.rest_sec}s
                  </div>
                  <div className="text-xs text-secondary-600">REST</div>
                </div>
              </div>
            )}

            <div className="flex justify-center gap-2 mb-4">
              <Badge variant="outline" size="sm">
                Set {currentSetIndex + 1} of {typeof currentExercise.sets === 'number' ? currentExercise.sets : currentExercise.sets?.length || 1}
              </Badge>
              {currentSet?.rpe && (
                <Badge variant="outline" size="sm">
                  RPE {currentSet.rpe}
                </Badge>
              )}
            </div>
          </div>

          {/* Exercise Instructions Toggle */}
          <button
            onClick={() => setShowExerciseDetails(!showExerciseDetails)}
            className="w-full flex items-center justify-center gap-2 text-sm text-secondary-600 mb-4"
          >
            <span>Exercise Details</span>
            {showExerciseDetails ? 
              <ChevronUp className="w-4 h-4" /> : 
              <ChevronDown className="w-4 h-4" />
            }
          </button>

          {showExerciseDetails && (
            <div className="bg-secondary-50 rounded-lg p-4 mb-6 text-sm">
              {currentExercise.instructions?.map((instruction, index) => (
                <div key={index} className="flex items-start gap-2 mb-2 last:mb-0">
                  <div className="w-5 h-5 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-secondary-700">{instruction}</p>
                </div>
              ))}
              
              {currentSet?.notes && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    <strong>Tip:</strong> {currentSet.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Control Buttons */}
          <div className="space-y-3">
            {!isSessionActive ? (
              <Button
                variant="primary"
                size="lg"
                fullWidth
                leftIcon={<Play className="w-5 h-5" />}
                onClick={startSession}
              >
                Start Workout
              </Button>
            ) : (
              <>
                {!exerciseTimer.isActive ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="primary"
                      size="lg"
                      leftIcon={<Timer className="w-5 h-5" />}
                      onClick={startWorkTimer}
                    >
                      Start Set
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      leftIcon={<CheckCircle2 className="w-5 h-5" />}
                      onClick={nextSet}
                    >
                      Complete
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="secondary"
                      size="lg"
                      leftIcon={<Pause className="w-5 h-5" />}
                      onClick={() => setExerciseTimer(prev => ({ ...prev, isActive: false }))}
                    >
                      Pause
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      leftIcon={<SkipForward className="w-5 h-5" />}
                      onClick={() => {
                        setExerciseTimer(prev => ({ ...prev, isActive: false }));
                        nextSet();
                      }}
                    >
                      Skip
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Secondary Controls */}
            <div className="flex justify-center gap-4 pt-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 text-secondary-600 hover:text-secondary-900"
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
              
              <button
                onClick={pauseSession}
                className="p-2 text-secondary-600 hover:text-secondary-900"
              >
                <Pause className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => {
                  setCurrentExerciseIndex(0);
                  setCurrentSetIndex(0);
                  setCurrentPhase('warmup');
                  setCompletedExercises(new Set());
                  setTotalElapsedTime(0);
                  setIsSessionActive(false);
                }}
                className="p-2 text-secondary-600 hover:text-secondary-900"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MobileWorkoutSession;
