'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export function initializeFirebase() {
  let firebaseApp: FirebaseApp;
  
  if (!getApps().length) {
    try {
      firebaseApp = initializeApp(); 
    } catch (e) {
      firebaseApp = initializeApp(firebaseConfig);
    }
  } else {
    firebaseApp = getApp();
  }
  
  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  const firestore = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);
  return { firebaseApp, auth, firestore };
}

// تصديرات هامة جداً لعمل الصفحات
export * from './provider';
export * from './client-provider';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
