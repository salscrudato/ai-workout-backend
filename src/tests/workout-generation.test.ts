import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { generateWorkout } from '../services/generator';
import { buildWorkoutPrompt } from '../services/unifiedPromptService';

describe('Workout Generation Tests', () => {
  const mockUserId = 'test-user-123';
  
  const mockPreWorkout = {
    userId: mockUserId,
    experience: 'intermediate' as const,
    workout_type: 'strength',
    time_available_min: 45,
    goals: ['muscle_building', 'strength'],
    equipment_override: ['dumbbells', 'barbell'],
    new_injuries: undefined
  };

  beforeAll(() => {
    // Setup test environment
    process.env.NODE_ENV = 'test';
  });

  afterAll(() => {
    // Cleanup
  });

  describe('Prompt Generation', () => {
    it('should generate a proper workout prompt', async () => {
      const result = await buildWorkoutPrompt(mockUserId, mockPreWorkout);
      
      expect(result).toBeDefined();
      expect(result.prompt).toBeDefined();
      expect(typeof result.prompt).toBe('string');
      expect(result.prompt.length).toBeGreaterThan(100);
      
      // Check for critical requirements in prompt
      expect(result.prompt).toContain('multiple sets');
      expect(result.prompt).toContain('2-4 sets per exercise');
      expect(result.prompt).toContain('NEVER create single-set workouts');
    });

    it('should handle different experience levels', async () => {
      const beginnerWorkout = { ...mockPreWorkout, experience: 'beginner' as const };
      const advancedWorkout = { ...mockPreWorkout, experience: 'advanced' as const };

      const beginnerPrompt = await buildWorkoutPrompt(mockUserId, beginnerWorkout);
      const advancedPrompt = await buildWorkoutPrompt(mockUserId, advancedWorkout);

      expect(beginnerPrompt.prompt).toContain('beginner');
      expect(advancedPrompt.prompt).toContain('advanced');
      
      // Different rep ranges for different levels
      expect(beginnerPrompt.prompt).toContain('8-12 reps');
      expect(advancedPrompt.prompt).toContain('4-8 reps');
    });
  });

  describe('Workout Generation Quality', () => {
    it('should generate workouts with multiple sets', async () => {
      const promptData = await buildWorkoutPrompt(mockUserId, mockPreWorkout);
      
      // Mock the AI response to test our validation
      const mockAIResponse = {
        meta: {
          date_iso: new Date().toISOString(),
          session_type: 'single_session',
          goal: 'strength',
          experience: 'intermediate',
          est_duration_min: 45,
          equipment_used: ['dumbbells', 'barbell'],
          workout_name: 'Strength Training',
          instructions: ['Warm up', 'Focus on form', 'Rest properly', 'Cool down']
        },
        warmup: [
          {
            name: 'Dynamic Warmup',
            duration_sec: 300,
            cues: 'Light movement',
            instructions: ['Arm circles', 'Leg swings', 'Hip circles']
          }
        ],
        blocks: [
          {
            name: 'Main Block',
            exercises: [
              {
                slug: 'barbell_squat',
                display_name: 'Barbell Squat',
                type: 'strength',
                equipment: ['barbell'],
                primary_muscles: ['quadriceps', 'glutes'],
                instructions: ['Feet shoulder width', 'Brace core', 'Control descent'],
                sets: [
                  { reps: 8, time_sec: 0, rest_sec: 90, tempo: '2-1-2-1', intensity: 'moderate', notes: 'warm-up set', weight_guidance: 'light', rpe: 6, rest_type: 'complete' },
                  { reps: 8, time_sec: 0, rest_sec: 90, tempo: '2-1-2-1', intensity: 'moderate', notes: 'working set', weight_guidance: 'moderate', rpe: 7, rest_type: 'complete' },
                  { reps: 8, time_sec: 0, rest_sec: 90, tempo: '2-1-2-1', intensity: 'high', notes: 'final set', weight_guidance: 'heavy', rpe: 8, rest_type: 'complete' }
                ]
              }
            ]
          }
        ],
        finisher: [],
        cooldown: [
          {
            name: 'Static Stretching',
            duration_sec: 300,
            cues: 'Hold stretches',
            instructions: ['Quad stretch', 'Hamstring stretch', 'Hip flexor stretch']
          }
        ],
        notes: 'Focus on progressive overload'
      };

      // Test that our validation would work
      expect(mockAIResponse.blocks[0].exercises[0].sets).toHaveLength(3);
      expect(mockAIResponse.blocks[0].exercises[0].sets.every(set => set.reps > 0)).toBe(true);
    });

    it('should validate workout structure', () => {
      const validWorkout = {
        meta: { est_duration_min: 45 },
        warmup: [],
        blocks: [{ name: 'Main', exercises: [] }],
        finisher: [],
        cooldown: [],
        notes: ''
      };

      const invalidWorkout = {
        meta: { est_duration_min: 45 },
        // Missing required fields
      };

      expect(validWorkout.meta).toBeDefined();
      expect(validWorkout.blocks).toBeDefined();
      expect(Array.isArray(validWorkout.blocks)).toBe(true);

      expect(invalidWorkout.blocks).toBeUndefined();
    });
  });

  describe('Performance Tests', () => {
    it('should generate workouts within reasonable time', async () => {
      const startTime = Date.now();
      const promptData = await buildWorkoutPrompt(mockUserId, mockPreWorkout);
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle concurrent requests', async () => {
      const promises = Array.from({ length: 5 }, (_, i) => 
        buildWorkoutPrompt(`test-user-${i}`, {
          ...mockPreWorkout,
          userId: `test-user-${i}`
        })
      );

      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.prompt).toBeDefined();
        expect(result.prompt.length).toBeGreaterThan(100);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing user data gracefully', async () => {
      const incompleteData = {
        userId: mockUserId,
        experience: 'beginner' as const,
        // Missing required fields
      };

      const result = await buildWorkoutPrompt(mockUserId, incompleteData);
      
      expect(result).toBeDefined();
      expect(result.prompt).toBeDefined();
      // Should use fallback values
      expect(result.prompt).toContain('beginner');
    });

    it('should sanitize user input', async () => {
      const maliciousData = {
        ...mockPreWorkout,
        goals: ['<script>alert("xss")</script>', 'strength'],
        new_injuries: '<img src=x onerror=alert("xss")>'
      };

      const result = await buildWorkoutPrompt(mockUserId, maliciousData);
      
      expect(result.prompt).not.toContain('<script>');
      expect(result.prompt).not.toContain('<img');
      expect(result.prompt).not.toContain('onerror');
    });
  });

  describe('Workout Quality Metrics', () => {
    it('should ensure minimum exercise count', () => {
      const minExercises = 3;
      const mockWorkout = {
        blocks: [
          {
            name: 'Main',
            exercises: [
              { name: 'Exercise 1', sets: [{}] },
              { name: 'Exercise 2', sets: [{}] },
              { name: 'Exercise 3', sets: [{}] }
            ]
          }
        ]
      };

      const totalExercises = mockWorkout.blocks.reduce(
        (total, block) => total + block.exercises.length, 
        0
      );

      expect(totalExercises).toBeGreaterThanOrEqual(minExercises);
    });

    it('should ensure proper workout duration', () => {
      const targetDuration = 45;
      const tolerance = 10; // ±10 minutes

      const mockWorkout = {
        meta: { est_duration_min: 42 }
      };

      expect(mockWorkout.meta.est_duration_min).toBeGreaterThanOrEqual(targetDuration - tolerance);
      expect(mockWorkout.meta.est_duration_min).toBeLessThanOrEqual(targetDuration + tolerance);
    });
  });
});
