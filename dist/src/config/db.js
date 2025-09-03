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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeFirebase = initializeFirebase;
exports.getFirestore = getFirestore;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const env_1 = require("./env");
let db;
async function initializeFirebase() {
    try {
        if (firebase_admin_1.default.apps.length === 0) {
            // Check if running in Firebase Functions (has GCLOUD_PROJECT)
            const isFirebaseFunctions = !!process.env.GCLOUD_PROJECT;
            if (isFirebaseFunctions) {
                // Use default credentials in Firebase Functions
                firebase_admin_1.default.initializeApp({
                    projectId: env_1.env.FIREBASE_PROJECT_ID,
                });
                console.log('Firebase Admin initialized with default credentials (Firebase Functions)');
            }
            else {
                // Use service account for local development
                let serviceAccount;
                // Try to parse service account from environment variables
                if (env_1.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
                    try {
                        // If it's a JSON string
                        serviceAccount = JSON.parse(env_1.env.FIREBASE_SERVICE_ACCOUNT_KEY);
                    }
                    catch {
                        // If it's a file path
                        const fs = await Promise.resolve().then(() => __importStar(require('fs')));
                        const serviceAccountJson = fs.readFileSync(env_1.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'utf8');
                        serviceAccount = JSON.parse(serviceAccountJson);
                    }
                }
                else if (env_1.env.FIREBASE_PRIVATE_KEY && env_1.env.FIREBASE_CLIENT_EMAIL) {
                    // Use individual environment variables
                    serviceAccount = {
                        projectId: env_1.env.FIREBASE_PROJECT_ID,
                        privateKey: env_1.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                        clientEmail: env_1.env.FIREBASE_CLIENT_EMAIL,
                    };
                }
                else {
                    throw new Error('Firebase credentials not properly configured');
                }
                firebase_admin_1.default.initializeApp({
                    credential: firebase_admin_1.default.credential.cert(serviceAccount),
                    projectId: env_1.env.FIREBASE_PROJECT_ID,
                });
                console.log('Firebase Admin initialized with service account (local development)');
            }
        }
        db = firebase_admin_1.default.firestore();
        // Configure Firestore settings
        db.settings({
            ignoreUndefinedProperties: true,
        });
        console.log('Firestore connected successfully');
        return db;
    }
    catch (error) {
        console.error('Failed to initialize Firebase:', error);
        throw error;
    }
}
function getFirestore() {
    if (!db) {
        throw new Error('Firestore not initialized. Call initializeFirebase() first.');
    }
    return db;
}
// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Closing Firebase connection...');
    process.exit(0);
});
//# sourceMappingURL=db.js.map