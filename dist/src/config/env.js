"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("dotenv/config");
const zod_1 = require("zod");
const Env = zod_1.z.object({
    NODE_ENV: zod_1.z.string().default('development'),
    PORT: zod_1.z.coerce.number().default(3000),
    OPENAI_API_KEY: zod_1.z.string(),
    OPENAI_MODEL: zod_1.z.string().default('gpt-4o-mini'),
    INTERNAL_API_KEY: zod_1.z.string().optional(),
    // Firebase configuration - use GCLOUD_PROJECT in Firebase Functions
    FIREBASE_PROJECT_ID: zod_1.z.string().optional(),
    GCLOUD_PROJECT: zod_1.z.string().optional(),
    FIREBASE_PRIVATE_KEY: zod_1.z.string().optional(),
    FIREBASE_CLIENT_EMAIL: zod_1.z.string().optional(),
    FIREBASE_SERVICE_ACCOUNT_KEY: zod_1.z.string().optional(), // JSON string or file path
});
// Parse environment variables with Firebase Functions compatibility
const parsedEnv = Env.parse({
    ...process.env,
    // Use GCLOUD_PROJECT as FIREBASE_PROJECT_ID in Firebase Functions
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT,
});
exports.env = {
    ...parsedEnv,
    FIREBASE_PROJECT_ID: parsedEnv.FIREBASE_PROJECT_ID || parsedEnv.GCLOUD_PROJECT || 'ai-workout-backend-2024',
};
//# sourceMappingURL=env.js.map