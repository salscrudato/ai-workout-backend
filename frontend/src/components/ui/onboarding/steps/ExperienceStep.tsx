import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Zap, Award, Crown } from 'lucide-react';
import { OnboardingStepProps } from '../OnboardingFlow';
import { MicroInteraction } from '../../animations';

/**
 * Experience Step Component
 * 
 * Allows users to select their fitness experience level with:
 * - Visual experience level cards
 * - Detailed descriptions for each level
 * - Animated selection feedback
 * - Helpful guidance text
 */
const ExperienceStep: React.FC<OnboardingStepProps> = ({
  data,
  onDataChange,
}) => {
  const [selectedExperience, setSelectedExperience] = useState<string>(data || '');

  const experienceLevels = [
    {
      id: 'beginner',
      title: 'Beginner',
      subtitle: 'New to fitness',
      description: 'Just starting your fitness journey or returning after a long break',
      icon: <User className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500',
      characteristics: [
        'New to regular exercise',
        'Learning proper form',
        'Building basic habits',
        'Starting slowly and safely'
      ],
      workoutFocus: 'Foundation building, form learning, habit formation',
    },
    {
      id: 'intermediate',
      title: 'Intermediate',
      subtitle: 'Some experience',
      description: 'You exercise regularly and know basic movements and techniques',
      icon: <Zap className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
      characteristics: [
        '3-6 months of consistent training',
        'Comfortable with basic exercises',
        'Ready for moderate challenges',
        'Understanding of workout structure'
      ],
      workoutFocus: 'Progressive overload, technique refinement, variety',
    },
    {
      id: 'advanced',
      title: 'Advanced',
      subtitle: 'Experienced athlete',
      description: 'You have extensive training experience and advanced knowledge',
      icon: <Award className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
      characteristics: [
        '1+ years of consistent training',
        'Advanced exercise knowledge',
        'Comfortable with complex movements',
        'Understanding of periodization'
      ],
      workoutFocus: 'Advanced techniques, periodization, specialization',
    },
    {
      id: 'expert',
      title: 'Expert',
      subtitle: 'Elite level',
      description: 'Professional or competitive athlete with expert-level knowledge',
      icon: <Crown className="w-6 h-6" />,
      color: 'from-yellow-500 to-orange-500',
      characteristics: [
        'Multiple years of training',
        'Competition or coaching experience',
        'Advanced programming knowledge',
        'Peak performance focus'
      ],
      workoutFocus: 'Elite programming, competition prep, optimization',
    },
  ];

  const handleExperienceSelect = (experienceId: string) => {
    setSelectedExperience(experienceId);
    onDataChange(experienceId);
  };

  const selectedLevel = experienceLevels.find(level => level.id === selectedExperience);

  return (
    <div>
      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h3 className="text-xl font-semibold text-secondary-900 mb-2">
          What's your fitness experience level?
        </h3>
        <p className="text-secondary-600">
          This helps us create workouts that match your current abilities and goals.
        </p>
      </motion.div>

      {/* Experience Levels */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
      >
        {experienceLevels.map((level, index) => {
          const isSelected = selectedExperience === level.id;
          
          return (
            <MicroInteraction
              key={level.id}
              type="card"
              className="cursor-pointer"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                onClick={() => handleExperienceSelect(level.id)}
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

                {/* Level Icon */}
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${level.color} text-white mb-4`}>
                  {level.icon}
                </div>

                {/* Level Info */}
                <h4 className="text-lg font-semibold text-secondary-900 mb-1">
                  {level.title}
                </h4>
                <p className="text-sm text-primary-600 font-medium mb-2">
                  {level.subtitle}
                </p>
                <p className="text-secondary-600 text-sm mb-4">
                  {level.description}
                </p>

                {/* Characteristics */}
                <div className="space-y-1">
                  {level.characteristics.slice(0, 2).map((characteristic) => (
                    <div key={characteristic} className="flex items-center text-xs text-secondary-500">
                      <div className="w-1 h-1 bg-secondary-400 rounded-full mr-2" />
                      {characteristic}
                    </div>
                  ))}
                </div>
              </motion.div>
            </MicroInteraction>
          );
        })}
      </motion.div>

      {/* Selected Level Details */}
      {selectedLevel && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary-500 to-blue-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center mb-4">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${selectedLevel.color} flex items-center justify-center mr-4`}>
              {selectedLevel.icon}
            </div>
            <div>
              <h4 className="font-semibold text-lg">{selectedLevel.title} Level</h4>
              <p className="text-primary-100 text-sm">{selectedLevel.subtitle}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium text-primary-100 mb-2">Your characteristics:</h5>
              <ul className="space-y-1">
                {selectedLevel.characteristics.map((characteristic) => (
                  <li key={characteristic} className="flex items-center text-sm">
                    <div className="w-1.5 h-1.5 bg-primary-200 rounded-full mr-2" />
                    {characteristic}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h5 className="font-medium text-primary-100 mb-2">Workout focus:</h5>
              <p className="text-sm text-primary-100">
                {selectedLevel.workoutFocus}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ExperienceStep;
