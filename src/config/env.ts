// Load environment variables in non-production environments
if (process.env['NODE_ENV'] !== 'production') {
  require('dotenv/config');
}

import { z } from 'zod';
import * as functions from 'firebase-functions';

/**
 * Environment variable schema with validation and defaults
 * Optimized for both local development and Firebase Functions
 */
const Env = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  OPENAI_API_KEY: z.string().min(1, 'OpenAI API key is required'),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  INTERNAL_API_KEY: z.string().optional(),

  // Firebase configuration - optimized for Functions environment
  FIREBASE_PROJECT_ID: z.string().optional(),
  GCLOUD_PROJECT: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().email().optional(),
  FIREBASE_SERVICE_ACCOUNT_KEY: z.string().optional(),
});

// Get Firebase Functions config (if available) - legacy support
let firebaseConfig: Record<string, any> = {};
try {
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  firebaseConfig = functions.config();
} catch (error) {
  // functions.config() is not available in local development
  if (process.env['NODE_ENV'] === 'development') {
    console.log('Firebase Functions config not available, using environment variables');
  }
}

// Parse environment variables with Firebase Functions compatibility
const parsedEnv = Env.parse({
  ...process.env,
  // Support Firebase Functions config format (legacy)
  OPENAI_API_KEY: process.env['OPENAI_API_KEY'] || firebaseConfig['openai']?.['api_key'],
  OPENAI_MODEL: process.env['OPENAI_MODEL'] || firebaseConfig['openai']?.['model'] || 'gpt-4o-mini',
  INTERNAL_API_KEY: process.env['INTERNAL_API_KEY'] || firebaseConfig['internal']?.['api_key'],
  // Use GCLOUD_PROJECT as FIREBASE_PROJECT_ID in Firebase Functions
  FIREBASE_PROJECT_ID: process.env['FIREBASE_PROJECT_ID'] || process.env['GCLOUD_PROJECT'],
});

if (!parsedEnv.OPENAI_API_KEY) {
  throw new Error('Missing required environment variable: OPENAI_API_KEY');
}

export const env = {
  ...parsedEnv,
  FIREBASE_PROJECT_ID: parsedEnv.FIREBASE_PROJECT_ID || parsedEnv.GCLOUD_PROJECT || 'ai-workout-backend-2024',
};
