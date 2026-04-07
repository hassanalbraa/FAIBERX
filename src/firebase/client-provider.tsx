'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from './provider';
import { firebaseConfig } from './config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Initialize Firebase directly here to avoid circular imports
function initializeFirebaseClient(): { firebaseApp: FirebaseApp; auth: Auth; firestore: Firestore } {
  let firebaseApp: FirebaseApp;
  let auth: Auth;
  let firestore: Firestore;

  if (typeof window !== 'undefined' && getApps().length > 0) {
    firebaseApp = getApp();
  } else if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApp();
  }
  
  auth = getAuth(firebaseApp);
  firestore = getFirestore(firebaseApp);

  return { firebaseApp, auth, firestore };
}

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const services = useMemo(() => initializeFirebaseClient(), []);

  return (
    <FirebaseProvider
      firebaseApp={services.firebaseApp}
      auth={services.auth}
      firestore={services.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
