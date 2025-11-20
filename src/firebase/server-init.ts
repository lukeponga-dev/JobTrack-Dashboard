import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';

interface FirebaseAdminServices {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

export function getFirebaseAdmin(): FirebaseAdminServices {
  if (getApps().length > 0) {
    const app = getApp();
    return {
      app,
      auth: getAuth(app),
      firestore: getFirestore(app),
    };
  }

  const app = initializeApp({
    credential: undefined, // Let auto-discovery handle credentials
    projectId: firebaseConfig.projectId,
  });

  return {
    app,
    auth: getAuth(app),
    firestore: getFirestore(app),
  };
}
