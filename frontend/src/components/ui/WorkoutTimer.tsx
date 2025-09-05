import React, { useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { Play, Pause, RotateCcw, Clock, Volume2, VolumeX, CheckCircle } from 'lucide-react';
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
        bg: 'bg-white',
        border: 'border-secondary-200',
        progress: 'bg-primary-500',
        text: 'text-secondary-900',
      },
      rest: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        progress: 'bg-blue-500',
        text: 'text-blue-900',
      },
      exercise: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        progress: 'bg-green-500',
        text: 'text-green-900',
      },
      warmup: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        progress: 'bg-orange-500',
        text: 'text-orange-900',
      },
      cooldown: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        progress: 'bg-purple-500',
        text: 'text-purple-900',
      },
    };
    return styles[variant];
  };

  const getTimerColor = () => {
    if (isCompleted) return 'text-green-600';
    if (timeLeft <= 5) return 'text-red-600';
    if (timeLeft <= 10) return 'text-yellow-600';
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
        'rounded-2xl border p-6 transition-all duration-300',
        variantStyles.bg,
        variantStyles.border,
        isCompleted && 'ring-2 ring-green-500 ring-opacity-50',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={clsx('p-2 rounded-lg', variantStyles.bg)}>
            <Clock className="w-5 h-5 text-secondary-500" />
          </div>
          <div>
            {title && (
              <h3 className={clsx('font-semibold', variantStyles.text)}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-secondary-600">{subtitle}</p>
            )}
          </div>
        </div>
        
        {isCompleted && (
          <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Complete!</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-secondary-200 rounded-full h-3 mb-6">
        <div
          className={clsx(
            'h-3 rounded-full transition-all duration-1000',
            variantStyles.progress,
            isCompleted && 'bg-green-500'
          )}
          style={{ width: `${getProgressPercentage()}%` }}
        />
      </div>

      {/* Timer display */}
      <div className={clsx('text-6xl font-bold text-center mb-6', getTimerColor())}>
        {formatTime(timeLeft)}
      </div>

      {/* Controls */}
      {showControls && (
        <div className="flex items-center justify-center gap-3">
          {!isRunning ? (
            <Button
              variant="primary"
              size="lg"
              leftIcon={<Play className="w-5 h-5" />}
              onClick={handleStart}
              disabled={isCompleted && timeLeft === 0}
            >
              {isCompleted ? 'Restart' : 'Start'}
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="lg"
              leftIcon={<Pause className="w-5 h-5" />}
              onClick={handlePause}
            >
              Pause
            </Button>
          )}
          
          <Button
            variant="outline"
            size="lg"
            leftIcon={<RotateCcw className="w-5 h-5" />}
            onClick={handleReset}
          >
            Reset
          </Button>
          
          <Button
            variant="ghost"
            size="lg"
            leftIcon={soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            onClick={toggleSound}
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
