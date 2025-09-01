import 'dotenv/config';
import { z } from 'zod';
const Env = z.object({
    NODE_ENV: z.string().default('development'),
    PORT: z.coerce.number().default(3000),
    OPENAI_API_KEY: z.string(),
    OPENAI_MODEL: z.string().default('gpt-4o-mini'),
    INTERNAL_API_KEY: z.string().optional(),
    // Firebase configuration
    FIREBASE_PROJECT_ID: z.string(),
    FIREBASE_PRIVATE_KEY: z.string().optional(),
    FIREBASE_CLIENT_EMAIL: z.string().optional(),
    FIREBASE_SERVICE_ACCOUNT_KEY: z.string().optional(), // JSON string or file path
});
export const env = Env.parse(process.env);
//# sourceMappingURL=env.js.map