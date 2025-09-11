import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Target,
  TrendingUp,
  Search,
  Eye
} from 'lucide-react';
import { Loading } from '../components/ui';
import Button from '../components/ui/Button';
import type { WorkoutPlanResponse } from '../types/api';

const WorkoutHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<WorkoutPlanResponse[]>([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState<WorkoutPlanResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    'matchMedia' in window &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const loadWorkouts = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        const response = await apiClient.listWorkouts(user.id);
        const workoutList = response.workouts || [];
        setWorkouts(workoutList);
        setFilteredWorkouts(workoutList);
      } catch (error) {
        console.error('Failed to load workouts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkouts();
  }, [user?.id]);

  // Filter and search workouts
  useEffect(() => {
    let filtered = [...workouts];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(workout =>
        (workout.preWorkout.workoutType?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (workout.preWorkout.goals?.some(goal =>
          goal.toLowerCase().includes(searchTerm.toLowerCase())
        )) ||
        (workout.plan?.meta?.session_type?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (workout.plan?.meta?.workout_name?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Always sort by completion date (most recent first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.completedAt || a.createdAt);
      const dateB = new Date(b.completedAt || b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });

    setFilteredWorkouts(filtered);
  }, [workouts, searchTerm]);

  // Calculate stats (all workouts in history are completed)
  const totalWorkouts = workouts.length;
  const totalMinutes = workouts.reduce((sum, workout) => {
    const duration = workout.preWorkout?.time_available_min || workout.plan?.meta?.est_duration_min || 0;
    return sum + (typeof duration === 'number' ? duration : 0);
  }, 0);
  const averageDuration = totalWorkouts > 0 ? Math.round(totalMinutes / totalWorkouts) : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-950 transition-colors duration-300">
        <Loading size="lg" text="Loading workout history..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-secondary-900 shadow-sm border-b border-secondary-200 dark:border-secondary-800 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="flex items-center text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-200 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="bg-primary-600 p-2 rounded-lg">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-secondary-900 dark:text-secondary-100">Workout History</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-secondary-800 p-6 transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Total Workouts</p>
                <p className="text-3xl font-bold text-secondary-900">{totalWorkouts}</p>
              </div>
              <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-secondary-800 p-6 transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Total Minutes</p>
                <p className="text-3xl font-bold text-secondary-900">{totalMinutes}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-secondary-800 p-6 transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Avg Duration</p>
                <p className="text-3xl font-bold text-secondary-900">{averageDuration}m</p>
              </div>
              <div className="bg-accent-100 dark:bg-accent-900/30 p-3 rounded-full">
                <Target className="h-6 w-6 text-accent-600 dark:text-accent-300" />
              </div>
            </div>
          </div>


        </div>

        {/* Search */}
        <div className="bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-secondary-800 p-6 mb-6 transition-colors duration-300">
          <div className="max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400 dark:text-secondary-500" />
              <input
                type="text"
                placeholder="Search workouts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
        </div>

        {/* Workout List */}
        <div className="bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-secondary-800 transition-colors duration-300">
          <div className="p-6 border-b border-secondary-200 dark:border-secondary-800">
            <h3 className="text-lg font-semibold text-secondary-900">
              {filteredWorkouts.length} Workout{filteredWorkouts.length !== 1 ? 's' : ''}
            </h3>
          </div>

          <div className="divide-y divide-secondary-200 dark:divide-secondary-800" role="list" aria-label="Workout history">
            {filteredWorkouts.length === 0 ? (
              <div className="p-8 text-center">
                <Calendar className="h-12 w-12 text-secondary-400 dark:text-secondary-500 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">No workouts found</h4>
                <p className="text-secondary-600 dark:text-secondary-400 mb-4">
                  {workouts.length === 0 
                    ? "You haven't completed any workouts yet."
                    : "Try adjusting your search or filters."
                  }
                </p>
                {workouts.length === 0 && (
                  <Link to="/generate">
                    <Button variant="primary" size="md">
                      Generate Your First Workout
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              filteredWorkouts.map((workout) => (
                <div key={workout.id} className="p-6 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors motion-reduce:transition-none" role="listitem">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="mb-2">
                        <h4 className="text-lg font-medium text-secondary-900 dark:text-secondary-100">
                          {workout.plan?.meta?.workout_name || workout.plan?.meta?.session_type || workout.preWorkout.workoutType || workout.preWorkout.goals?.join(', ') || 'Custom Workout'}
                        </h4>
                        {workout.plan?.meta?.workout_name && (
                          <p className="text-sm text-secondary-600 dark:text-secondary-400">
                            {workout.plan?.meta?.session_type || workout.preWorkout.workoutType}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-secondary-600 dark:text-secondary-400">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{workout.preWorkout?.time_available_min || workout.plan?.meta?.est_duration_min || 'N/A'} minutes</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Target className="h-4 w-4" />
                          <span>{workout.plan.exercises?.length || 0} exercises</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {workout.isCompleted && workout.completedAt
                              ? `Completed ${new Date(workout.completedAt).toLocaleDateString()}`
                              : `Created ${new Date(workout.createdAt).toLocaleDateString()}`
                            }
                          </span>
                        </div>
                        {workout.isCompleted && workout.feedback?.rating && (
                          <div className="flex items-center space-x-1">
                            <span>⭐</span>
                            <span>{workout.feedback.rating}/5</span>
                          </div>
                        )}
                      </div>

                      {workout.preWorkout.equipmentAvailable && workout.preWorkout.equipmentAvailable.length > 0 && (
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1">
                            {workout.preWorkout.equipmentAvailable.slice(0, 3).map((equipment) => (
                              <span
                                key={equipment}
                                className="px-2 py-1 text-xs bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-200 rounded transition-colors"
                              >
                                {equipment}
                              </span>
                            ))}
                            {workout.preWorkout.equipmentAvailable.length > 3 && (
                              <span className="px-2 py-1 text-xs bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-200 rounded transition-colors">
                                +{workout.preWorkout.equipmentAvailable.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/workout/${workout.id}`}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-sm border border-secondary-300 dark:border-secondary-700 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default WorkoutHistoryPage;
