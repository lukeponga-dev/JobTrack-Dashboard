import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, connectAuthEmulator, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: ReturnType<typeof initializeApp> | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;


function initializeClientApp() {
    if (typeof window === 'undefined' || !firebaseConfig.apiKey) {
        return;
    }

    if (app) return; // Already initialized

    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();

    if (process.env.NEXT_PUBLIC_USE_EMULATORS === 'true' && process.env.NODE_ENV === 'development') {
        try {
            if (auth.emulatorConfig === null) {
                connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
            }
        } catch (error) {
            console.error("Error connecting to Auth emulator", error);
        }
        try {
            // Firestore throws if it's already connected, so we check an internal property.
            if (!(db as any)._isInitialized) {
                connectFirestoreEmulator(db, '127.0.0.1', 8080);
            }
        } catch(error) {
            console.error("Error connecting to Firestore emulator", error);
        }
    }
}

// Initialize on client-side
initializeClientApp();

// Getter functions to be used in components
export function getFirebaseApp() {
    if (!app) initializeClientApp();
    return app;
}

export function getFirebaseAuth() {
    if (!auth) initializeClientApp();
    return auth;
}

export function getFirestoreDb() {
    if (!db) initializeClientApp();
    return db;
}

export function getGoogleProvider() {
    if (!googleProvider) initializeClientApp();
    return googleProvider;
}

// Exporting for backwards compatibility if some files still use them directly
export { app, auth, db, googleProvider };
