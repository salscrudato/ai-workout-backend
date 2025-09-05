interface GenerationOptions {
    workoutType?: string;
    experience?: string;
    duration?: number;
}
export declare function generateWorkout(promptData: {
    prompt: string;
    variant: any;
}, options?: GenerationOptions): Promise<any>;
export {};
//# sourceMappingURL=generator.d.ts.map