import React, { useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { Play, Pause, RotateCcw, Clock, Volume2, VolumeX, CheckCircle, Timer, Zap, Award } from 'lucide-react';
import Button from './Button';

export interface WorkoutTimerProps {
  duration: number; // in seconds
  onComplete?: () => void;
  onTick?: (timeLeft: number) => void;
  className?: string;
  autoStart?: boolean;
  showControls?: boolean;
  variant?: 'default' | 'rest' | 'exercise' | 'warmup' | 'cooldown';
  title?: string;
  subtitle?: string;
}

/**
 * Enhanced WorkoutTimer component with audio cues, visual feedback, and multiple variants
 */
const WorkoutTimer: React.FC<WorkoutTimerProps> = ({
  duration,
  onComplete,
  onTick,
  className,
  autoStart = false,
  showControls = true,
  variant = 'default',
  title,
  subtitle,
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isCompleted, setIsCompleted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    'matchMedia' in window &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== 'undefined' && window.AudioContext) {
      audioContextRef.current = new AudioContext();
    }
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0 && !isCompleted) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          onTick?.(newTime);
          
          // Play sound cues
          if (soundEnabled && audioContextRef.current) {
            if (newTime === 10 || newTime === 5 || newTime === 3 || newTime === 2 || newTime === 1) {
              playBeep(800, 0.1);
            } else if (newTime === 0) {
              playBeep(1000, 0.3);
            }
          }
          
          if (newTime <= 0) {
            setIsRunning(false);
            setIsCompleted(true);
            onComplete?.();
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, isCompleted, onComplete, onTick, soundEnabled]);

  // Audio beep function
  const playBeep = (frequency: number, duration: number) => {
    if (!audioContextRef.current) return;
    
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration);
    
    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration);
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    return ((duration - timeLeft) / duration) * 100;
  };

  const getVariantStyles = () => {
    const styles = {
      default: {
        bg: 'bg-white dark:bg-secondary-900',
        border: 'border-secondary-200 dark:border-secondary-800',
        progress: 'bg-primary-500',
        text: 'text-secondary-900 dark:text-secondary-100',
      },
      rest: {
        bg: 'bg-accent-50 dark:bg-accent-900/20',
        border: 'border-accent-200 dark:border-accent-800/40',
        progress: 'bg-accent-500',
        text: 'text-accent-900 dark:text-accent-200',
      },
      exercise: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800/40',
        progress: 'bg-green-500',
        text: 'text-green-900 dark:text-green-200',
      },
      warmup: {
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        border: 'border-orange-200 dark:border-orange-800/40',
        progress: 'bg-orange-500',
        text: 'text-orange-900 dark:text-orange-200',
      },
      cooldown: {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        border: 'border-purple-200 dark:border-purple-800/40',
        progress: 'bg-purple-500',
        text: 'text-purple-900 dark:text-purple-200',
      },
    };
    return styles[variant];
  };

  const getTimerColor = () => {
    if (isCompleted) return 'text-green-600 dark:text-green-300';
    if (timeLeft <= 5) return 'text-red-600 dark:text-red-300';
    if (timeLeft <= 10) return 'text-yellow-600 dark:text-yellow-300';
    return getVariantStyles().text;
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsCompleted(false);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(duration);
    setIsCompleted(false);
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const variantStyles = getVariantStyles();

  return (
    <div
      className={clsx(
        'glass-premium rounded-3xl p-8 transition-all duration-300 hover-lift-subtle',
        isCompleted && 'shadow-glow-green border-2 border-success-300',
        variant === 'rest' && 'glass-tinted border-2 border-primary-300 shadow-glow-blue',
        variant === 'exercise' && 'glass-light border-2 border-success-300',
        className
      )}
    >
      {/* Enhanced Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={clsx(
            'w-12 h-12 rounded-full flex items-center justify-center',
            variant === 'rest' ? 'glass-tinted' : 'glass-light'
          )}>
            <Timer className={clsx(
              'w-6 h-6',
              variant === 'rest' ? 'text-primary-600' : 'text-success-600'
            )} />
          </div>
          <div>
            {title && (
              <h3 className="text-xl font-bold gradient-text-primary mb-1">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-neutral-600">{subtitle}</p>
            )}
          </div>
        </div>

        {isCompleted && (
          <div className="flex items-center gap-2 glass-light rounded-full px-4 py-2 border border-success-300">
            <Award className="w-5 h-5 text-success-600" />
            <span className="text-sm font-semibold text-success-700">Complete!</span>
          </div>
        )}
      </div>

      {/* Enhanced Circular Progress */}
      <div className="relative w-48 h-48 mx-auto mb-8">
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="text-neutral-200"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            className={clsx(
              'transition-all duration-1000 ease-out',
              variant === 'rest' ? 'text-primary-500' : 'text-success-500',
              isCompleted && 'text-success-500'
            )}
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgressPercentage() / 100)}`}
          />
        </svg>

        {/* Timer display in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={clsx(
              'text-5xl font-bold mb-2',
              isCompleted ? 'text-success-600' :
              variant === 'rest' ? 'gradient-text-primary' : 'gradient-text-blue'
            )} role="timer" aria-live="polite" aria-label="Timer" aria-valuetext={formatTime(timeLeft)}>
              {formatTime(timeLeft)}
            </div>
            <div className="text-sm font-medium text-neutral-500 uppercase tracking-wide">
              {isCompleted ? 'Complete' : isRunning ? 'Running' : 'Paused'}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Controls */}
      {showControls && (
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {!isRunning ? (
            <Button
              variant="primary"
              size="xl"
              leftIcon={<Play className="w-6 h-6" />}
              onClick={handleStart}
              disabled={isCompleted && timeLeft === 0}
              className="hover-lift shadow-glow-blue px-8"
            >
              {isCompleted ? 'Restart Timer' : 'Start Timer'}
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="xl"
              leftIcon={<Pause className="w-6 h-6" />}
              onClick={handlePause}
              className="hover-lift px-8"
            >
              Pause Timer
            </Button>
          )}

          <Button
            variant="outline"
            size="lg"
            leftIcon={<RotateCcw className="w-5 h-5" />}
            onClick={handleReset}
            className="hover-lift-subtle"
          >
            Reset
          </Button>

          <Button
            variant={soundEnabled ? "primary" : "ghost"}
            size="lg"
            leftIcon={soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            onClick={toggleSound}
            className="hover-lift-subtle"
          >
            {soundEnabled ? 'Sound On' : 'Sound Off'}
          </Button>
        </div>
      )}

      {/* Duration info */}
      <div className="mt-4 text-center">
        <span className="text-sm text-secondary-500">
          Total duration: {formatTime(duration)}
        </span>
      </div>
    </div>
  );
};

export default WorkoutTimer;
