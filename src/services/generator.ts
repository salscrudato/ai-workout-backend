import pino from 'pino';

// Core dependencies
import { openai } from '../libs/openai';
import { env } from '../config/env';
import { WorkoutPlanJsonSchema } from '../schemas/workoutOutput';
import { promptVersioning } from './promptVersioning';
import { circuitBreakerRegistry } from '../utils/circuitBreaker';
import { measureExecutionTime, structuredLogger } from '../utils/logger';

// Initialize logger for this service
const baseLogger = pino({
  name: 'workout-generator',
  level: process.env['NODE_ENV'] === 'development' ? 'debug' : 'info'
});

// Create logger wrapper that accepts any parameters
const logger = {
  info: (msg: string, obj?: any) => baseLogger.info(obj || {}, msg),
  error: (msg: string, obj?: any) => baseLogger.error(obj || {}, msg),
  warn: (msg: string, obj?: any) => baseLogger.warn(obj || {}, msg),
  debug: (msg: string, obj?: any) => baseLogger.debug(obj || {}, msg),
};

// Initialize circuit breaker for OpenAI API
const openaiCircuitBreaker = circuitBreakerRegistry.getBreaker('openai', {
  failureThreshold: 3,
  recoveryTimeout: 30000, // 30 seconds
  monitoringPeriod: 60000, // 1 minute
  expectedErrors: (error: Error) => {
    // Don't trigger circuit breaker for client errors (4xx)
    if (error.message.includes('400') || error.message.includes('401') || error.message.includes('403')) {
      return false;
    }
    return true;
  }
});

/**
 * Configuration options for AI workout generation
 */
interface GenerationOptions {
  readonly workoutType?: string;
  readonly experience?: string;
  readonly duration?: number;
}

/**
 * AI generation error with additional context
 */
class WorkoutGenerationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'WorkoutGenerationError';
  }
}

/**
 * Calculates optimal AI model parameters based on workout characteristics
 *
 * Different workout types and user experience levels require different
 * levels of creativity vs. structure in AI responses.
 *
 * @param options - Workout generation options
 * @returns Optimized temperature and topP parameters for AI model
 */
function getOptimalModelParameters(options: GenerationOptions = {}): { temperature: number; topP: number } {
  // Base parameters for balanced creativity and structure
  let temperature = 0.2;
  let topP = 0.9;

  // Adjust based on workout complexity and type
  if (options.workoutType?.includes('conditioning') || options.workoutType?.includes('hiit')) {
    temperature = 0.3; // More creativity for varied cardio workouts
    logger.debug('Adjusted parameters for conditioning workout', { temperature });
  }

  if (options.experience === 'advanced') {
    temperature = 0.25; // Slightly more variation for advanced programming
    topP = 0.85; // More focused responses for experienced users
    logger.debug('Adjusted parameters for advanced user', { temperature, topP });
  }

  if (options.duration && options.duration > 60) {
    temperature = 0.15; // More structured approach for longer workouts
    logger.debug('Adjusted parameters for long workout', { temperature, duration: options.duration });
  }

  return { temperature, topP };
}

/**
 * Generates a personalized workout plan using OpenAI's GPT model
 *
 * This function orchestrates the complete AI workout generation process:
 * 1. Optimizes model parameters based on workout characteristics
 * 2. Applies prompt versioning for A/B testing
 * 3. Calls OpenAI API with structured output schema
 * 4. Validates and parses the AI response
 * 5. Returns structured workout data
 *
 * @param promptData - Contains the personalized prompt and variant information
 * @param options - Generation options for parameter optimization
 * @returns Promise resolving to structured workout plan
 * @throws {WorkoutGenerationError} When AI generation fails
 */
export async function generateWorkout(
  promptData: { prompt: string; variant: any },
  options: GenerationOptions = {}
): Promise<any> {
  const startTime = Date.now();

  try {
    logger.info('Starting AI workout generation', {
      workoutType: options.workoutType,
      experience: options.experience,
      duration: options.duration,
      promptLength: promptData.prompt.length
    });

    // 1. Calculate optimal model parameters
    const baseModelParams = getOptimalModelParameters(options);
    const modelParams = promptVersioning.getModelParameters(promptData.variant, baseModelParams);

    logger.debug('Model parameters calculated', { modelParams });

    // 2. Prepare AI request with structured output
    const aiRequest = {
      model: env.OPENAI_MODEL,
      messages: [
        {
          role: 'system' as const,
          content: `You are Dr. Sarah Chen, a world-renowned exercise physiologist and strength coach with 25+ years of experience. You've trained Olympic athletes, developed evidence-based training protocols, and published research on exercise adaptation.

ADVANCED EXERCISE SCIENCE PRINCIPLES:
- Apply SAID Principle (Specific Adaptations to Imposed Demands) for targeted adaptations
- Use Supercompensation Theory for optimal recovery and progression timing
- Implement Conjugate Method for advanced athletes (simultaneous development of strength, power, endurance)
- Apply Block Periodization for intermediate/advanced (accumulation → intensification → realization)
- Use Daily Undulating Periodization (DUP) for variety and continuous adaptation
- Implement Autoregulation based on RPE and velocity-based training principles

BIOMECHANICAL OPTIMIZATION:
- Prioritize movement quality over quantity (kinetic chain efficiency)
- Address common compensation patterns (anterior pelvic tilt, forward head posture, etc.)
- Include unilateral training for bilateral strength deficits
- Implement movement preparation sequences (activation → mobilization → integration)
- Use tempo manipulation for strength, hypertrophy, and power development
- Apply force-velocity curve training (strength-speed continuum)

ADVANCED PROGRAMMING STRATEGIES:
- Use cluster sets for power development (3-5 reps, 15-20s intra-set rest)
- Implement contrast training (heavy → explosive → plyometric)
- Apply post-activation potentiation (PAP) protocols
- Use accommodating resistance concepts (bands/chains simulation through tempo)
- Implement mechanical drop sets (hardest → easier exercise variations)
- Apply density training for metabolic conditioning

RECOVERY AND ADAPTATION SCIENCE:
- Monitor autonomic nervous system status through HRV and subjective markers
- Implement parasympathetic activation techniques (breathing, meditation)
- Use active recovery protocols (20-40% 1RM, blood flow enhancement)
- Apply contrast therapy principles (hot/cold exposure simulation through intensity)
- Implement sleep hygiene and circadian rhythm optimization cues

EXERCISE SELECTION MASTERY:
- Choose exercises based on force-vector specificity
- Implement movement pattern hierarchy (bilateral → unilateral → rotational)
- Use muscle action spectrum (eccentric → isometric → concentric → plyometric)
- Apply joint-by-joint mobility/stability approach
- Implement corrective exercise integration within main workout

Generate scientifically-optimized workout plans that maximize training adaptations while ensuring safety and adherence. Always consider the individual's complete profile, training history, and current state when designing programs.

Output must be valid JSON matching the provided schema exactly. Focus on progressive overload, movement quality, and sustainable training practices.`
        },
        {
          role: 'user' as const,
          content: promptData.prompt
        }
      ],
      temperature: modelParams.temperature,
      top_p: modelParams.topP,
      response_format: {
        type: 'json_schema' as const,
        json_schema: {
          name: 'workout_plan',
          schema: WorkoutPlanJsonSchema,
          strict: true
        }
      }
    };

    // 3. Call OpenAI API with circuit breaker protection
    logger.debug('Calling OpenAI API', { model: env.OPENAI_MODEL });

    const response = await measureExecutionTime(
      'openai_api_call',
      () => openaiCircuitBreaker.execute(() => openai.chat.completions.create(aiRequest)),
      { model: env.OPENAI_MODEL, promptLength: promptData.prompt.length }
    );

    // Log successful API call
    structuredLogger.logExternalServiceCall(
      'openai',
      'chat.completions.create',
      Date.now() - startTime,
      true,
      { model: env.OPENAI_MODEL }
    );

    // 4. Validate response
    // Type guard to ensure we have a ChatCompletion response
    if (!('choices' in response)) {
      throw new Error('Unexpected response format from OpenAI API');
    }

    const text = response.choices[0]?.message?.content;
    if (!text) {
      throw new WorkoutGenerationError(
        'No response content from OpenAI',
        'EMPTY_RESPONSE'
      );
    }

    // 5. Parse JSON response
    let parsedWorkout: any;
    try {
      parsedWorkout = JSON.parse(text);
    } catch (parseError) {
      logger.error('Failed to parse AI response as JSON', {
        error: parseError instanceof Error ? parseError.message : 'Unknown parse error',
        responseLength: text.length,
        responsePreview: text.substring(0, 200)
      });

      throw new WorkoutGenerationError(
        'AI returned invalid JSON format',
        'INVALID_JSON',
        parseError instanceof Error ? parseError : new Error('Parse error')
      );
    }

    // 6. Log successful generation
    const responseTime = Date.now() - startTime;
    logger.info('AI workout generation completed successfully', {
      responseTime,
      workoutType: options.workoutType,
      exerciseCount: parsedWorkout.blocks?.length || 0,
      estimatedDuration: parsedWorkout.meta?.est_duration_min
    });

    return parsedWorkout;

  } catch (error: any) {
    const responseTime = Date.now() - startTime;

    // Handle our custom errors
    if (error instanceof WorkoutGenerationError) {
      logger.error('Workout generation failed', {
        code: error.code,
        message: error.message,
        responseTime
      });
      throw error;
    }

    // Handle OpenAI API errors
    if (error.status) {
      logger.error('OpenAI API error', {
        status: error.status,
        message: error.message,
        responseTime
      });

      throw new WorkoutGenerationError(
        `AI service error: ${error.message}`,
        'AI_SERVICE_ERROR',
        error
      );
    }

    // Handle network/timeout errors
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      logger.error('AI service timeout', { responseTime });
      throw new WorkoutGenerationError(
        'AI service request timed out',
        'TIMEOUT_ERROR',
        error
      );
    }

    // Generic error handling
    logger.error('Unexpected error in workout generation', {
      error: error.message || 'Unknown error',
      responseTime
    });

    throw new WorkoutGenerationError(
      'Failed to generate workout plan',
      'GENERATION_ERROR',
      error
    );
  }
}