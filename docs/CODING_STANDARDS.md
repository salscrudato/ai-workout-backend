# AI Workout Backend - Coding Standards

## Overview

This document establishes coding standards optimized for AI-agent collaboration, ensuring consistent, readable, and maintainable code across the entire application.

## General Principles

### 1. **AI-Agent Optimization**
- Write self-documenting code with clear intent
- Use descriptive variable and function names
- Provide comprehensive JSDoc comments
- Structure code for easy pattern recognition

### 2. **Consistency**
- Follow established patterns throughout the codebase
- Use consistent naming conventions
- Maintain uniform file structure
- Apply consistent error handling

### 3. **Maintainability**
- Write modular, testable code
- Separate concerns appropriately
- Minimize dependencies between modules
- Use dependency injection where appropriate

## TypeScript Standards

### Type Definitions

```typescript
// ✅ Good: Explicit, descriptive types
interface WorkoutGenerationRequest {
  readonly userId: string;
  readonly experience: 'beginner' | 'intermediate' | 'advanced';
  readonly goals: readonly string[];
  readonly duration: number; // minutes
  readonly equipmentAvailable: readonly string[];
}

// ❌ Bad: Generic, unclear types
interface Request {
  user: any;
  data: object;
}
```

### Function Signatures

```typescript
// ✅ Good: Clear parameters with JSDoc
/**
 * Generates a personalized workout plan using AI
 * @param userId - Unique identifier for the user
 * @param preferences - User's workout preferences and constraints
 * @returns Promise resolving to generated workout plan
 * @throws {ValidationError} When input parameters are invalid
 * @throws {AIServiceError} When AI service is unavailable
 */
async function generateWorkoutPlan(
  userId: string,
  preferences: WorkoutGenerationRequest
): Promise<WorkoutPlan> {
  // Implementation
}

// ❌ Bad: Unclear parameters
async function generate(id: string, data: any): Promise<any> {
  // Implementation
}
```

### Error Handling

```typescript
// ✅ Good: Specific error types with context
class WorkoutGenerationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly userId: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'WorkoutGenerationError';
  }
}

// Usage
try {
  const workout = await generateWorkout(userId, preferences);
  return workout;
} catch (error) {
  if (error instanceof ValidationError) {
    throw new WorkoutGenerationError(
      'Invalid workout parameters provided',
      'INVALID_PARAMETERS',
      userId,
      error
    );
  }
  throw error;
}
```

## Backend Standards

### Service Layer Pattern

```typescript
// ✅ Good: Service with clear responsibilities
/**
 * Service responsible for AI-powered workout generation
 * Handles prompt engineering, AI API calls, and result processing
 */
export class WorkoutGenerationService {
  constructor(
    private readonly aiClient: OpenAIClient,
    private readonly promptBuilder: PromptBuilder,
    private readonly workoutValidator: WorkoutValidator
  ) {}

  /**
   * Generates a personalized workout using AI
   * @param userId - User identifier for personalization
   * @param request - Workout generation parameters
   * @returns Generated and validated workout plan
   */
  async generateWorkout(
    userId: string,
    request: WorkoutGenerationRequest
  ): Promise<WorkoutPlan> {
    // 1. Build personalized prompt
    const prompt = await this.promptBuilder.buildPrompt(userId, request);
    
    // 2. Call AI service
    const aiResponse = await this.aiClient.generateWorkout(prompt);
    
    // 3. Validate and process response
    const workout = await this.workoutValidator.validate(aiResponse);
    
    return workout;
  }
}
```

### Controller Pattern

```typescript
// ✅ Good: Thin controller with proper error handling
/**
 * Handles HTTP requests for workout generation
 */
export class WorkoutController {
  constructor(
    private readonly workoutService: WorkoutGenerationService,
    private readonly logger: Logger
  ) {}

  /**
   * POST /v1/workouts/generate
   * Generates a new workout plan for the authenticated user
   */
  generateWorkout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const startTime = Date.now();
    
    try {
      // 1. Extract and validate input
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
        return;
      }

      const request = WorkoutGenerationRequestSchema.parse(req.body);

      // 2. Generate workout
      const workout = await this.workoutService.generateWorkout(userId, request);

      // 3. Log success metrics
      const responseTime = Date.now() - startTime;
      this.logger.info('Workout generated successfully', {
        userId,
        responseTime,
        workoutId: workout.id
      });

      // 4. Return response
      res.status(201).json({
        workoutId: workout.id,
        plan: workout.plan,
        metadata: {
          generatedAt: new Date().toISOString(),
          responseTime
        }
      });

    } catch (error) {
      this.handleError(error, req, res, startTime);
    }
  });

  private handleError(error: unknown, req: Request, res: Response, startTime: number): void {
    const responseTime = Date.now() - startTime;
    
    if (error instanceof ValidationError) {
      this.logger.warn('Validation error in workout generation', {
        userId: req.user?.uid,
        error: error.message,
        responseTime
      });
      
      res.status(400).json({
        error: 'Invalid request parameters',
        code: 'VALIDATION_ERROR',
        details: error.errors
      });
      return;
    }

    if (error instanceof WorkoutGenerationError) {
      this.logger.error('Workout generation failed', {
        userId: req.user?.uid,
        error: error.message,
        code: error.code,
        responseTime
      });
      
      res.status(503).json({
        error: 'Workout generation temporarily unavailable',
        code: error.code
      });
      return;
    }

    // Generic error handling
    this.logger.error('Unexpected error in workout generation', {
      userId: req.user?.uid,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime
    });
    
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
}
```

### Model Pattern

```typescript
// ✅ Good: Model with clear data access patterns
/**
 * Data access layer for workout plans
 * Provides CRUD operations with proper error handling and caching
 */
export class WorkoutPlanModel {
  private static readonly COLLECTION = 'workoutPlans';
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Creates a new workout plan in the database
   * @param data - Workout plan data to create
   * @returns Created workout plan with generated ID
   * @throws {DatabaseError} When database operation fails
   */
  static async create(data: CreateWorkoutPlanInput): Promise<WorkoutPlan> {
    try {
      const db = getFirestore();
      const now = Timestamp.now();

      const workoutPlanData: Omit<WorkoutPlan, 'id'> = {
        ...data,
        createdAt: now,
        updatedAt: now
      };

      const docRef = await db.collection(this.COLLECTION).add(workoutPlanData);

      const createdPlan: WorkoutPlan = {
        id: docRef.id,
        ...workoutPlanData
      };

      // Cache the created plan
      this.setCache(docRef.id, createdPlan);

      return createdPlan;
    } catch (error) {
      throw new DatabaseError(
        'Failed to create workout plan',
        'CREATE_FAILED',
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }

  /**
   * Finds a workout plan by ID with caching
   * @param id - Workout plan ID
   * @returns Workout plan or null if not found
   */
  static async findById(id: string): Promise<WorkoutPlan | null> {
    // Check cache first
    const cached = this.getFromCache(id);
    if (cached) {
      return cached;
    }

    try {
      const db = getFirestore();
      const doc = await db.collection(this.COLLECTION).doc(id).get();

      if (!doc.exists) {
        return null;
      }

      const workoutPlan: WorkoutPlan = {
        id: doc.id,
        ...doc.data()
      } as WorkoutPlan;

      // Cache the result
      this.setCache(id, workoutPlan);

      return workoutPlan;
    } catch (error) {
      throw new DatabaseError(
        `Failed to find workout plan with ID: ${id}`,
        'FIND_FAILED',
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }

  // Cache management methods
  private static cache = new Map<string, { data: WorkoutPlan; timestamp: number }>();

  private static getFromCache(id: string): WorkoutPlan | null {
    const cached = this.cache.get(id);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.CACHE_TTL;
    if (isExpired) {
      this.cache.delete(id);
      return null;
    }

    return cached.data;
  }

  private static setCache(id: string, data: WorkoutPlan): void {
    this.cache.set(id, {
      data,
      timestamp: Date.now()
    });
  }
}
```

## Frontend Standards

### Component Structure

```typescript
// ✅ Good: Well-structured React component
interface WorkoutGeneratorProps {
  readonly userId: string;
  readonly onWorkoutGenerated: (workoutId: string) => void;
  readonly onError: (error: Error) => void;
}

/**
 * Component for generating AI-powered workout plans
 * Provides form interface for workout preferences and handles generation process
 */
export const WorkoutGenerator: React.FC<WorkoutGeneratorProps> = ({
  userId,
  onWorkoutGenerated,
  onError
}) => {
  // State management
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  
  // Form handling
  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<WorkoutGenerationForm>({
    resolver: zodResolver(workoutGenerationSchema),
    mode: 'onChange'
  });

  // Memoized handlers
  const handleGeneration = useCallback(async (data: WorkoutGenerationForm) => {
    try {
      setIsGenerating(true);
      setGenerationProgress(0);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await apiClient.generateWorkout({
        userId,
        ...data
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      onWorkoutGenerated(response.workoutId);
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Generation failed'));
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  }, [userId, onWorkoutGenerated, onError]);

  return (
    <Card className="workout-generator">
      <CardHeader>
        <CardTitle>Generate Your Workout</CardTitle>
        <CardDescription>
          Create a personalized workout plan powered by AI
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(handleGeneration)} className="space-y-6">
          {/* Form fields */}
          <FormField
            label="Workout Type"
            error={errors.workoutType?.message}
            required
          >
            <Select {...register('workoutType')}>
              <SelectOption value="full_body">Full Body</SelectOption>
              <SelectOption value="upper_lower">Upper/Lower Split</SelectOption>
              {/* More options */}
            </Select>
          </FormField>

          {/* Generation progress */}
          {isGenerating && (
            <GenerationProgress
              progress={generationProgress}
              message="Creating your personalized workout..."
            />
          )}

          {/* Submit button */}
          <Button
            type="submit"
            disabled={!isValid || isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Spinner className="mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2" />
                Generate Workout
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
```

## Documentation Standards

### JSDoc Comments

```typescript
/**
 * Brief description of the function/class/interface
 * 
 * Detailed description explaining the purpose, behavior, and any important
 * implementation details that would help an AI agent understand the code.
 * 
 * @param paramName - Description of the parameter, including type info if not obvious
 * @param optionalParam - Optional parameter description
 * @returns Description of what the function returns
 * @throws {ErrorType} Description of when this error is thrown
 * @example
 * ```typescript
 * const result = await functionName('example', { option: true });
 * console.log(result.data);
 * ```
 * 
 * @since 1.0.0
 * @author AI Workout Team
 */
```

### README Structure

Each module/service should have a README.md with:

1. **Purpose**: What the module does
2. **Usage**: How to use it with examples
3. **API**: Public interface documentation
4. **Dependencies**: What it depends on
5. **Testing**: How to test it
6. **Performance**: Any performance considerations

## Testing Standards

### Unit Test Structure

```typescript
describe('WorkoutGenerationService', () => {
  let service: WorkoutGenerationService;
  let mockAIClient: jest.Mocked<OpenAIClient>;
  let mockPromptBuilder: jest.Mocked<PromptBuilder>;

  beforeEach(() => {
    mockAIClient = createMockAIClient();
    mockPromptBuilder = createMockPromptBuilder();
    service = new WorkoutGenerationService(mockAIClient, mockPromptBuilder);
  });

  describe('generateWorkout', () => {
    it('should generate a valid workout plan for beginner user', async () => {
      // Arrange
      const userId = 'test-user-123';
      const request: WorkoutGenerationRequest = {
        experience: 'beginner',
        goals: ['weight_loss'],
        duration: 30,
        equipmentAvailable: ['bodyweight']
      };

      mockPromptBuilder.buildPrompt.mockResolvedValue('test-prompt');
      mockAIClient.generateWorkout.mockResolvedValue(mockWorkoutResponse);

      // Act
      const result = await service.generateWorkout(userId, request);

      // Assert
      expect(result).toBeDefined();
      expect(result.meta.experience).toBe('beginner');
      expect(result.blocks).toHaveLength(3);
      expect(mockPromptBuilder.buildPrompt).toHaveBeenCalledWith(userId, request);
      expect(mockAIClient.generateWorkout).toHaveBeenCalledWith('test-prompt');
    });

    it('should handle AI service errors gracefully', async () => {
      // Arrange
      const userId = 'test-user-123';
      const request = createValidRequest();
      
      mockAIClient.generateWorkout.mockRejectedValue(
        new Error('AI service unavailable')
      );

      // Act & Assert
      await expect(service.generateWorkout(userId, request))
        .rejects
        .toThrow(WorkoutGenerationError);
    });
  });
});
```

## Performance Standards

### Caching Strategy

```typescript
// ✅ Good: Layered caching with TTL
class CacheManager {
  private readonly memoryCache = new Map<string, CacheEntry>();
  private readonly redisCacheClient?: RedisClient;

  async get<T>(key: string): Promise<T | null> {
    // 1. Check memory cache first (fastest)
    const memoryResult = this.getFromMemory<T>(key);
    if (memoryResult) return memoryResult;

    // 2. Check Redis cache (fast)
    if (this.redisCacheClient) {
      const redisResult = await this.getFromRedis<T>(key);
      if (redisResult) {
        // Populate memory cache
        this.setInMemory(key, redisResult, 60_000); // 1 minute
        return redisResult;
      }
    }

    return null;
  }

  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    // Set in both caches
    this.setInMemory(key, value, Math.min(ttl, 300_000)); // Max 5 minutes in memory
    
    if (this.redisCacheClient) {
      await this.setInRedis(key, value, ttl);
    }
  }
}
```

This establishes a solid foundation for AI-agent optimized code. The standards emphasize clarity, consistency, and comprehensive documentation that makes it easy for AI agents to understand and work with the codebase effectively.
