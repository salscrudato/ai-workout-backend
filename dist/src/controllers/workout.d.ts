import { Request, Response } from 'express';
/**
 * Generates a personalized AI workout plan for the authenticated user
 *
 * This endpoint handles the complete workout generation pipeline:
 * 1. Validates user authentication and input parameters
 * 2. Builds personalized AI prompts based on user profile and history
 * 3. Calls OpenAI API for workout generation
 * 4. Applies advanced programming principles (sets, reps, intensity)
 * 5. Stores the workout plan in the database
 * 6. Returns the formatted workout to the client
 *
 * @route POST /v1/workouts/generate
 * @access Private (requires authentication)
 * @param req.body - Workout generation parameters (validated against GenerateWorkoutSchema)
 * @param req.user - Authenticated user information from auth middleware
 * @returns Generated workout plan with metadata
 *
 * @throws {401} When user is not authenticated
 * @throws {400} When input validation fails
 * @throws {503} When AI service is unavailable
 * @throws {500} When unexpected errors occur
 */
export declare const generate: (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: import("express").NextFunction) => void;
/**
 * Retrieves a specific workout plan by ID
 *
 * @route GET /v1/workouts/:workoutId
 * @access Private (requires authentication)
 * @param req.params.workoutId - Unique workout plan identifier
 * @returns Complete workout plan with metadata
 *
 * @throws {400} When workoutId format is invalid
 * @throws {404} When workout plan is not found
 * @throws {403} When user doesn't have access to the workout
 */
export declare const getWorkout: (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: import("express").NextFunction) => void;
export declare const listWorkouts: (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: import("express").NextFunction) => void;
export declare const completeWorkout: (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: import("express").NextFunction) => void;
export declare const generateQuickWorkout: (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: import("express").NextFunction) => void;
//# sourceMappingURL=workout.d.ts.map