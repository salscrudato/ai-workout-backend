import 'dotenv/config';
import { z } from 'zod';
import * as functions from 'firebase-functions';

const Env = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().default(3000),
  OPENAI_API_KEY: z.string(),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  INTERNAL_API_KEY: z.string().optional(),

  // Firebase configuration - use GCLOUD_PROJECT in Firebase Functions
  FIREBASE_PROJECT_ID: z.string().optional(),
  GCLOUD_PROJECT: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_SERVICE_ACCOUNT_KEY: z.string().optional(), // JSON string or file path
});

// Get Firebase Functions config (if available)
let firebaseConfig: any = {};
try {
  firebaseConfig = functions.config();
} catch (error) {
  // functions.config() is not available in local development
  console.log('Firebase Functions config not available, using environment variables');
}

// Parse environment variables with Firebase Functions compatibility
const parsedEnv = Env.parse({
  ...process.env,
  // Support Firebase Functions config format
  OPENAI_API_KEY: process.env['OPENAI_API_KEY'] || firebaseConfig.openai?.api_key,
  OPENAI_MODEL: process.env['OPENAI_MODEL'] || firebaseConfig.openai?.model || 'gpt-4o-mini',
  INTERNAL_API_KEY: process.env['INTERNAL_API_KEY'] || firebaseConfig.internal?.api_key,
  // Use GCLOUD_PROJECT as FIREBASE_PROJECT_ID in Firebase Functions
  FIREBASE_PROJECT_ID: process.env['FIREBASE_PROJECT_ID'] || process.env['GCLOUD_PROJECT'],
});

export const env = {
  ...parsedEnv,
  FIREBASE_PROJECT_ID: parsedEnv.FIREBASE_PROJECT_ID || parsedEnv.GCLOUD_PROJECT || 'ai-workout-backend-2024',
};
