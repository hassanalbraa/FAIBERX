'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// دالة التهيئة الأساسية
export function initializeFirebase() {
  if (!getApps().length) {
    let firebaseApp;
    try {
      // محاولة التهيئة التلقائية لبيئة App Hosting
      firebaseApp = initializeApp();
    } catch (e) {
      // العودة للإعدادات اليدوية في حال الفشل
      firebaseApp = initializeApp(firebaseConfig);
    }
    return getSdks(firebaseApp);
  }
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  const firestore = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);
  return {
    firebaseApp,
    auth,
    firestore
  };
}

// تصديرات صريحة لضمان التعرف عليها في الـ Build
export * from './provider';
export * from './client-provider';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
