import admin from 'firebase-admin';
import { env } from './env';

let db: admin.firestore.Firestore;

export async function initializeFirebase(): Promise<admin.firestore.Firestore> {
  try {
    if (admin.apps.length === 0) {
      // Check if running in Firebase Functions (has GCLOUD_PROJECT)
      const isFirebaseFunctions = !!process.env.GCLOUD_PROJECT;

      if (isFirebaseFunctions) {
        // Use default credentials in Firebase Functions
        admin.initializeApp({
          projectId: env.FIREBASE_PROJECT_ID,
        });
        console.log('Firebase Admin initialized with default credentials (Firebase Functions)');
      } else {
        // Use service account for local development
        let serviceAccount: admin.ServiceAccount;

        // Try to parse service account from environment variables
        if (env.FIREBASE_SERVICE_ACCOUNT_KEY) {
          try {
            // If it's a JSON string
            serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_KEY);
          } catch {
            // If it's a file path
            const fs = await import('fs');
            const serviceAccountJson = fs.readFileSync(env.FIREBASE_SERVICE_ACCOUNT_KEY, 'utf8');
            serviceAccount = JSON.parse(serviceAccountJson);
          }
        } else if (env.FIREBASE_PRIVATE_KEY && env.FIREBASE_CLIENT_EMAIL) {
          // Use individual environment variables
          serviceAccount = {
            projectId: env.FIREBASE_PROJECT_ID,
            privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            clientEmail: env.FIREBASE_CLIENT_EMAIL,
          };
        } else {
          throw new Error('Firebase credentials not properly configured');
        }

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: env.FIREBASE_PROJECT_ID,
        });
        console.log('Firebase Admin initialized with service account (local development)');
      }
    }

    db = admin.firestore();

    // Configure Firestore settings
    db.settings({
      ignoreUndefinedProperties: true,
    });

    console.log('Firestore connected successfully');
    return db;
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    throw error;
  }
}

export function getFirestore(): admin.firestore.Firestore {
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