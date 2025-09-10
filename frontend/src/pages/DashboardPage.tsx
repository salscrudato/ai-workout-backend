import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Zap, History, User, Dumbbell, Plus } from 'lucide-react';
import ModernLoadingSkeleton from '../components/ui/ModernLoadingSkeleton';
import type { WorkoutPlanResponse } from '../types/api';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutPlanResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
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
      <div className="min-h-screen bg-gray-50 px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <ModernLoadingSkeleton variant="dashboard" shimmer animate />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header - with left margin to avoid burger menu overlap */}
        <div className="mb-8 ml-14 sm:ml-16">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.email?.split('@')[0] || 'User'}!
          </h1>
          <p className="text-gray-600">
            Ready for your next workout?
          </p>
        </div>

        {/* Quick Action */}
        <div className="bg-blue-600 rounded-2xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Generate New Workout</h2>
              <p className="text-blue-100">Get a personalized AI workout plan</p>
            </div>
            <button
              onClick={() => navigate('/generate')}
              className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors flex items-center space-x-2"
            >
              <Zap className="w-5 h-5" />
              <span>Start Workout</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{stats.totalWorkouts}</div>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Total Workouts</h3>
            <p className="text-sm text-gray-600">Keep up the momentum!</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Workouts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Recent Workouts</h2>
                <button
                  onClick={() => navigate('/history')}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  View All
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {recentWorkouts.length > 0 ? (
                <div className="space-y-4">
                  {recentWorkouts.map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => navigate(`/workout/${index + 1}`)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Dumbbell className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Full Body Workout</div>
                          <div className="text-sm text-gray-600">45 minutes • Upper Body</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">2 days ago</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Dumbbell className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Ready to start your fitness journey?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Generate your first AI-powered workout
                  </p>
                  <button
                    onClick={() => navigate('/generate')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create Your First Workout</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            {/* Workout History */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <History className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Workout History</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    View and track your workout progress over time
                  </p>
                  <div className="flex items-center space-x-4 mb-4 text-sm">
                    <div>
                      <span className="font-semibold text-purple-600">0</span>
                      <span className="text-gray-600 ml-1">Completed</span>
                    </div>
                    <div>
                      <span className="font-semibold text-purple-600">0</span>
                      <span className="text-gray-600 ml-1">This Week</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/history')}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    View Full History
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Settings */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Profile Settings</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Update your fitness goals and preferences
                  </p>
                  <button
                    onClick={() => navigate('/profile')}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
