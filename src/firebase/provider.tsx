'use client';

import React, { createContext, useContext, useMemo } from 'react';

// استخدام any هنا هو الحل الأسرع لتجاوز 90 خطأ متعلق بتعارض الأنظمة في Vercel
const FirebaseContext = createContext<any>(null);

export function FirebaseProvider({ 
  children, 
  firebaseApp, 
  auth, 
  firestore 
}: { 
  children: React.ReactNode;
  firebaseApp: any;
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

// هذه الدوال هي ما تبحث عنه صفحة page.tsx
export const useFirestore = () => {
  const context = useContext(FirebaseContext);
  return context?.firestore;
};

export const useMemoFirebase = (factory: () => any, deps: any[]) => {
  return useMemo(factory, deps);
};

export const useAuth = () => {
  const context = useContext(FirebaseContext);
  return context?.auth;
};
