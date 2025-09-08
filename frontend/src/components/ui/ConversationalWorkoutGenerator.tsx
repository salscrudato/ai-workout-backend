import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Clock, Target, Dumbbell, Zap } from 'lucide-react';
import Button from './Button';
import { AnimatedContainer, MicroInteraction } from './animations';
import { LoadingAnimation } from './animations';
import { clsx } from 'clsx';

export interface ConversationMessage {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  workoutPreview?: any;
}

export interface ConversationalWorkoutGeneratorProps {
  onWorkoutGenerate: (params: any) => Promise<any>;
  onWorkoutPreview: (params: any) => void;
  className?: string;
  initialMessage?: string;
}

/**
 * Conversational Workout Generator Component
 * 
 * Features:
 * - Chat-like interface for workout generation
 * - AI-powered suggestions and responses
 * - Real-time workout preview
 * - Smart defaults based on conversation
 * - Contextual quick actions
 * - Smooth animations and transitions
 */
const ConversationalWorkoutGenerator: React.FC<ConversationalWorkoutGeneratorProps> = ({
  onWorkoutGenerate,
  onWorkoutPreview,
  className,
  initialMessage = "Hi! I'm your AI workout assistant. What kind of workout would you like today?",
}) => {
  const [messages, setMessages] = useState<ConversationMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: initialMessage,
      timestamp: new Date(),
      suggestions: [
        'I want to build muscle',
        'Quick 20-minute workout',
        'Upper body strength',
        'Cardio for weight loss',
      ],
    },
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [workoutParams, setWorkoutParams] = useState<any>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (message: Omit<ConversationMessage, 'id' | 'timestamp'>) => {
    const newMessage: ConversationMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isGenerating) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    // Add user message
    addMessage({
      type: 'user',
      content: userMessage,
    });

    // Process user input and generate AI response
    setIsGenerating(true);
    
    try {
      const aiResponse = await processUserInput(userMessage);
      addMessage(aiResponse);
    } catch (error) {
      addMessage({
        type: 'ai',
        content: "I'm sorry, I encountered an error. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const processUserInput = async (input: string): Promise<Omit<ConversationMessage, 'id' | 'timestamp'>> => {
    const lowerInput = input.toLowerCase();
    
    // Extract workout parameters from user input
    const extractedParams = extractWorkoutParams(input);
    setWorkoutParams(prev => ({ ...prev, ...extractedParams }));

    // Generate contextual response
    if (lowerInput.includes('muscle') || lowerInput.includes('strength')) {
      return {
        type: 'ai',
        content: "Great! I'll create a muscle-building workout for you. What muscle groups would you like to focus on?",
        suggestions: [
          'Upper body',
          'Lower body',
          'Full body',
          'Chest and arms',
        ],
      };
    }

    if (lowerInput.includes('cardio') || lowerInput.includes('weight loss')) {
      return {
        type: 'ai',
        content: "Perfect for weight loss! How much time do you have for your cardio workout?",
        suggestions: [
          '15 minutes',
          '30 minutes',
          '45 minutes',
          'High intensity',
        ],
      };
    }

    if (lowerInput.includes('quick') || lowerInput.includes('20') || lowerInput.includes('short')) {
      return {
        type: 'ai',
        content: "A quick 20-minute workout coming up! What's your main goal for today?",
        suggestions: [
          'Fat burning',
          'Muscle toning',
          'Energy boost',
          'Stress relief',
        ],
      };
    }

    // Check if we have enough parameters to generate a workout
    if (hasEnoughParams(workoutParams)) {
      const workoutPreview = generateWorkoutPreview(workoutParams);
      return {
        type: 'ai',
        content: "Based on our conversation, here's what I'm thinking for your workout:",
        workoutPreview,
        suggestions: [
          'Generate this workout',
          'Make it harder',
          'Make it easier',
          'Change focus',
        ],
      };
    }

    return {
      type: 'ai',
      content: "I understand! Let me ask a few more questions to create the perfect workout for you. What equipment do you have available?",
      suggestions: [
        'Just bodyweight',
        'Dumbbells',
        'Full gym',
        'Resistance bands',
      ],
    };
  };

  const extractWorkoutParams = (input: string) => {
    const params: any = {};
    const lowerInput = input.toLowerCase();

    // Extract duration
    const durationMatch = lowerInput.match(/(\d+)\s*(min|minute|hour)/);
    if (durationMatch) {
      const value = parseInt(durationMatch[1]);
      params.duration = durationMatch[2].startsWith('hour') ? value * 60 : value;
    }

    // Extract workout type
    if (lowerInput.includes('cardio')) params.workoutType = 'Cardio';
    if (lowerInput.includes('strength') || lowerInput.includes('muscle')) params.workoutType = 'Strength';
    if (lowerInput.includes('upper body')) params.workoutType = 'Upper Body';
    if (lowerInput.includes('lower body')) params.workoutType = 'Lower Body';
    if (lowerInput.includes('full body')) params.workoutType = 'Full Body';

    // Extract equipment
    if (lowerInput.includes('bodyweight') || lowerInput.includes('no equipment')) {
      params.equipmentAvailable = ['bodyweight'];
    }
    if (lowerInput.includes('dumbbell')) {
      params.equipmentAvailable = ['dumbbells'];
    }

    return params;
  };

  const hasEnoughParams = (params: any) => {
    return params.workoutType && (params.duration || params.equipmentAvailable);
  };

  const generateWorkoutPreview = (params: any) => {
    return {
      type: params.workoutType || 'Custom',
      duration: params.duration || 30,
      equipment: params.equipmentAvailable || ['bodyweight'],
      exercises: [
        'Push-ups',
        'Squats',
        'Plank',
        'Lunges',
      ],
    };
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={clsx('flex flex-col h-full max-w-4xl mx-auto', className)}>
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={clsx(
                'flex',
                message.type === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={clsx(
                  'max-w-xs lg:max-w-md px-4 py-3 rounded-2xl',
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-primary-500 to-blue-600 text-white'
                    : 'bg-white border border-secondary-200 text-secondary-900'
                )}
              >
                {message.type === 'ai' && (
                  <div className="flex items-center mb-2">
                    <Sparkles className="w-4 h-4 text-primary-500 mr-2" />
                    <span className="text-xs font-medium text-primary-600">AI Assistant</span>
                  </div>
                )}
                
                <p className="text-sm">{message.content}</p>

                {/* Workout Preview */}
                {message.workoutPreview && (
                  <div className="mt-3 p-3 bg-primary-50 rounded-lg border border-primary-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-primary-900">
                        {message.workoutPreview.type} Workout
                      </h4>
                      <span className="text-xs text-primary-600">
                        {message.workoutPreview.duration} min
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {message.workoutPreview.exercises.slice(0, 3).map((exercise: string) => (
                        <span
                          key={exercise}
                          className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                        >
                          {exercise}
                        </span>
                      ))}
                      {message.workoutPreview.exercises.length > 3 && (
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                          +{message.workoutPreview.exercises.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {message.suggestions && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.suggestions.map((suggestion) => (
                      <MicroInteraction key={suggestion} type="button">
                        <button
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-3 py-1 bg-secondary-100 hover:bg-secondary-200 text-secondary-700 text-xs rounded-full transition-colors"
                        >
                          {suggestion}
                        </button>
                      </MicroInteraction>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-white border border-secondary-200 px-4 py-3 rounded-2xl">
              <div className="flex items-center">
                <LoadingAnimation type="dots" size="sm" className="mr-2" />
                <span className="text-sm text-secondary-600">AI is thinking...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-secondary-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tell me about your ideal workout..."
              className="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              disabled={isGenerating}
            />
          </div>
          <Button
            variant="primary"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isGenerating}
            className="px-4 py-3"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConversationalWorkoutGenerator;
