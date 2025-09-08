"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("dotenv/config");
const zod_1 = require("zod");
const functions = __importStar(require("firebase-functions"));
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
// Get Firebase Functions config (if available)
let firebaseConfig = {};
try {
    firebaseConfig = functions.config();
}
catch (error) {
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
exports.env = {
    ...parsedEnv,
    FIREBASE_PROJECT_ID: parsedEnv.FIREBASE_PROJECT_ID || parsedEnv.GCLOUD_PROJECT || 'ai-workout-backend-2024',
};
//# sourceMappingURL=env.js.map