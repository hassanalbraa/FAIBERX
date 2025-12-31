'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from './provider'; // استيراد مباشر لتجنب التكرار
import { initializeFirebase } from './index';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  // تهيئة الخدمات لمرة واحدة فقط عند تشغيل التطبيق
  const services = useMemo(() => initializeFirebase(), []);

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
