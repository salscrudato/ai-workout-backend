"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeFirebase = initializeFirebase;
exports.getFirestore = getFirestore;
exports.isFirebaseInitialized = isFirebaseInitialized;
const tslib_1 = require("tslib");
const firebase_admin_1 = tslib_1.__importDefault(require("firebase-admin"));
const env_1 = require("./env");
const isProd = process.env['NODE_ENV'] === 'production';
let db;
async function initializeFirebase() {
    try {
        if (firebase_admin_1.default.apps.length === 0) {
            const isFirebaseFunctions = !!process.env['GCLOUD_PROJECT'];
            if (isFirebaseFunctions) {
                firebase_admin_1.default.initializeApp({
                    projectId: env_1.env.FIREBASE_PROJECT_ID,
                });
                if (!isProd) {
                    console.log('Firebase Admin initialized with default credentials (Firebase Functions)');
                }
            }
            else {
                let serviceAccount;
                if (env_1.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
                    try {
                        serviceAccount = JSON.parse(env_1.env.FIREBASE_SERVICE_ACCOUNT_KEY);
                    }
                    catch {
                        const fs = await Promise.resolve().then(() => tslib_1.__importStar(require('fs')));
                        const serviceAccountJson = fs.readFileSync(env_1.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'utf8');
                        serviceAccount = JSON.parse(serviceAccountJson);
                    }
                }
                else if (env_1.env.FIREBASE_PRIVATE_KEY && env_1.env.FIREBASE_CLIENT_EMAIL) {
                    serviceAccount = {
                        projectId: env_1.env.FIREBASE_PROJECT_ID,
                        privateKey: env_1.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                        clientEmail: env_1.env.FIREBASE_CLIENT_EMAIL,
                    };
                }
                else {
                    throw new Error('Firebase Admin credentials missing. Set FIREBASE_SERVICE_ACCOUNT_KEY (JSON or path) or FIREBASE_PRIVATE_KEY and FIREBASE_CLIENT_EMAIL.');
                }
                firebase_admin_1.default.initializeApp({
                    credential: firebase_admin_1.default.credential.cert(serviceAccount),
                    projectId: env_1.env.FIREBASE_PROJECT_ID,
                });
                if (!isProd) {
                    console.log('Firebase Admin initialized with service account (local development)');
                }
            }
        }
        db = firebase_admin_1.default.firestore();
        db.settings({
            ignoreUndefinedProperties: true,
            preferRest: false,
            maxIdleChannels: 1,
            keepAliveTime: 30000,
        });
        if (!isProd) {
            console.log('Firestore connected successfully with optimized settings');
        }
        return db;
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (message.toLowerCase().includes('credential')) {
            console.error('Firebase initialization failed: Invalid or missing credentials');
            console.error('Please check FIREBASE_SERVICE_ACCOUNT_KEY or individual Firebase env vars');
        }
        else if (message.toLowerCase().includes('project')) {
            console.error('Firebase initialization failed: Invalid project configuration');
            console.error('Please check FIREBASE_PROJECT_ID or GCLOUD_PROJECT');
        }
        else {
            console.error('Firebase initialization failed:', error);
        }
        throw error;
    }
}
function getFirestore() {
    if (!db) {
        throw new Error('Firestore not initialized. Call initializeFirebase() first.');
    }
    return db;
}
function isFirebaseInitialized() {
    return firebase_admin_1.default.apps.length > 0 && !!db;
}
process.on('SIGINT', async () => {
    if (!isProd) {
        console.log('Closing Firebase connection...');
    }
    process.exit(0);
});
//# sourceMappingURL=db.js.map