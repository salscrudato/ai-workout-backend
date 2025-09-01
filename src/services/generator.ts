import { openai } from '../libs/openai';
import { env } from '../config/env';
import { WorkoutPlanJsonSchema } from '../schemas/workoutOutput';

export async function generateWorkout(prompt: string) {
  try {
    const response = await openai.chat.completions.create({
      model: env.OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an expert fitness trainer. Generate workout plans as valid JSON matching the provided schema.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'workout_plan',
          schema: WorkoutPlanJsonSchema,
          strict: true
        }
      }
    });

    const text = response.choices[0]?.message?.content;
    if (!text) {
      throw Object.assign(new Error('No response from OpenAI'), { status: 502 });
    }

    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch (parseError) {
      throw Object.assign(
        new Error('Model returned non-JSON output'),
        { status: 502, detail: text, parseError }
      );
    }

    return parsed;
  } catch (error: any) {
    // Handle OpenAI API errors
    if (error.status) {
      throw error; // Re-throw our custom errors
    }

    console.error('OpenAI API Error:', error);
    throw Object.assign(
      new Error('Failed to generate workout plan'),
      { status: 503, originalError: error.message }
    );
  }
}