"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWorkoutWithOptimization = generateWorkoutWithOptimization;
exports.generateWorkout = generateWorkout;
const pino_1 = __importDefault(require("pino"));
// Core dependencies
const openai_1 = require("../libs/openai");
const env_1 = require("../config/env");
const workoutOutput_1 = require("../schemas/workoutOutput");
const promptVersioning_1 = require("./promptVersioning");
const circuitBreaker_1 = require("../utils/circuitBreaker");
const logger_1 = require("../utils/logger");
const gracefulDegradation_1 = require("./gracefulDegradation");
const intelligentCache_1 = require("./intelligentCache");
const requestDeduplication_1 = require("./requestDeduplication");
// Initialize logger for this service
const baseLogger = (0, pino_1.default)({
    name: 'workout-generator',
    level: process.env['NODE_ENV'] === 'development' ? 'debug' : 'info'
});
// Create logger wrapper that accepts any parameters
const logger = {
    info: (msg, obj) => baseLogger.info(obj || {}, msg),
    error: (msg, obj) => baseLogger.error(obj || {}, msg),
    warn: (msg, obj) => baseLogger.warn(obj || {}, msg),
    debug: (msg, obj) => baseLogger.debug(obj || {}, msg),
};
// Initialize circuit breaker for OpenAI API
const openaiCircuitBreaker = circuitBreaker_1.circuitBreakerRegistry.getBreaker('openai', {
    failureThreshold: 3,
    recoveryTimeout: 30000, // 30 seconds
    monitoringPeriod: 60000, // 1 minute
    expectedErrors: (error) => {
        // Don't trigger circuit breaker for client errors (4xx)
        if (error.message.includes('400') || error.message.includes('401') || error.message.includes('403')) {
            return false;
        }
        return true;
    }
});
// Initialize retry manager for OpenAI API calls
const retryManager = new circuitBreaker_1.RetryManager({
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    jitter: true,
    retryCondition: (error) => {
        // Retry on rate limits and server errors
        const message = error.message.toLowerCase();
        return message.includes('rate limit') ||
            message.includes('timeout') ||
            message.includes('503') ||
            message.includes('502') ||
            message.includes('500');
    }
});
// Initialize graceful degradation manager
const degradationManager = new gracefulDegradation_1.GracefulDegradationManager([
    {
        name: 'openai',
        fallbackStrategy: gracefulDegradation_1.FallbackStrategy.SIMPLIFIED_RESPONSE,
        fallbackData: {
            plan: {
                name: 'Basic Workout Plan',
                description: 'A simple workout plan generated during service degradation',
                exercises: [
                    {
                        name: 'Push-ups',
                        sets: 3,
                        reps: '10-15',
                        rest_seconds: 60,
                        instructions: 'Standard push-ups focusing on form'
                    },
                    {
                        name: 'Bodyweight Squats',
                        sets: 3,
                        reps: '15-20',
                        rest_seconds: 60,
                        instructions: 'Keep your back straight and go down until thighs are parallel to floor'
                    }
                ]
            }
        },
        maxQueueSize: 50,
        healthCheckInterval: 30000 // 30 seconds
    }
]);
// Initialize intelligent cache for workout generation
const workoutCache = intelligentCache_1.cacheManager.getCache('workout-generation', {
    strategy: intelligentCache_1.CacheStrategy.ADAPTIVE,
    maxSize: 500,
    ttl: 1800000, // 30 minutes
    tier: intelligentCache_1.CacheTier.L1_MEMORY,
    compressionEnabled: true,
    metricsEnabled: true
});
/**
 * AI generation error with additional context
 */
class WorkoutGenerationError extends Error {
    code;
    originalError;
    constructor(message, code, originalError) {
        super(message);
        this.code = code;
        this.originalError = originalError;
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
function getOptimalModelParameters(options = {}) {
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
 * Generate cache key for workout generation
 */
function generateCacheKey(promptData, options) {
    const keyData = {
        promptHash: promptData.prompt.substring(0, 100), // First 100 chars for uniqueness
        variant: promptData.variant?.name || 'default',
        workoutType: options.workoutType,
        experience: options.experience,
        duration: options.duration
    };
    return `workout:${Buffer.from(JSON.stringify(keyData)).toString('base64')}`;
}
/**
 * Enhanced workout generation with caching and deduplication
 */
// @deduplicate({ timeout: 60000 }) // 1 minute timeout for deduplication - temporarily disabled
async function generateWorkoutWithOptimization(promptData, options = {}) {
    const startTime = Date.now();
    const requestId = `workout-gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const cacheKey = generateCacheKey(promptData, options);
    logger.info('Starting optimized AI workout generation', {
        requestId,
        cacheKey,
        workoutType: options.workoutType,
        experience: options.experience,
        duration: options.duration,
        promptLength: promptData.prompt.length,
        serviceHealth: degradationManager.getServiceHealth('openai')
    });
    // Check cache first
    const cachedResult = await workoutCache.get(cacheKey);
    if (cachedResult) {
        logger.info('Workout served from cache', {
            requestId,
            cacheKey,
            responseTime: Date.now() - startTime
        });
        return cachedResult;
    }
    // Use request deduplication for the actual generation
    return await requestDeduplication_1.requestDeduplicationService.execute(async () => {
        const result = await generateWorkout(promptData, options);
        // Cache the successful result
        await workoutCache.set(cacheKey, result, 1800000); // 30 minutes
        logger.info('Workout generated and cached', {
            requestId,
            cacheKey,
            responseTime: Date.now() - startTime
        });
        return result;
    }, { promptData, options }, { key: cacheKey, timeout: 60000 });
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
async function generateWorkout(promptData, options = {}) {
    const startTime = Date.now();
    const requestId = `workout-gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    logger.info('Starting AI workout generation with enhanced resilience', {
        requestId,
        workoutType: options.workoutType,
        experience: options.experience,
        duration: options.duration,
        promptLength: promptData.prompt.length,
        serviceHealth: degradationManager.getServiceHealth('openai')
    });
    try {
        // Execute with graceful degradation and resilience patterns
        return await degradationManager.executeWithDegradation('openai', async () => {
            // 1. Calculate optimal model parameters
            const baseModelParams = getOptimalModelParameters(options);
            const modelParams = promptVersioning_1.promptVersioning.getModelParameters(promptData.variant, baseModelParams);
            logger.debug('Model parameters calculated', { requestId, modelParams });
            // 2. Prepare AI request with structured output
            const aiRequest = {
                model: env_1.env.OPENAI_MODEL,
                messages: [
                    {
                        role: 'system',
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
                        role: 'user',
                        content: promptData.prompt
                    }
                ],
                temperature: modelParams.temperature,
                top_p: modelParams.topP,
                response_format: {
                    type: 'json_schema',
                    json_schema: {
                        name: 'workout_plan',
                        schema: workoutOutput_1.WorkoutPlanJsonSchema,
                        strict: true
                    }
                }
            };
            // 3. Execute with retry and circuit breaker protection
            return await retryManager.execute(async () => {
                logger.debug('Calling OpenAI API with circuit breaker protection', {
                    requestId,
                    model: env_1.env.OPENAI_MODEL
                });
                const response = await (0, logger_1.measureExecutionTime)('openai_api_call', () => openaiCircuitBreaker.execute(() => openai_1.openai.chat.completions.create(aiRequest)), { model: env_1.env.OPENAI_MODEL, promptLength: promptData.prompt.length });
                // Log successful API call
                logger_1.structuredLogger.logExternalServiceCall('openai', 'chat.completions.create', Date.now() - startTime, true, { model: env_1.env.OPENAI_MODEL, requestId });
                return response;
            }, { serviceName: 'openai', operation: 'workout_generation' });
        }, {
            cacheKey: `workout-${options.workoutType}-${options.experience}-${options.duration}`,
            fallbackData: {
                plan: {
                    name: 'Emergency Workout Plan',
                    description: 'A basic workout plan generated during service outage',
                    exercises: [
                        {
                            name: 'Push-ups',
                            sets: 3,
                            reps: '8-12',
                            rest_seconds: 60,
                            instructions: 'Keep your body in a straight line, lower until chest nearly touches ground'
                        },
                        {
                            name: 'Bodyweight Squats',
                            sets: 3,
                            reps: '12-15',
                            rest_seconds: 60,
                            instructions: 'Feet shoulder-width apart, lower until thighs parallel to ground'
                        },
                        {
                            name: 'Plank',
                            sets: 3,
                            reps: '30-60 seconds',
                            rest_seconds: 60,
                            instructions: 'Hold a straight line from head to heels, engage core'
                        }
                    ]
                }
            }
        }).then(async (response) => {
            // 4. Validate response
            // Type guard to ensure we have a ChatCompletion response
            if (!('choices' in response)) {
                throw new Error('Unexpected response format from OpenAI API');
            }
            const text = response.choices[0]?.message?.content;
            if (!text) {
                throw new WorkoutGenerationError('No response content from OpenAI', 'EMPTY_RESPONSE');
            }
            // 5. Parse JSON response
            let parsedWorkout;
            try {
                parsedWorkout = JSON.parse(text);
            }
            catch (parseError) {
                logger.error('Failed to parse AI response as JSON', {
                    requestId,
                    error: parseError instanceof Error ? parseError.message : 'Unknown parse error',
                    responseLength: text.length,
                    responsePreview: text.substring(0, 200)
                });
                throw new WorkoutGenerationError('AI returned invalid JSON format', 'INVALID_JSON', parseError instanceof Error ? parseError : new Error('Parse error'));
            }
            // 6. Log successful generation
            const responseTime = Date.now() - startTime;
            logger.info('AI workout generation completed successfully', {
                requestId,
                responseTime,
                workoutType: options.workoutType,
                exerciseCount: parsedWorkout.blocks?.length || 0,
                estimatedDuration: parsedWorkout.meta?.est_duration_min
            });
            return parsedWorkout;
        });
    }
    catch (error) {
        const responseTime = Date.now() - startTime;
        // Enhanced error handling with classification
        logger.error('Workout generation failed with enhanced error handling', {
            requestId,
            error: error.message || 'Unknown error',
            errorType: error.constructor.name,
            responseTime,
            serviceHealth: degradationManager.getServiceHealth('openai')
        });
        // Handle our custom errors
        if (error instanceof WorkoutGenerationError) {
            throw error;
        }
        // Handle graceful degradation errors
        if (error.name === 'GracefulDegradationError') {
            throw new WorkoutGenerationError('AI service is temporarily unavailable. Using fallback response.', 'SERVICE_DEGRADED', error);
        }
        // Handle retry exhausted errors
        if (error.name === 'RetryExhaustedError') {
            throw new WorkoutGenerationError('AI service failed after multiple attempts. Please try again later.', 'RETRY_EXHAUSTED', error);
        }
        // Handle circuit breaker errors
        if (error.name === 'CircuitBreakerError') {
            throw new WorkoutGenerationError('AI service is temporarily unavailable due to high failure rate.', 'CIRCUIT_BREAKER_OPEN', error);
        }
        // Handle OpenAI API errors with enhanced classification
        if (error.status) {
            const statusCode = error.status;
            let errorCode = 'AI_SERVICE_ERROR';
            let userMessage = 'AI service error occurred';
            if (statusCode === 429) {
                errorCode = 'RATE_LIMIT_ERROR';
                userMessage = 'AI service is busy. Please try again in a moment.';
            }
            else if (statusCode >= 500) {
                errorCode = 'AI_SERVICE_UNAVAILABLE';
                userMessage = 'AI service is temporarily unavailable. Please try again.';
            }
            else if (statusCode === 401 || statusCode === 403) {
                errorCode = 'AI_SERVICE_AUTH_ERROR';
                userMessage = 'AI service authentication error.';
            }
            throw new WorkoutGenerationError(userMessage, errorCode, error);
        }
        // Handle network/timeout errors
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
            throw new WorkoutGenerationError('AI service request timed out. Please try again.', 'TIMEOUT_ERROR', error);
        }
        // Generic error handling with fallback
        throw new WorkoutGenerationError('Failed to generate workout plan. Please try again.', 'GENERATION_ERROR', error);
    }
}
//# sourceMappingURL=generator.js.map