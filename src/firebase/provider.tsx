'use client';

import React, { createContext, useContext, useMemo } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

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
  firebaseApp: any; // استخدم any مؤقتاً لتجاوز تعارض الإصدارات في الـ Build
  auth: any;
  firestore: any;
}) {
  const value = useMemo(() => ({ firebaseApp, auth, firestore }), [firebaseApp, auth, firestore]);
  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirestore = () => useContext(FirebaseContext).firestore;
export const useMemoFirebase = (factory: () => any, deps: any[]) => useMemo(factory, deps);
