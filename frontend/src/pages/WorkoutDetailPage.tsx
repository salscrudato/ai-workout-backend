import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../services/api';
import {
  ArrowLeft,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  Star
} from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import RestTimer from '../components/RestTimer';
import type { WorkoutPlanResponse, WorkoutExercise } from '../types/api';

// Helper function to parse rest time strings like "90s", "2m", "1m 30s" into seconds
const parseRestTime = (restString: string): number => {
  if (!restString) return 60; // Default 60 seconds

  const timeStr = restString.toLowerCase();
  let totalSeconds = 0;

  // Match minutes (e.g., "2m", "1m")
  const minutesMatch = timeStr.match(/(\d+)m/);
  if (minutesMatch) {
    totalSeconds += parseInt(minutesMatch[1]) * 60;
  }

  // Match seconds (e.g., "30s", "90s")
  const secondsMatch = timeStr.match(/(\d+)s/);
  if (secondsMatch) {
    totalSeconds += parseInt(secondsMatch[1]);
  }

  // If no matches found, try to parse as just a number (assume seconds)
  if (totalSeconds === 0) {
    const numberMatch = timeStr.match(/(\d+)/);
    if (numberMatch) {
      totalSeconds = parseInt(numberMatch[1]);
    }
  }

  return totalSeconds || 60; // Default to 60 seconds if parsing fails
};

const WorkoutDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState<WorkoutPlanResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'warmup' | 'exercises' | 'cooldown'>('warmup');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restTimerKey, setRestTimerKey] = useState(0); // Force re-render of RestTimer

  useEffect(() => {
    const loadWorkout = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const workoutData = await apiClient.getWorkout(id);
        setWorkout(workoutData);
      } catch (error) {
        console.error('Failed to load workout:', error);
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkout();
  }, [id, navigate]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentPhaseExercises = (): WorkoutExercise[] => {
    if (!workout) return [];
    
    switch (currentPhase) {
      case 'warmup': return workout.plan.warmup || [];
      case 'exercises': return workout.plan.exercises || [];
      case 'cooldown': return workout.plan.cooldown || [];
      default: return [];
    }
  };

  const toggleExerciseComplete = (exerciseIndex: number) => {
    const exerciseKey = `${currentPhase}-${exerciseIndex}`;
    const newCompleted = new Set(completedExercises);

    if (newCompleted.has(exerciseKey)) {
      newCompleted.delete(exerciseKey);
      setShowRestTimer(false);
    } else {
      newCompleted.add(exerciseKey);
      // Start rest timer if exercise has rest time and we're not on the last exercise of the phase
      const currentExercises = getCurrentPhaseExercises();
      const currentExercise = currentExercises[exerciseIndex];
      const isLastExerciseInPhase = exerciseIndex >= currentExercises.length - 1;
      const isLastPhase = currentPhase === 'cooldown';

      if (currentExercise?.rest && !isLastExerciseInPhase && !isLastPhase) {
        setShowRestTimer(true);
        setRestTimerKey(prev => prev + 1); // Force re-render
      }
    }

    setCompletedExercises(newCompleted);
  };

  const startWorkout = () => {
    setIsWorkoutStarted(true);
    setIsTimerRunning(true);
  };

  const pauseResumeTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setTimer(0);
    setIsTimerRunning(false);
  };

  const nextPhase = () => {
    if (currentPhase === 'warmup') {
      setCurrentPhase('exercises');
    } else if (currentPhase === 'exercises') {
      setCurrentPhase('cooldown');
    }
    setCurrentExerciseIndex(0);
    setShowRestTimer(false); // Hide rest timer when moving to next phase
  };

  const moveToNextExercise = () => {
    const currentExercises = getCurrentPhaseExercises();
    if (currentExerciseIndex < currentExercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setShowRestTimer(false); // Hide rest timer when manually moving to next exercise
    } else {
      nextPhase();
    }
  };

  const completeWorkout = async () => {
    if (!workout?.id) return;
    
    try {
      setIsCompleting(true);
      await apiClient.completeWorkout(workout.id, feedback, rating);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to complete workout:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading workout..." />
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-secondary-900 mb-2">Workout not found</h2>
          <Link to="/dashboard" className="text-primary-600 hover:text-primary-700">
            Return to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const currentExercises = getCurrentPhaseExercises();
  const currentExercise = currentExercises[currentExerciseIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-secondary-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="flex items-center text-secondary-600 hover:text-secondary-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-secondary-900">
                  {workout.plan?.meta?.workout_name || `${workout.preWorkout?.workoutType || 'Custom'} Workout`}
                </h1>
                <p className="text-sm text-secondary-600">
                  {workout.plan?.estimatedDuration || workout.preWorkout?.duration || 'N/A'} min • {workout.preWorkout?.experience || 'N/A'}
                </p>
              </div>
            </div>
            
            {/* Timer */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-secondary-900">{formatTime(timer)}</div>
                <div className="text-xs text-secondary-600">Elapsed</div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={pauseResumeTimer}
                  disabled={!isWorkoutStarted}
                  className="p-2 text-secondary-600 hover:text-secondary-900 disabled:opacity-50"
                >
                  {isTimerRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </button>
                <button
                  onClick={resetTimer}
                  className="p-2 text-secondary-600 hover:text-secondary-900"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isWorkoutStarted ? (
          /* Pre-workout overview */
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">Ready to start?</h2>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {(workout.plan.warmup?.length || 0) + (workout.plan.exercises?.length || 0) + (workout.plan.cooldown?.length || 0)}
                  </div>
                  <div className="text-sm text-secondary-600">Total Exercises</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">{workout.plan?.estimatedDuration || workout.preWorkout?.duration || 'N/A'}</div>
                  <div className="text-sm text-secondary-600">Minutes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600 capitalize">{workout.preWorkout.experience}</div>
                  <div className="text-sm text-secondary-600">Level</div>
                </div>
              </div>
              <button
                onClick={startWorkout}
                className="btn btn-primary btn-lg"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Workout
              </button>
            </div>

            {/* Workout Instructions */}
            {workout.plan?.meta?.instructions && workout.plan.meta.instructions.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Workout Instructions</h3>
                <ul className="space-y-2">
                  {workout.plan.meta.instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-blue-800">{instruction}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Workout preview */}
            <div className="space-y-6">
              {workout.plan.warmup && workout.plan.warmup.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-3">Warm-up</h3>
                  <div className="space-y-2">
                    {workout.plan.warmup.map((exercise, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">{exercise.name}</span>
                        <span className="text-sm text-secondary-600">
                          {exercise.duration || `${exercise.sets} × ${exercise.reps}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {workout.plan.exercises && workout.plan.exercises.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-3">Main Exercises</h3>
                  <div className="space-y-2">
                    {workout.plan.exercises.map((exercise, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">{exercise.name}</span>
                        <span className="text-sm text-secondary-600">
                          {exercise.duration || `${exercise.sets} × ${exercise.reps}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {workout.plan.cooldown && workout.plan.cooldown.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-3">Cool-down</h3>
                  <div className="space-y-2">
                    {workout.plan.cooldown.map((exercise, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">{exercise.name}</span>
                        <span className="text-sm text-secondary-600">
                          {exercise.duration || `${exercise.sets} × ${exercise.reps}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Active workout */
          <div className="space-y-6">
            {/* Phase navigation */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div className="flex space-x-4">
                  {['warmup', 'exercises', 'cooldown'].map((phase) => (
                    <button
                      key={phase}
                      onClick={() => setCurrentPhase(phase as any)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPhase === phase
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-secondary-600 hover:bg-gray-200'
                      }`}
                    >
                      {phase === 'warmup' && 'Warm-up'}
                      {phase === 'exercises' && 'Exercises'}
                      {phase === 'cooldown' && 'Cool-down'}
                    </button>
                  ))}
                </div>
                <div className="text-sm text-secondary-600">
                  {currentExerciseIndex + 1} of {currentExercises.length}
                </div>
              </div>
            </div>

            {/* Current exercise */}
            {currentExercise && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-secondary-900 mb-2">
                    {currentExercise.name}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-4">
                    {currentExercise.sets && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-primary-600">{currentExercise.sets}</div>
                        <div className="text-sm text-secondary-600">Sets</div>
                      </div>
                    )}
                    {currentExercise.reps && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-primary-600">{currentExercise.reps}</div>
                        <div className="text-sm text-secondary-600">Reps</div>
                      </div>
                    )}
                    {currentExercise.duration && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-primary-600">{currentExercise.duration}</div>
                        <div className="text-sm text-secondary-600">Duration</div>
                      </div>
                    )}
                    {currentExercise.rest && (
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="text-2xl font-bold text-blue-600">{currentExercise.rest}</div>
                        <div className="text-sm text-blue-600">Rest Time</div>
                      </div>
                    )}
                  </div>

                  {/* Additional exercise details */}
                  <div className="space-y-2 text-sm">
                    {currentExercise.weight && (
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="font-medium">Weight:</span>
                        <span>{currentExercise.weight}</span>
                      </div>
                    )}
                    {currentExercise.tempo && (
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="font-medium">Tempo:</span>
                        <span>{currentExercise.tempo}</span>
                      </div>
                    )}
                    {currentExercise.intensity && (
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="font-medium">Intensity:</span>
                        <span>{currentExercise.intensity}</span>
                      </div>
                    )}
                    {currentExercise.rpe && (
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="font-medium">RPE:</span>
                        <span>{currentExercise.rpe}/10</span>
                      </div>
                    )}
                    {currentExercise.primaryMuscles && (
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="font-medium">Target Muscles:</span>
                        <span>{currentExercise.primaryMuscles}</span>
                      </div>
                    )}
                  </div>

                  {currentExercise.notes && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Notes:</strong> {currentExercise.notes}
                      </p>
                    </div>
                  )}

                  {/* Exercise Instructions */}
                  {currentExercise.instructions && currentExercise.instructions.length > 0 && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="text-sm font-semibold text-green-900 mb-3">Exercise Instructions</h4>
                      <ul className="space-y-2">
                        {currentExercise.instructions.map((instruction, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="flex-shrink-0 w-5 h-5 bg-green-600 text-white text-xs rounded-full flex items-center justify-center mt-0.5">
                              {index + 1}
                            </span>
                            <span className="text-sm text-green-800">{instruction}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Rest Timer */}
                {showRestTimer && currentExercise.rest && (
                  <div className="mt-6">
                    <RestTimer
                      key={restTimerKey}
                      restTimeSeconds={parseRestTime(currentExercise.rest)}
                      autoStart={true}
                      onComplete={() => {
                        setShowRestTimer(false);
                        // Show notification that rest is complete
                        console.log('Rest period complete! Ready for next exercise.');
                      }}
                    />
                    <div className="mt-4 text-center">
                      <p className="text-sm text-secondary-600 mb-3">
                        Recommended rest: {currentExercise.rest}
                      </p>
                      <button
                        onClick={moveToNextExercise}
                        className="btn btn-primary btn-md"
                      >
                        Skip Rest & Continue
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={() => setCurrentExerciseIndex(Math.max(0, currentExerciseIndex - 1))}
                    disabled={currentExerciseIndex === 0}
                    className="btn btn-outline btn-md disabled:opacity-50"
                  >
                    Previous
                  </button>
                  
                  <button
                    onClick={() => toggleExerciseComplete(currentExerciseIndex)}
                    className={`btn btn-md ${
                      completedExercises.has(`${currentPhase}-${currentExerciseIndex}`)
                        ? 'btn-secondary'
                        : 'btn-primary'
                    }`}
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    {completedExercises.has(`${currentPhase}-${currentExerciseIndex}`) ? 'Completed' : 'Mark Complete'}
                  </button>

                  <button
                    onClick={moveToNextExercise}
                    className="btn btn-outline btn-md"
                  >
                    {currentExerciseIndex < currentExercises.length - 1 ? 'Next' : 'Next Phase'}
                  </button>
                </div>
              </div>
            )}

            {/* Complete workout */}
            {currentPhase === 'cooldown' && currentExerciseIndex >= currentExercises.length - 1 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-bold text-secondary-900 mb-4">Workout Complete!</h3>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Rate this workout
                    </label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className={`p-1 ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          <Star className="h-6 w-6 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Feedback (optional)
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="input min-h-[100px]"
                      placeholder="How did the workout feel? Any suggestions for improvement?"
                    />
                  </div>
                </div>

                <button
                  onClick={completeWorkout}
                  disabled={isCompleting}
                  className="w-full btn btn-primary btn-lg"
                >
                  {isCompleting ? <LoadingSpinner size="sm" /> : 'Complete Workout'}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default WorkoutDetailPage;
