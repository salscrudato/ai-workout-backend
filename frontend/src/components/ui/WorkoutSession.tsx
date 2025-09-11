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
  Zap,
  ChevronLeft,
  ChevronRight,
  Timer,
  Activity,
  Award,
  Flame
} from 'lucide-react';
import Button from './Button';
import Badge from './Badge';
import ProgressBar from './ProgressBar';
import WorkoutTimer from './WorkoutTimer';
import ExerciseCard from './ExerciseCard';

import ProgressCelebration from './ProgressCelebration';
import TouchFeedback from './TouchFeedback';
import { useSwipeGesture } from '../../hooks/useSwipeGesture';
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

  // Enhanced feedback states
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackConfig, setFeedbackConfig] = useState<any>(null);
  const [celebrationTrigger, setCelebrationTrigger] = useState(false);
  const [celebrationConfig, setCelebrationConfig] = useState<any>(null);

  // Mobile swipe navigation
  const swipeNavigation = useSwipeGesture({
    onSwipeLeft: moveToNextExercise,
    onSwipeRight: moveToPreviousExercise,
  }, {
    threshold: 50,
    enableHapticFeedback: true,
  });

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

    // Trigger celebration animation
    setCelebrationConfig({
      type: 'exercise',
      message: 'Exercise Complete!',
      value: currentExercise.name,
    });
    setCelebrationTrigger(prev => !prev);

    speak(`Great job completing ${currentExercise.name}!`);

    // Check for milestones
    const newCompletedCount = completedExercises.size + 1;
    const totalExercises = getTotalExercises();

    if (newCompletedCount === Math.floor(totalExercises / 2)) {
      // Halfway milestone
      setTimeout(() => {
        setFeedbackConfig({
          type: 'milestone',
          title: 'Halfway There!',
          message: 'You\'re crushing this workout! Keep up the amazing work.',
          stats: {
            exercisesCompleted: newCompletedCount,
            totalExercises: totalExercises,
            timeElapsed: totalElapsedTime,
          },
          onContinue: () => setShowFeedback(false),
        });
        setShowFeedback(true);
      }, 1000);
    }

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

  const moveToPreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
    } else if (currentPhase !== 'warmup') {
      // Move to previous phase
      const phases: SessionPhase[] = ['warmup', 'main', 'cooldown'];
      const currentPhaseIndex = phases.indexOf(currentPhase);
      if (currentPhaseIndex > 0) {
        const previousPhase = phases[currentPhaseIndex - 1];
        setCurrentPhase(previousPhase);
        const previousPhaseExercises = getPhaseExercises(previousPhase);
        setCurrentExerciseIndex(previousPhaseExercises.length - 1);
      }
    }
  };

  const getNextExerciseName = () => {
    const exercises = getCurrentExercises();
    if (currentExerciseIndex < exercises.length - 1) {
      return exercises[currentExerciseIndex + 1].name;
    } else {
      // Check next phase
      const phases: SessionPhase[] = ['warmup', 'main', 'cooldown'];
      const currentPhaseIndex = phases.indexOf(currentPhase);
      if (currentPhaseIndex < phases.length - 1) {
        const nextPhase = phases[currentPhaseIndex + 1];
        const nextPhaseExercises = getPhaseExercises(nextPhase);
        return nextPhaseExercises.length > 0 ? nextPhaseExercises[0].name : null;
      }
    }
    return null;
  };

  const getPhaseExercises = (phase: SessionPhase): WorkoutExercise[] => {
    switch (phase) {
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

  // Additional helper functions for enhanced UI
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = getTotalExercises() > 0 ? (getCompletedCount() / getTotalExercises()) * 100 : 0;

  const moveToNextPhase = () => {
    // Trigger phase completion celebration
    const phaseNames = {
      warmup: 'Warm-up',
      main: 'Main Workout',
      cooldown: 'Cool-down'
    };

    setCelebrationConfig({
      type: 'milestone',
      message: `${phaseNames[currentPhase]} Complete!`,
      value: '🎉',
    });
    setCelebrationTrigger(prev => !prev);

    switch (currentPhase) {
      case 'warmup':
        setCurrentPhase('main');
        setCurrentExerciseIndex(0);
        speak('Warmup complete! Moving to the main workout.');

        // Show phase completion feedback
        setTimeout(() => {
          setFeedbackConfig({
            type: 'phase-complete',
            title: 'Warm-up Complete!',
            message: 'Great job getting warmed up! Ready for the main workout?',
            stats: {
              exercisesCompleted: getCompletedCount(),
              timeElapsed: totalElapsedTime,
            },
            onContinue: () => setShowFeedback(false),
          });
          setShowFeedback(true);
        }, 1500);
        break;

      case 'main':
        setCurrentPhase('cooldown');
        setCurrentExerciseIndex(0);
        speak('Main workout complete! Time for cooldown.');

        // Show main workout completion feedback
        setTimeout(() => {
          setFeedbackConfig({
            type: 'phase-complete',
            title: 'Main Workout Complete!',
            message: 'Outstanding effort! Time to cool down and stretch.',
            stats: {
              exercisesCompleted: getCompletedCount(),
              timeElapsed: totalElapsedTime,
            },
            onContinue: () => setShowFeedback(false),
          });
          setShowFeedback(true);
        }, 1500);
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

    // Trigger workout completion celebration
    setCelebrationConfig({
      type: 'personal-best',
      message: 'Workout Complete!',
      value: '🏆',
    });
    setCelebrationTrigger(prev => !prev);

    // Show workout completion feedback
    setTimeout(() => {
      setFeedbackConfig({
        type: 'workout-complete',
        title: 'Workout Complete!',
        message: 'Congratulations! You crushed this workout. Your dedication is paying off!',
        stats: {
          exercisesCompleted: getCompletedCount(),
          totalExercises: getTotalExercises(),
          timeElapsed: totalElapsedTime,
          caloriesBurned: Math.round(totalElapsedTime * 0.15), // Rough estimate
        },
        onContinue: () => {
          setShowFeedback(false);
          const sessionData: WorkoutSessionData = {
            completedExercises: Array.from(completedExercises),
            totalDuration: totalElapsedTime,
            restTimes,
            skippedExercises: Array.from(skippedExercises),
            notes: sessionNotes,
          };
          onComplete(sessionData);
        },
      });
      setShowFeedback(true);
    }, 2000);
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

  const currentExercise = getCurrentExercise();
  const exercises = getCurrentExercises();

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
    <div
      ref={swipeNavigation.ref}
      className={clsx('space-y-6 swipeable', className)}
    >
      {/* Enhanced Session Header with Premium Design */}
      <div className="glass-premium rounded-3xl p-6 shadow-glow-blue">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-3xl font-bold gradient-text-primary mb-2">
              {workout.meta?.workout_name || 'Workout Session'}
            </h2>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 glass-light rounded-full px-3 py-1.5">
                <Timer className="w-4 h-4 text-primary-600" />
                <span className="font-semibold text-primary-700">
                  {formatTime(totalElapsedTime)} elapsed
                </span>
              </div>
              <div className="flex items-center gap-2 glass-light rounded-full px-3 py-1.5">
                <Activity className="w-4 h-4 text-purple-600" />
                <span className="font-semibold text-purple-700">
                  {currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)} Phase
                </span>
              </div>
              <div className="flex items-center gap-2 glass-light rounded-full px-3 py-1.5">
                <Flame className="w-4 h-4 text-cyan-600" />
                <span className="font-semibold text-cyan-700">
                  {getTotalExercises()} exercises
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <TouchFeedback
              onTap={() => setVoiceEnabled(!voiceEnabled)}
              feedbackType="scale"
            >
              <Button
                variant={voiceEnabled ? 'primary' : 'outline'}
                size="sm"
                leftIcon={voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                className="hover-lift-subtle touch-target"
              >
                {voiceEnabled ? 'Sound On' : 'Sound Off'}
              </Button>
            </TouchFeedback>

            <TouchFeedback
              onTap={() => setShowFormTips(!showFormTips)}
              feedbackType="scale"
            >
              <Button
                variant={showFormTips ? 'primary' : 'outline'}
                size="sm"
                leftIcon={showFormTips ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                className="hover-lift-subtle touch-target"
              >
                Form Tips
              </Button>
            </TouchFeedback>
          </div>
        </div>

        {/* Enhanced Progress Visualization */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-semibold gradient-text-subtle">
              Overall Progress
            </span>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary-600" />
              <span className="text-xl font-bold gradient-text-primary">
                {Math.round(progressPercentage)}%
              </span>
            </div>
          </div>
          <div className="relative">
            <ProgressBar
              value={progressPercentage}
              variant="success"
              showLabel={false}
              animated={isSessionActive}
              className="h-3 rounded-full"
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-400 via-purple-400 to-cyan-400 opacity-20 animate-pulse"></div>
          </div>
          <div className="text-sm text-neutral-600 mt-2 text-center">
            {getCompletedCount()} of {getTotalExercises()} exercises completed
          </div>
        </div>

        {/* Enhanced Phase Navigation */}
        <div className="grid grid-cols-3 gap-3">
          {(['warmup', 'main', 'cooldown'] as const).map((phase, index) => {
            const isActive = currentPhase === phase;
            const phaseExercises = getPhaseExercises(phase);
            const completedInPhase = phaseExercises.filter((_, i) =>
              completedExercises.has(`${phase}-${i}`)
            ).length;
            const progressPercent = phaseExercises.length > 0 ? (completedInPhase / phaseExercises.length) * 100 : 0;
            const isCompleted = progressPercent === 100;

            return (
              <div
                key={phase}
                className={clsx(
                  'relative text-center py-4 px-3 rounded-2xl text-sm font-semibold transition-all duration-300 cursor-pointer hover-lift-subtle',
                  isActive
                    ? 'glass-tinted border-2 border-primary-300 shadow-glow-blue'
                    : isCompleted
                    ? 'glass-light border border-success-300 text-success-700'
                    : 'glass-subtle border border-neutral-200 text-neutral-600 hover:border-primary-200'
                )}
              >
                {isCompleted && (
                  <CheckCircle className="w-4 h-4 text-success-600 absolute top-2 right-2" />
                )}
                <div className={clsx(
                  'text-base font-bold mb-1',
                  isActive ? 'gradient-text-primary' : isCompleted ? 'text-success-700' : 'text-neutral-700'
                )}>
                  {phase === 'warmup' ? 'Warm-up' : phase === 'main' ? 'Main Workout' : 'Cool-down'}
                </div>
                <div className="text-xs opacity-75">
                  {Math.round(progressPercent)}% complete
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Enhanced Session Controls */}
      <div className="glass-light rounded-3xl p-6 border border-primary-200/30">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-neutral-600">
            Exercise {currentExerciseIndex + 1} of {exercises.length} in {currentPhase} phase
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-neutral-500">Next:</span>
            <span className="font-semibold text-neutral-700">
              {getNextExerciseName() || 'Complete!'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mb-4">
          {!isSessionActive ? (
            <TouchFeedback
              onTap={sessionStartTime ? resumeSession : startSession}
              feedbackType="glow"
            >
              <Button
                variant="primary"
                size="xl"
                leftIcon={<Play className="w-6 h-6" />}
                className="hover-lift shadow-glow-blue px-8 touch-target"
              >
                {sessionStartTime ? 'Resume Workout' : 'Start Workout'}
              </Button>
            </TouchFeedback>
          ) : (
            <TouchFeedback
              onTap={pauseSession}
              feedbackType="glow"
            >
              <Button
                variant="secondary"
                size="xl"
                leftIcon={<Pause className="w-6 h-6" />}
                className="hover-lift px-8 touch-target"
              >
                Pause Workout
              </Button>
            </TouchFeedback>
          )}

          <TouchFeedback
            onTap={() => {
              setCurrentPhase('warmup');
              setCurrentExerciseIndex(0);
              setCompletedExercises(new Set());
              setSkippedExercises(new Set());
              setTotalElapsedTime(0);
              setSessionStartTime(null);
              setIsSessionActive(false);
            }}
            feedbackType="scale"
          >
            <Button
              variant="outline"
              size="lg"
              leftIcon={<RotateCcw className="w-5 h-5" />}
              className="hover-lift-subtle touch-target"
            >
              Restart
            </Button>
          </TouchFeedback>
        </div>

        {/* Quick Navigation */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ChevronLeft className="w-4 h-4" />}
            onClick={moveToPreviousExercise}
            disabled={currentExerciseIndex === 0 && currentPhase === 'warmup'}
            className="hover-lift-subtle"
          >
            Previous
          </Button>

          <div className="px-4 py-2 glass-subtle rounded-full text-sm font-medium">
            {currentExerciseIndex + 1} / {exercises.length}
          </div>

          <Button
            variant="ghost"
            size="sm"
            rightIcon={<ChevronRight className="w-4 h-4" />}
            onClick={moveToNextExercise}
            disabled={currentExerciseIndex === exercises.length - 1 && currentPhase === 'cooldown'}
            className="hover-lift-subtle"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Enhanced Current Exercise Display */}
      {currentExercise && (
        <div className="space-y-6">
          <ExerciseCard
            exercise={currentExercise}
            isActive={isSessionActive}
            isCompleted={completedExercises.has(`${currentPhase}-${currentExerciseIndex}`)}
            onComplete={completeExercise}
            variant="detailed"
            showTimer={isSessionActive}
          />

          {/* Exercise Action Bar */}
          <div className="glass-light rounded-2xl p-4 border border-neutral-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="md"
                  onClick={skipExercise}
                  disabled={!isSessionActive}
                  className="hover-lift-subtle"
                >
                  Skip Exercise
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<SkipForward className="w-4 h-4" />}
                  onClick={moveToNextExercise}
                  disabled={!isSessionActive}
                  className="hover-lift"
                >
                  Complete & Next
                </Button>
              </div>

              <div className="text-sm text-neutral-600">
                {currentExercise.restTime && (
                  <span className="flex items-center gap-1">
                    <Timer className="w-4 h-4" />
                    Rest: {currentExercise.restTime}s after completion
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Rest Timer Modal */}
      {currentRestTime !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-premium rounded-3xl p-8 max-w-md w-full shadow-glow-blue border-2 border-primary-200/30">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full glass-tinted flex items-center justify-center">
                <Timer className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold gradient-text-primary mb-2">Rest Period</h3>
              <p className="text-neutral-600">Take your time to recover and prepare for the next exercise</p>
            </div>

            <WorkoutTimer
              duration={currentRestTime}
              variant="rest"
              title=""
              subtitle=""
              onComplete={() => {
                setCurrentRestTime(null);
                moveToNextExercise();
              }}
              className="mb-6"
            />

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={() => setCurrentRestTime(null)}
                className="flex-1 hover-lift-subtle"
              >
                Skip Rest
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setCurrentRestTime(null);
                  moveToNextExercise();
                }}
                className="flex-1 hover-lift"
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Feedback Components */}
      {showFeedback && feedbackConfig && (
        <div className="workout-feedback">
          <p>Workout feedback would go here</p>
          <Button onClick={() => setShowFeedback(false)}>Close</Button>
        </div>
      )}

      <ProgressCelebration
        trigger={celebrationTrigger}
        {...celebrationConfig}
        position="top"
      />

      {/* Mobile Swipe Instructions */}
      {isSessionActive && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 pointer-events-none">
          <div className="glass-subtle rounded-full px-4 py-2 text-xs text-neutral-600 text-center">
            <div className="flex items-center gap-2">
              <span>Swipe:</span>
              <span className="flex items-center gap-1">
                <span>←</span>
                <span>Next</span>
              </span>
              <span className="flex items-center gap-1">
                <span>→</span>
                <span>Previous</span>
              </span>
              <span className="flex items-center gap-1">
                <span>↑</span>
                <span>Complete</span>
              </span>
              <span className="flex items-center gap-1">
                <span>↓</span>
                <span>Skip</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Swipe Gesture Feedback */}
      {swipeNavigation.gestureState.isSwiping && (
        <div className="fixed inset-0 pointer-events-none z-30 flex items-center justify-center">
          <div className="glass-premium rounded-2xl p-4 border-2 border-primary-300 shadow-glow-blue">
            <div className="text-center">
              <div className="text-2xl mb-2">
                {swipeNavigation.gestureState.swipeDirection === 'left' && '← Next'}
                {swipeNavigation.gestureState.swipeDirection === 'right' && '→ Previous'}
                {swipeNavigation.gestureState.swipeDirection === 'up' && '↑ Complete'}
                {swipeNavigation.gestureState.swipeDirection === 'down' && '↓ Skip'}
              </div>
              <div className="text-sm text-neutral-600">
                Distance: {Math.round(swipeNavigation.gestureState.swipeDistance)}px
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutSession;
