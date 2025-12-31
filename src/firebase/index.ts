'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, User, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  // During Vercel build, VERCEL is '1' and CI is 'true'
  const isVercel = process.env.VERCEL === '1' && process.env.CI === 'true';

  if (getApps().length) {
    // If already initialized, return the SDKs with the already initialized App
    return getSdks(getApp());
  }
  
  let firebaseApp;
  
  // If it's a Vercel build, or if we are in a non-browser environment (like build process),
  // directly use the config to avoid the "no-options" error.
  if (isVercel || typeof window === 'undefined') {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    try {
      // For client-side execution in a browser that might be on Firebase Hosting,
      // attempt automatic initialization first.
      firebaseApp = initializeApp();
    } catch (e) {
      // Fallback for local development or other browser environments.
      if (process.env.NODE_ENV === 'production') {
          console.warn('Automatic initialization failed. Falling back to firebase config object.', e);
      }
      firebaseApp = initializeApp(firebaseConfig);
    }
  }

  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  const firestore = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);

  return {
    firebaseApp,
    auth: auth,
    firestore: firestore
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
