import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Zap, History, User, Dumbbell } from 'lucide-react';
import ModernLoadingSkeleton from '../components/ui/ModernLoadingSkeleton';
import Button from '../components/ui/Button';
import type { WorkoutPlanResponse } from '../types/api';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutPlanResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalMinutes: 0,
    streak: 0,
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id) return;

      try {
        // For now, use empty array until API is properly implemented
        const workouts: WorkoutPlanResponse[] = [];
        setRecentWorkouts(workouts.slice(0, 3));

        const calculatedStats = {
          totalWorkouts: workouts.length,
          totalMinutes: 0,
          streak: Math.min(workouts.length, 7),
        };

        setStats(calculatedStats);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-subtle px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          <ModernLoadingSkeleton variant="dashboard" shimmer animate />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-subtle relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <header className="mb-6 sm:mb-8 lg:mb-12 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold gradient-text-primary mb-3 sm:mb-4 animate-fade-in px-2">
            Welcome back, {user?.email?.split('@')[0] || 'User'}!
          </h1>
          <p className="text-neutral-600 text-base sm:text-lg md:text-xl font-medium animate-fade-in-up px-2">
            Ready for your next workout?
          </p>
        </header>

        {/* Hero Action Card - Mobile Optimized */}
        <div className="mb-6 sm:mb-8 lg:mb-12 animate-scale-in">
          <div className="gradient-aurora text-white p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl premium-shadow-xl gentle-glow">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6">
              <div className="text-center lg:text-left">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3">Generate New Workout</h2>
                <p className="text-white/90 text-sm sm:text-base lg:text-lg">Get a personalized AI workout plan tailored to your goals</p>
              </div>
              <Button
                onClick={() => navigate('/generate')}
                variant="secondary"
                size="lg"
                className="glass-premium border-0 text-primary-700 micro-bounce premium-shadow-lg transition-all duration-300 w-full sm:w-auto min-h-[48px] touch-target focus-premium"
              >
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Start Workout
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid - Mobile Optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 xl:gap-8 mb-6 sm:mb-8 lg:mb-12">
          <div className="glass-premium micro-bounce animate-fade-in touch-target premium-shadow-lg">
            <div className="p-4 sm:p-5 lg:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="gradient-aurora p-2 sm:p-3 rounded-xl sm:rounded-2xl premium-shadow-sm flex-shrink-0">
                  <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl sm:text-3xl font-bold gradient-text-primary">{stats.totalWorkouts}</div>
                  <div className="text-xs sm:text-sm text-success-600 font-medium">+12% this week</div>
                </div>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-neutral-700">Total Workouts</h3>
            </div>
          </div>

          <div className="card-glass hover-lift animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="gradient-purple p-3 rounded-2xl shadow-glow-sm">
                  <History className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold gradient-text-purple">{stats.totalMinutes}</div>
                  <div className="text-sm text-success-600 font-medium">+8% this week</div>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-neutral-700">Total Minutes</h3>
            </div>
          </div>

          <div className="card-glass hover-lift animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="gradient-blue p-3 rounded-2xl shadow-glow-sm">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold gradient-text-blue">{stats.streak}</div>
                  <div className="text-sm text-success-600 font-medium">+2 days</div>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-neutral-700">Current Streak</h3>
            </div>
          </div>
        </div>

        {/* Recent Workouts */}
        <div className="card-glass mb-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="p-8 border-b border-white/20">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold gradient-text-primary">Recent Workouts</h2>
              <Button
                variant="ghost"
                onClick={() => navigate('/history')}
                className="hover:bg-white/10"
              >
                View All
              </Button>
            </div>
          </div>
          <div className="p-8">
            {recentWorkouts.length > 0 ? (
              <div className="space-y-4">
                {recentWorkouts.map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-6 glass-light rounded-2xl hover-lift">
                    <div className="flex items-center gap-4">
                      <div className="gradient-primary p-3 rounded-xl shadow-glow-sm">
                        <Dumbbell className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900">
                          Workout {index + 1}
                        </h3>
                        <p className="text-sm text-neutral-600">
                          0 exercises
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-neutral-500 font-medium">
                      {new Date().toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="gradient-primary p-6 rounded-3xl w-24 h-24 mx-auto mb-6 shadow-glow-lg">
                  <Dumbbell className="w-12 h-12 text-white mx-auto" />
                </div>
                <h3 className="text-2xl font-bold gradient-text-primary mb-3">No workouts yet</h3>
                <p className="text-neutral-600 text-lg mb-6">Generate your first AI workout to get started</p>
                <Button
                  onClick={() => navigate('/generate')}
                  variant="primary"
                  size="lg"
                  className="hover-glow"
                >
                  Create Workout
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card-glass hover-lift animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="gradient-purple p-3 rounded-2xl shadow-glow-sm mr-4">
                  <History className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold gradient-text-purple">Workout History</h3>
              </div>
              <p className="text-neutral-600 mb-6 text-lg">
                View and track your workout progress over time
              </p>
              <Button
                variant="outline"
                onClick={() => navigate('/history')}
                className="hover-glow"
              >
                View History
              </Button>
            </div>
          </div>

          <div className="card-glass hover-lift animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="gradient-blue p-3 rounded-2xl shadow-glow-sm mr-4">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold gradient-text-blue">Profile Settings</h3>
              </div>
              <p className="text-neutral-600 mb-6 text-lg">
                Update your fitness goals and preferences
              </p>
              <Button
                variant="outline"
                onClick={() => navigate('/profile')}
                className="hover-glow"
              >
                Edit Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;