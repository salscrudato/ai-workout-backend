import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';
import { 
  Plus, 
  History, 
  User, 
  LogOut, 
  Zap, 
  Target, 
  Calendar,
  TrendingUp,
  Dumbbell
} from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import type { WorkoutPlanResponse } from '../types/api';

const DashboardPage: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutPlanResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    thisWeek: 0,
    streak: 0,
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        const workoutsResponse = await apiClient.listWorkouts(user.id);
        const workouts = workoutsResponse.workouts || [];
        
        setRecentWorkouts(workouts.slice(0, 3)); // Show last 3 workouts
        
        // Calculate basic stats
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thisWeekWorkouts = workouts.filter(w => 
          new Date(w.createdAt) >= weekAgo
        );
        
        setStats({
          totalWorkouts: workouts.length,
          thisWeek: thisWeekWorkouts.length,
          streak: Math.min(workouts.length, 7), // Simple streak calculation
        });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.id]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-600 p-2 rounded-lg">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-secondary-900">AI Workout</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/profile"
                className="flex items-center space-x-2 text-secondary-600 hover:text-secondary-900 transition-colors"
              >
                <User className="h-5 w-5" />
                <span className="hidden sm:block">Profile</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-secondary-600 hover:text-secondary-900 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="hidden sm:block">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">
            Welcome back, {user?.email?.split('@')[0]}!
          </h2>
          <p className="text-secondary-600">
            Ready for your next workout? Let's keep that momentum going.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Total Workouts</p>
                <p className="text-3xl font-bold text-secondary-900">{stats.totalWorkouts}</p>
              </div>
              <div className="bg-primary-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">This Week</p>
                <p className="text-3xl font-bold text-secondary-900">{stats.thisWeek}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Current Streak</p>
                <p className="text-3xl font-bold text-secondary-900">{stats.streak}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Zap className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            to="/generate"
            className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white hover:from-primary-700 hover:to-primary-800 transition-all transform hover:scale-105"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-full">
                <Plus className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-1">Generate New Workout</h3>
                <p className="text-primary-100">
                  Create a personalized workout with AI
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/history"
            className="bg-white rounded-lg p-6 border border-secondary-200 hover:border-secondary-300 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-secondary-100 p-3 rounded-full">
                <History className="h-8 w-8 text-secondary-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-1">Workout History</h3>
                <p className="text-secondary-600">
                  View and track your progress
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Workouts */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-secondary-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-secondary-900">Recent Workouts</h3>
              <Link
                to="/history"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View all
              </Link>
            </div>
          </div>

          <div className="p-6">
            {recentWorkouts.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-secondary-900 mb-2">No workouts yet</h4>
                <p className="text-secondary-600 mb-4">
                  Generate your first AI-powered workout to get started!
                </p>
                <Link
                  to="/generate"
                  className="btn btn-primary btn-md"
                >
                  Generate Workout
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentWorkouts.map((workout) => (
                  <Link
                    key={workout.id}
                    to={`/workout/${workout.id}`}
                    className="block p-4 border border-secondary-200 rounded-lg hover:border-secondary-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-secondary-900">
                          {workout.preWorkout.workoutType || workout.preWorkout.goals?.join(', ') || 'Custom'} Workout
                        </h4>
                        <p className="text-sm text-secondary-600">
                          {workout.preWorkout.duration} minutes • {workout.preWorkout.experience}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-secondary-500">
                          {new Date(workout.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-secondary-400">
                          {workout.plan.exercises?.length || 0} exercises
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Profile Summary */}
        {profile && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Your Profile</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-secondary-600">Experience:</span>
                <p className="font-medium capitalize">{profile.experience}</p>
              </div>
              <div>
                <span className="text-secondary-600">Goals:</span>
                <p className="font-medium">{profile.goals.length} selected</p>
              </div>
              <div>
                <span className="text-secondary-600">Equipment:</span>
                <p className="font-medium">{profile.equipmentAvailable.length} items</p>
              </div>
              <div>
                <span className="text-secondary-600">Constraints:</span>
                <p className="font-medium">{profile.constraints.length} noted</p>
              </div>
            </div>
            <Link
              to="/profile"
              className="inline-flex items-center mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Update profile →
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
