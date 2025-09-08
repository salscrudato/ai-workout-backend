/**
 * Configuration options for AI workout generation
 */
interface GenerationOptions {
    readonly workoutType?: string;
    readonly experience?: string;
    readonly duration?: number;
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
export declare function generateWorkout(promptData: {
    prompt: string;
    variant: any;
}, options?: GenerationOptions): Promise<any>;
export {};
//# sourceMappingURL=generator.d.ts.map