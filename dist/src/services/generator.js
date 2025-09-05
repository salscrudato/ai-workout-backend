"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWorkout = generateWorkout;
const openai_1 = require("../libs/openai");
const env_1 = require("../config/env");
const workoutOutput_1 = require("../schemas/workoutOutput");
const promptVersioning_1 = require("./promptVersioning");
function getOptimalModelParameters(options = {}) {
    // Base parameters
    let temperature = 0.2;
    let topP = 0.9;
    // Adjust based on workout complexity
    if (options.workoutType?.includes('conditioning') || options.workoutType?.includes('hiit')) {
        temperature = 0.3; // More creativity for varied cardio workouts
    }
    if (options.experience === 'advanced') {
        temperature = 0.25; // Slightly more variation for advanced programming
        topP = 0.85; // More focused responses
    }
    if (options.duration && options.duration > 60) {
        temperature = 0.15; // More structured for longer workouts
    }
    return { temperature, topP };
}
async function generateWorkout(promptData, options = {}) {
    try {
        const baseModelParams = getOptimalModelParameters(options);
        const modelParams = promptVersioning_1.promptVersioning.getModelParameters(promptData.variant, baseModelParams);
        const response = await openai_1.openai.chat.completions.create({
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
        });
        const text = response.choices[0]?.message?.content;
        if (!text) {
            throw Object.assign(new Error('No response from OpenAI'), { status: 502 });
        }
        let parsed;
        try {
            parsed = JSON.parse(text);
        }
        catch (parseError) {
            throw Object.assign(new Error('Model returned non-JSON output'), { status: 502, detail: text, parseError });
        }
        return parsed;
    }
    catch (error) {
        // Handle OpenAI API errors
        if (error.status) {
            throw error; // Re-throw our custom errors
        }
        console.error('OpenAI API Error:', error);
        throw Object.assign(new Error('Failed to generate workout plan'), { status: 503, originalError: error.message });
    }
}
//# sourceMappingURL=generator.js.map