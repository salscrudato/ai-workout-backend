import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, Heart, TrendingUp, Award, Flame } from 'lucide-react';
import { OnboardingStepProps } from '../OnboardingFlow';
import { MicroInteraction } from '../../animations';

/**
 * Goals Step Component
 * 
 * Allows users to select their fitness goals with:
 * - Visual goal selection cards
 * - Multiple selection support
 * - Animated interactions
 * - Goal descriptions and benefits
 */
const GoalsStep: React.FC<OnboardingStepProps> = ({
  data = [],
  onDataChange,
}) => {
  const [selectedGoals, setSelectedGoals] = useState<string[]>(data || []);

  const goals = [
    {
      id: 'weight_loss',
      title: 'Weight Loss',
      description: 'Burn calories and reduce body fat',
      icon: <Flame className="w-6 h-6" />,
      color: 'from-red-500 to-orange-500',
      benefits: ['Calorie burning', 'Fat reduction', 'Improved metabolism'],
    },
    {
      id: 'muscle_gain',
      title: 'Muscle Gain',
      description: 'Build lean muscle mass and strength',
      icon: <Zap className="w-6 h-6" />,
      color: 'from-blue-500 to-purple-500',
      benefits: ['Muscle growth', 'Increased strength', 'Better physique'],
    },
    {
      id: 'endurance',
      title: 'Endurance',
      description: 'Improve cardiovascular fitness',
      icon: <Heart className="w-6 h-6" />,
      color: 'from-green-500 to-teal-500',
      benefits: ['Better stamina', 'Heart health', 'Energy boost'],
    },
    {
      id: 'strength',
      title: 'Strength',
      description: 'Increase overall power and lifting capacity',
      icon: <Award className="w-6 h-6" />,
      color: 'from-yellow-500 to-orange-500',
      benefits: ['Raw power', 'Functional strength', 'Confidence'],
    },
    {
      id: 'flexibility',
      title: 'Flexibility',
      description: 'Enhance mobility and range of motion',
      icon: <Target className="w-6 h-6" />,
      color: 'from-pink-500 to-rose-500',
      benefits: ['Better mobility', 'Injury prevention', 'Relaxation'],
    },
    {
      id: 'general_fitness',
      title: 'General Fitness',
      description: 'Overall health and wellness improvement',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'from-indigo-500 to-blue-500',
      benefits: ['Overall health', 'Energy levels', 'Quality of life'],
    },
  ];

  const handleGoalToggle = (goalId: string) => {
    const newSelectedGoals = selectedGoals.includes(goalId)
      ? selectedGoals.filter(id => id !== goalId)
      : [...selectedGoals, goalId];
    
    setSelectedGoals(newSelectedGoals);
    onDataChange(newSelectedGoals);
  };

  return (
    <div>
      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h3 className="text-xl font-semibold text-secondary-900 mb-2">
          What are your fitness goals?
        </h3>
        <p className="text-secondary-600">
          Select all that apply. We'll customize your workouts to help you achieve them.
        </p>
      </motion.div>

      {/* Goals Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
      >
        {goals.map((goal, index) => {
          const isSelected = selectedGoals.includes(goal.id);
          
          return (
            <MicroInteraction
              key={goal.id}
              type="card"
              className="cursor-pointer"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                onClick={() => handleGoalToggle(goal.id)}
                className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${
                  isSelected
                    ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-blue-50 shadow-glow-blue'
                    : 'border-secondary-200 bg-white hover:border-secondary-300 hover:shadow-soft'
                }`}
              >
                {/* Selection Indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 right-4 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className="w-3 h-3 bg-white rounded-full"
                    />
                  </motion.div>
                )}

                {/* Goal Icon */}
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${goal.color} text-white mb-4`}>
                  {goal.icon}
                </div>

                {/* Goal Info */}
                <h4 className="text-lg font-semibold text-secondary-900 mb-2">
                  {goal.title}
                </h4>
                <p className="text-secondary-600 text-sm mb-4">
                  {goal.description}
                </p>

                {/* Benefits */}
                <div className="flex flex-wrap gap-2">
                  {goal.benefits.map((benefit) => (
                    <span
                      key={benefit}
                      className={`px-2 py-1 text-xs rounded-full ${
                        isSelected
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-secondary-100 text-secondary-600'
                      }`}
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
              </motion.div>
            </MicroInteraction>
          );
        })}
      </motion.div>

      {/* Selection Summary */}
      {selectedGoals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary-500 to-blue-600 rounded-xl p-4 text-white text-center"
        >
          <p className="text-sm text-primary-100 mb-1">
            Selected {selectedGoals.length} goal{selectedGoals.length !== 1 ? 's' : ''}
          </p>
          <p className="font-medium">
            Great choices! We'll create workouts focused on{' '}
            {selectedGoals.length === 1 
              ? goals.find(g => g.id === selectedGoals[0])?.title.toLowerCase()
              : selectedGoals.length === 2
              ? `${goals.find(g => g.id === selectedGoals[0])?.title.toLowerCase()} and ${goals.find(g => g.id === selectedGoals[1])?.title.toLowerCase()}`
              : `${selectedGoals.length} different areas`
            }.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default GoalsStep;
