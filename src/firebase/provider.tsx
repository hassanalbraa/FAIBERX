'use client';

import React, { createContext, useContext, useMemo } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

// تعريف الـ Context
const FirebaseContext = createContext<{
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
}>({
  firebaseApp: null,
  auth: null,
  firestore: null,
});

export function FirebaseProvider({ 
  children, 
  firebaseApp, 
  auth, 
  firestore 
}: { 
  children: React.ReactNode;
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}) {
  const value = useMemo(() => ({ firebaseApp, auth, firestore }), [firebaseApp, auth, firestore]);
  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}

// الدوال التي تستخدمها صفحة page.tsx
export const useFirestore = () => {
  const context = useContext(FirebaseContext);
  return context.firestore;
};

export const useMemoFirebase = (factory: () => any, deps: any[]) => {
  return useMemo(factory, deps);
};
