import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { generateWorkout, WorkoutGenerationError } from '../../../src/services/generator'

// Mock dependencies
jest.mock('../../../src/libs/openai', () => ({
  openai: {
    chat: {
      completions: {
        create: jest.fn()
      }
    }
  }
}))

jest.mock('../../../src/config/env', () => ({
  env: {
    OPENAI_MODEL: 'gpt-4o-mini',
    NODE_ENV: 'test'
  }
}))

jest.mock('../../../src/services/promptVersioning', () => ({
  promptVersioning: {
    getModelParameters: jest.fn((variant, baseParams) => baseParams)
  }
}))

jest.mock('../../../src/utils/logger', () => ({
  measureExecutionTime: jest.fn((name, fn) => fn()),
  structuredLogger: {
    logExternalServiceCall: jest.fn()
  }
}))

jest.mock('../../../src/utils/circuitBreaker', () => ({
  circuitBreakerRegistry: {
    getBreaker: jest.fn(() => ({
      execute: jest.fn((fn) => fn())
    }))
  },
  RetryManager: jest.fn().mockImplementation(() => ({
    execute: jest.fn((fn) => fn())
  }))
}))

jest.mock('../../../src/services/gracefulDegradation', () => ({
  GracefulDegradationManager: jest.fn().mockImplementation(() => ({
    executeWithDegradation: jest.fn((serviceName, fn, options) => fn()),
    getServiceHealth: jest.fn(() => 'HEALTHY')
  }))
}))

// Mock pino logger
jest.mock('pino', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  })),
}))

import { openai } from '../../../src/libs/openai'

const mockOpenAI = openai as jest.Mocked<typeof openai>

describe('Enhanced Workout Generator', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('generateWorkout', () => {
    const mockPromptData = {
      prompt: 'Generate a beginner workout for weight loss',
      variant: { name: 'default' }
    }

    const mockOptions = {
      workoutType: 'strength',
      experience: 'beginner',
      duration: 45
    }

    const mockWorkoutResponse = {
      plan: {
        name: 'Beginner Strength Workout',
        description: 'A comprehensive strength training workout for beginners',
        exercises: [
          {
            name: 'Push-ups',
            sets: 3,
            reps: '8-12',
            rest_seconds: 60,
            instructions: 'Keep your body in a straight line'
          },
          {
            name: 'Squats',
            sets: 3,
            reps: '12-15',
            rest_seconds: 60,
            instructions: 'Lower until thighs are parallel to ground'
          }
        ]
      }
    }

    it('should generate workout successfully with resilience patterns', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify(mockWorkoutResponse)
          }
        }]
      }

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse as any)

      const result = await generateWorkout(mockPromptData, mockOptions)

      expect(result).toEqual(mockWorkoutResponse)
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4o-mini',
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'system',
              content: expect.stringContaining('Dr. Sarah Chen')
            }),
            expect.objectContaining({
              role: 'user',
              content: mockPromptData.prompt
            })
          ]),
          temperature: expect.any(Number),
          top_p: expect.any(Number),
          response_format: expect.objectContaining({
            type: 'json_schema'
          })
        })
      )
    })

    it('should handle OpenAI API errors with proper classification', async () => {
      const apiError = Object.assign(new Error('Rate limit exceeded'), { status: 429 })
      mockOpenAI.chat.completions.create.mockRejectedValue(apiError)

      await expect(generateWorkout(mockPromptData, mockOptions))
        .rejects.toThrow(WorkoutGenerationError)

      try {
        await generateWorkout(mockPromptData, mockOptions)
      } catch (error) {
        expect(error).toBeInstanceOf(WorkoutGenerationError)
        expect((error as WorkoutGenerationError).code).toBe('RATE_LIMIT_ERROR')
      }
    })

    it('should handle network timeout errors', async () => {
      const timeoutError = new Error('ETIMEDOUT')
      mockOpenAI.chat.completions.create.mockRejectedValue(timeoutError)

      await expect(generateWorkout(mockPromptData, mockOptions))
        .rejects.toThrow(WorkoutGenerationError)

      try {
        await generateWorkout(mockPromptData, mockOptions)
      } catch (error) {
        expect(error).toBeInstanceOf(WorkoutGenerationError)
        expect((error as WorkoutGenerationError).code).toBe('TIMEOUT_ERROR')
      }
    })

    it('should handle invalid JSON response', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Invalid JSON response'
          }
        }]
      }

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse as any)

      await expect(generateWorkout(mockPromptData, mockOptions))
        .rejects.toThrow(WorkoutGenerationError)

      try {
        await generateWorkout(mockPromptData, mockOptions)
      } catch (error) {
        expect(error).toBeInstanceOf(WorkoutGenerationError)
        expect((error as WorkoutGenerationError).code).toBe('INVALID_JSON')
      }
    })

    it('should handle empty response content', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: null
          }
        }]
      }

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse as any)

      await expect(generateWorkout(mockPromptData, mockOptions))
        .rejects.toThrow(WorkoutGenerationError)

      try {
        await generateWorkout(mockPromptData, mockOptions)
      } catch (error) {
        expect(error).toBeInstanceOf(WorkoutGenerationError)
        expect((error as WorkoutGenerationError).code).toBe('EMPTY_RESPONSE')
      }
    })

    it('should handle unexpected response format', async () => {
      const mockResponse = {
        // Missing choices property
        data: 'unexpected format'
      }

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse as any)

      await expect(generateWorkout(mockPromptData, mockOptions))
        .rejects.toThrow('Unexpected response format from OpenAI API')
    })

    it('should optimize model parameters based on workout type', async () => {
      const conditioningOptions = {
        workoutType: 'conditioning',
        experience: 'intermediate',
        duration: 30
      }

      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify(mockWorkoutResponse)
          }
        }]
      }

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse as any)

      await generateWorkout(mockPromptData, conditioningOptions)

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.3, // Higher temperature for conditioning workouts
          top_p: expect.any(Number)
        })
      )
    })

    it('should adjust parameters for advanced users', async () => {
      const advancedOptions = {
        workoutType: 'strength',
        experience: 'advanced',
        duration: 60
      }

      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify(mockWorkoutResponse)
          }
        }]
      }

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse as any)

      await generateWorkout(mockPromptData, advancedOptions)

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.25, // Adjusted for advanced users
          top_p: 0.85 // More focused responses
        })
      )
    })

    it('should adjust parameters for longer workouts', async () => {
      const longWorkoutOptions = {
        workoutType: 'strength',
        experience: 'intermediate',
        duration: 90
      }

      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify(mockWorkoutResponse)
          }
        }]
      }

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse as any)

      await generateWorkout(mockPromptData, longWorkoutOptions)

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.15 // More structured for longer workouts
        })
      )
    })

    it('should handle server errors with proper classification', async () => {
      const serverError = Object.assign(new Error('Internal Server Error'), { status: 500 })
      mockOpenAI.chat.completions.create.mockRejectedValue(serverError)

      await expect(generateWorkout(mockPromptData, mockOptions))
        .rejects.toThrow(WorkoutGenerationError)

      try {
        await generateWorkout(mockPromptData, mockOptions)
      } catch (error) {
        expect(error).toBeInstanceOf(WorkoutGenerationError)
        expect((error as WorkoutGenerationError).code).toBe('AI_SERVICE_UNAVAILABLE')
        expect((error as WorkoutGenerationError).message).toContain('temporarily unavailable')
      }
    })

    it('should handle authentication errors', async () => {
      const authError = Object.assign(new Error('Unauthorized'), { status: 401 })
      mockOpenAI.chat.completions.create.mockRejectedValue(authError)

      await expect(generateWorkout(mockPromptData, mockOptions))
        .rejects.toThrow(WorkoutGenerationError)

      try {
        await generateWorkout(mockPromptData, mockOptions)
      } catch (error) {
        expect(error).toBeInstanceOf(WorkoutGenerationError)
        expect((error as WorkoutGenerationError).code).toBe('AI_SERVICE_AUTH_ERROR')
      }
    })

    it('should preserve existing WorkoutGenerationError instances', async () => {
      const customError = new WorkoutGenerationError('Custom error', 'CUSTOM_ERROR')
      mockOpenAI.chat.completions.create.mockRejectedValue(customError)

      await expect(generateWorkout(mockPromptData, mockOptions))
        .rejects.toThrow(customError)
    })
  })
})
