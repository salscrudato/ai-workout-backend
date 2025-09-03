import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';

interface RestTimerProps {
  restTimeSeconds: number;
  onComplete?: () => void;
  className?: string;
  autoStart?: boolean;
}

const RestTimer: React.FC<RestTimerProps> = ({
  restTimeSeconds,
  onComplete,
  className = '',
  autoStart = true
}) => {
  const [timeLeft, setTimeLeft] = useState(restTimeSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isCompleted, setIsCompleted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-start timer when component mounts if autoStart is true
  useEffect(() => {
    if (autoStart) {
      setIsRunning(true);
      setIsCompleted(false);
    }
  }, [autoStart]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            onComplete?.();
            return 0;
          }
          return prev - 1;
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
  }, [isRunning, timeLeft, onComplete]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    return ((restTimeSeconds - timeLeft) / restTimeSeconds) * 100;
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
    setTimeLeft(restTimeSeconds);
    setIsCompleted(false);
  };

  const getTimerColor = () => {
    if (isCompleted) return 'text-green-600';
    if (timeLeft <= 10) return 'text-red-600';
    if (timeLeft <= 30) return 'text-yellow-600';
    return 'text-blue-600';
  };

  const getProgressColor = () => {
    if (isCompleted) return 'bg-green-500';
    if (timeLeft <= 10) return 'bg-red-500';
    if (timeLeft <= 30) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Rest Timer</span>
        </div>
        {isCompleted && (
          <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
            Complete!
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div 
          className={`h-2 rounded-full transition-all duration-1000 ${getProgressColor()}`}
          style={{ width: `${getProgressPercentage()}%` }}
        />
      </div>

      {/* Timer display */}
      <div className={`text-4xl font-bold text-center mb-4 ${getTimerColor()}`}>
        {formatTime(timeLeft)}
      </div>

      {/* Control buttons */}
      <div className="flex justify-center space-x-3">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Play className="h-4 w-4" />
            <span>Start</span>
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="flex items-center space-x-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            <Pause className="h-4 w-4" />
            <span>Pause</span>
          </button>
        )}
        
        <button
          onClick={handleReset}
          className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Reset</span>
        </button>
      </div>

      {/* Rest type indicator */}
      <div className="mt-3 text-center">
        <span className="text-xs text-gray-500">
          Recommended rest: {formatTime(restTimeSeconds)}
        </span>
      </div>
    </div>
  );
};

export default RestTimer;
