'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// IMPORTANT: SAFE FOR NEXT.JS + VERCEL
export function initializeFirebase() {
  // ⛔ امنع التنفيذ وقت build / server
  if (typeof window === 'undefined') {
    return undefined;
  }

  if (!getApps().length) {
    let firebaseApp: FirebaseApp;

    try {
      // Firebase App Hosting (لو موجود)
      firebaseApp = initializeApp();
    } catch (e) {
      firebaseApp = initializeApp(firebaseConfig);
    }

    return getSdks(firebaseApp);
  }

  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
  };
}
