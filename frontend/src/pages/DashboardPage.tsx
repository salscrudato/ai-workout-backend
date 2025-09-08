import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';
import {
  Zap,
  History,
  User,
  Dumbbell,
} from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import DataVisualization from '../components/ui/DataVisualization';
import AnimatedContainer from '../components/ui/animations/AnimatedContainer';
import { Display, Heading, Body } from '../components/ui/Typography';
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
  const [workoutData, setWorkoutData] = useState<Array<{label: string, value: number, color: string}>>([]);
  const [progressData, setProgressData] = useState<Array<{label: string, value: number}>>([]);
  const [goalData, setGoalData] = useState<Array<{label: string, value: number}>>([]);

  // Generate real workout data from user's workouts
  const generateWorkoutData = (workouts: any[]) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const colors = [
      'gradient-blue', 'gradient-blue-electric', 'gradient-blue-premium',
      'gradient-blue-ocean', 'gradient-blue-cyan', 'gradient-premium', 'gradient-blue'
    ];

    // Initialize with zeros for each day
    const weeklyData = days.map((day, index) => ({
      label: day,
      value: 0,
      color: colors[index]
    }));

    // Aggregate workout minutes by day of week from recent workouts
    workouts.slice(0, 20).forEach(workout => {
      const workoutDate = new Date(workout.createdAt);
      const dayIndex = workoutDate.getDay();
      const duration = workout.plan?.estimatedDuration || workout.preWorkout?.duration || 30;
      weeklyData[dayIndex].value += duration;
    });

    return weeklyData;
  };

  // Generate progress data based on workout types
  const generateProgressData = (workouts: any[]) => {
    if (workouts.length === 0) return [];

    const categories = {
      'Strength Training': 0,
      'Cardio Fitness': 0,
      'Flexibility': 0,
      'Endurance': 0
    };

    // Analyze workout types and calculate progress
    workouts.forEach(workout => {
      const exercises = workout.plan?.exercises || [];
      exercises.forEach((exercise: any) => {
        const type = exercise.type?.toLowerCase() || '';
        if (type.includes('strength') || type.includes('weight')) {
          categories['Strength Training']++;
        } else if (type.includes('cardio') || type.includes('running')) {
          categories['Cardio Fitness']++;
        } else if (type.includes('stretch') || type.includes('flexibility')) {
          categories['Flexibility']++;
        } else if (type.includes('endurance') || type.includes('hiit')) {
          categories['Endurance']++;
        }
      });
    });

    // Convert to percentage based on total exercises
    const total = Object.values(categories).reduce((sum, count) => sum + count, 0);
    if (total === 0) return [];

    return Object.entries(categories).map(([label, count]) => ({
      label,
      value: Math.round((count / total) * 100)
    }));
  };

  // Generate goal data based on user's activity
  const generateGoalData = (workouts: any[], stats: any) => {
    const weeklyGoal = 4; // Target 4 workouts per week
    const monthlyGoal = 16; // Target 16 workouts per month
    const streakGoal = 7; // Target 7-day streak

    const currentWeekWorkouts = workouts.filter(w => {
      const workoutDate = new Date(w.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return workoutDate >= weekAgo;
    }).length;

    const currentMonthWorkouts = workouts.filter(w => {
      const workoutDate = new Date(w.createdAt);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return workoutDate >= monthAgo;
    }).length;

    return [
      { label: 'Weekly Goal', value: Math.min(Math.round((currentWeekWorkouts / weeklyGoal) * 100), 100) },
      { label: 'Monthly Goal', value: Math.min(Math.round((currentMonthWorkouts / monthlyGoal) * 100), 100) },
      { label: 'Streak Goal', value: Math.min(Math.round((stats.streak / streakGoal) * 100), 100) },
    ];
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        const workoutsResponse = await apiClient.listWorkouts(user.id);
        const workouts = workoutsResponse.workouts || [];

        setRecentWorkouts(workouts.slice(0, 3));

        // Calculate simple stats
        const totalMinutes = workouts.reduce((sum, w) => {
          return sum + (w.plan.estimatedDuration || w.preWorkout.duration || 30);
        }, 0);

        const calculatedStats = {
          totalWorkouts: workouts.length,
          totalMinutes,
          streak: Math.min(workouts.length, 7), // Simple streak calculation
        };

        setStats(calculatedStats);

        // Generate real data from workouts
        setWorkoutData(generateWorkoutData(workouts));
        setProgressData(generateProgressData(workouts));
        setGoalData(generateGoalData(workouts, calculatedStats));
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        // Set empty states on error
        setWorkoutData([]);
        setProgressData([]);
        setGoalData([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Clean Header */}
        <header className="mb-12">
          <Display
            level={1}
            gradient="fresh"
            className="mb-3"
          >
            AI That Adapts to You
          </Display>
          <Body size={1} color="secondary" className="text-lg">
            Intelligent workouts that evolve with your progress
          </Body>
        </header>

        {/* Primary Action with Enhanced Design - Moved to Top */}
        <AnimatedContainer variant="premium-card" className="mb-12">
          <Card variant="glass-blue-premium" className="p-8 text-center">
            <div className="gradient-blue-premium p-4 rounded-2xl inline-flex items-center justify-center mb-6 shadow-glow-blue-premium">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <Heading level={2} gradient="luxury" className="mb-3">
              Generate New Workout
            </Heading>
            <Body size={1} color="secondary" className="mb-8 max-w-md mx-auto">
              Create a personalized AI-powered workout tailored to your goals
            </Body>
            <Button
              variant="premium"
              size="lg"
              onClick={() => navigate('/generate')}
              className="px-12"
            >
              Get Started
            </Button>
          </Card>
        </AnimatedContainer>

        {/* Enhanced Stats Section */}
        <AnimatedContainer variant="enhanced-stagger" className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Workouts"
              value={stats.totalWorkouts}
              icon={<Dumbbell className="w-5 h-5" />}
              variant="premium"
              countUp={true}
              delay={0.1}
              trend={{
                value: 12,
                direction: 'up',
                label: 'this month'
              }}
            />
            <StatCard
              title="Minutes Trained"
              value={stats.totalMinutes}
              icon={<Zap className="w-5 h-5" />}
              variant="glass"
              countUp={true}
              delay={0.2}
              trend={{
                value: 8,
                direction: 'up',
                label: 'vs last week'
              }}
            />
            <StatCard
              title="Current Streak"
              value={`${stats.streak} days`}
              icon={<History className="w-5 h-5" />}
              variant="premium"
              countUp={false}
              delay={0.3}
              trend={{
                value: 3,
                direction: 'up',
                label: 'personal best'
              }}
            />
          </div>
        </AnimatedContainer>
        {/* Enhanced Data Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <AnimatedContainer variant="page-fade-scale" delay={0.2}>
            <DataVisualization
              type="bar"
              title="Weekly Activity"
              subtitle="Minutes trained per day"
              data={workoutData}
              variant="premium"
              height={200}
            />
          </AnimatedContainer>

          <AnimatedContainer variant="page-fade-scale" delay={0.3}>
            <DataVisualization
              type="progress"
              title="Fitness Progress"
              subtitle="Your improvement across different areas"
              data={progressData}
              variant="glass"
            />
          </AnimatedContainer>
        </div>

        <AnimatedContainer variant="page-fade-scale" delay={0.4} className="mb-12">
          <DataVisualization
            type="radial"
            title="Goals Achievement"
            subtitle="Track your progress towards fitness goals"
            data={goalData}
            variant="premium"
            height={300}
          />
        </AnimatedContainer>

        {/* Recent Activity */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <Heading level={2} gradient="blue" className="text-gray-900">
              Recent Activity
            </Heading>
            {recentWorkouts.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/history')}
              >
                View all
              </Button>
            )}
          </div>

          {recentWorkouts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Dumbbell className="w-8 h-8 text-gray-400" />
              </div>
              <Heading level={3} className="mb-3 text-gray-900">
                No workouts yet
              </Heading>
              <Body size={1} color="secondary" className="mb-8 max-w-sm mx-auto">
                Start your fitness journey with your first AI-generated workout
              </Body>
              <Button
                variant="outline"
                onClick={() => navigate('/generate')}
              >
                Create Workout
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentWorkouts.slice(0, 3).map((workout, index) => (
                <div
                  key={workout.id || index}
                  className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 transition-all duration-200 cursor-pointer"
                  onClick={() => navigate(`/workout/${workout.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {workout.preWorkout.workoutType?.replace('_', ' ') || 'Workout'}
                        </h3>
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                          {workout.preWorkout.duration}min
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(workout.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>


        {/* Quick Stats */}
        {stats.totalWorkouts > 0 && (
          <div className="grid grid-cols-3 gap-6 mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.totalWorkouts}
              </div>
              <div className="text-sm text-gray-500">Workouts</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {Math.floor(stats.totalMinutes / 60)}h
              </div>
              <div className="text-sm text-gray-500">Total Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.streak}
              </div>
              <div className="text-sm text-gray-500">Day Streak</div>
            </div>
          </div>
        )}

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/history')}
            className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 transition-all duration-200 text-left"
          >
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
              <History className="w-5 h-5 text-gray-600" />
            </div>
            <div className="font-semibold text-gray-900 mb-1">History</div>
            <div className="text-sm text-gray-500">View past workouts</div>
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 transition-all duration-200 text-left"
          >
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <div className="font-semibold text-gray-900 mb-1">Profile</div>
            <div className="text-sm text-gray-500">Update preferences</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
