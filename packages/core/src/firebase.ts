/**
 * Cross-platform Firebase initialization.
 *
 * Supports both:
 *  - Next.js: reads NEXT_PUBLIC_FIREBASE_* env vars
 *  - Expo: reads EXPO_PUBLIC_FIREBASE_* env vars
 *
 * No conditional imports — uses the same firebase JS SDK v11 on both platforms.
 */
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

function getEnv(key: string): string | undefined {
    // Expo (React Native)
    const expoKey = `EXPO_PUBLIC_${key}`;
    // Next.js
    const nextKey = `NEXT_PUBLIC_${key}`;

    return (
        (typeof process !== 'undefined' && process.env[expoKey]) ||
        (typeof process !== 'undefined' && process.env[nextKey]) ||
        undefined
    );
}

const firebaseConfig = {
    apiKey: getEnv('FIREBASE_API_KEY'),
    authDomain: getEnv('FIREBASE_AUTH_DOMAIN'),
    projectId: getEnv('FIREBASE_PROJECT_ID'),
    storageBucket: getEnv('FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: getEnv('FIREBASE_MESSAGING_SENDER_ID'),
    appId: getEnv('FIREBASE_APP_ID'),
};

function createFirebaseApp(): FirebaseApp | null {
    if (!firebaseConfig.apiKey) {
        // Config missing — safe for build-time environments
        console.warn('[firebase] Missing API key — Firebase not initialized.');
        return null;
    }
    return getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
}

const app = createFirebaseApp();

export const db: Firestore = app
    ? getFirestore(app)
    : (null as unknown as Firestore);

export const auth: Auth = app
    ? getAuth(app)
    : (null as unknown as Auth);

export const isFirebaseConfigured = app !== null;
