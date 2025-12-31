'use client';

import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { onAuthStateChanged, User, Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';

const FirebaseContext = createContext<any>(null);

export function FirebaseProvider({ children, firebaseApp, auth, firestore }: any) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // مراقبة حالة تسجيل دخول المستخدم
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  const value = useMemo(() => ({ 
    firebaseApp, 
    auth, 
    firestore, 
    user, 
    loading 
  }), [firebaseApp, auth, firestore, user, loading]);

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}

// الدوال المطلوبة التي تظهر في سجل الخطأ
export const useAuth = () => {
  const context = useContext(FirebaseContext);
  return context?.auth;
};

export const useUser = () => {
  const context = useContext(FirebaseContext);
  return {
    user: context?.user,
    isLoading: context?.loading
  };
};

export const useFirestore = () => {
  const context = useContext(FirebaseContext);
  return context?.firestore;
};

export const useMemoFirebase = (factory: () => any, deps: any[]) => {
  return useMemo(factory, deps);
};
