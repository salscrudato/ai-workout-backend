"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const tslib_1 = require("tslib");
if (process.env['NODE_ENV'] !== 'production') {
    require('dotenv/config');
}
const zod_1 = require("zod");
const functions = tslib_1.__importStar(require("firebase-functions"));
const Env = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.coerce.number().int().min(1).max(65535).default(3000),
    OPENAI_API_KEY: zod_1.z.string().min(1, 'OpenAI API key is required'),
    OPENAI_MODEL: zod_1.z.string().default('gpt-4o-mini'),
    INTERNAL_API_KEY: zod_1.z.string().optional(),
    FIREBASE_PROJECT_ID: zod_1.z.string().optional(),
    GCLOUD_PROJECT: zod_1.z.string().optional(),
    FIREBASE_PRIVATE_KEY: zod_1.z.string().optional(),
    FIREBASE_CLIENT_EMAIL: zod_1.z.string().email().optional(),
    FIREBASE_SERVICE_ACCOUNT_KEY: zod_1.z.string().optional(),
});
let firebaseConfig = {};
try {
    firebaseConfig = functions.config();
}
catch (error) {
    if (process.env['NODE_ENV'] === 'development') {
        console.log('Firebase Functions config not available, using environment variables');
    }
}
const parsedEnv = Env.parse({
    ...process.env,
    OPENAI_API_KEY: process.env['OPENAI_API_KEY'] || firebaseConfig['openai']?.['api_key'],
    OPENAI_MODEL: process.env['OPENAI_MODEL'] || firebaseConfig['openai']?.['model'] || 'gpt-4o-mini',
    INTERNAL_API_KEY: process.env['INTERNAL_API_KEY'] || firebaseConfig['internal']?.['api_key'],
    FIREBASE_PROJECT_ID: process.env['FIREBASE_PROJECT_ID'] || process.env['GCLOUD_PROJECT'],
});
if (!parsedEnv.OPENAI_API_KEY) {
    throw new Error('Missing required environment variable: OPENAI_API_KEY');
}
exports.env = {
    ...parsedEnv,
    FIREBASE_PROJECT_ID: parsedEnv.FIREBASE_PROJECT_ID || parsedEnv.GCLOUD_PROJECT || 'ai-workout-backend-2024',
};
//# sourceMappingURL=env.js.map