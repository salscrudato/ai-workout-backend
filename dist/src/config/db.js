import admin from 'firebase-admin';
import { env } from './env';
let db;
export async function initializeFirebase() {
    try {
        if (admin.apps.length === 0) {
            let serviceAccount;
            // Try to parse service account from environment variables
            if (env.FIREBASE_SERVICE_ACCOUNT_KEY) {
                try {
                    // If it's a JSON string
                    serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_KEY);
                }
                catch {
                    // If it's a file path
                    const fs = await import('fs');
                    const serviceAccountJson = fs.readFileSync(env.FIREBASE_SERVICE_ACCOUNT_KEY, 'utf8');
                    serviceAccount = JSON.parse(serviceAccountJson);
                }
            }
            else if (env.FIREBASE_PRIVATE_KEY && env.FIREBASE_CLIENT_EMAIL) {
                // Use individual environment variables
                serviceAccount = {
                    projectId: env.FIREBASE_PROJECT_ID,
                    privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                    clientEmail: env.FIREBASE_CLIENT_EMAIL,
                };
            }
            else {
                throw new Error('Firebase credentials not properly configured');
            }
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: env.FIREBASE_PROJECT_ID,
            });
            console.log('Firebase Admin initialized successfully');
        }
        db = admin.firestore();
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
export function getFirestore() {
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