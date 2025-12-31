'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, User, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

[span_0](start_span)// IMPORTANT: DO NOT MODIFY THIS FUNCTION[span_0](end_span)
export function initializeFirebase() {
  if (!getApps().length) {
    let firebaseApp;
    try {
      [span_1](start_span)// Attempt to initialize via Firebase App Hosting environment variables[span_1](end_span)
      firebaseApp = initializeApp();
    } catch (e) {
      if (process.env.NODE_ENV === "production") {
        [span_2](start_span)console.warn('Automatic initialization failed. Falling back to firebase config object.', e);[span_2](end_span)
      }
      [span_3](start_span)firebaseApp = initializeApp(firebaseConfig);[span_3](end_span)
    }
    [span_4](start_span)return getSdks(firebaseApp);[span_4](end_span)
  }
  [span_5](start_span)return getSdks(getApp());[span_5](end_span)
}

export function getSdks(firebaseApp: FirebaseApp) {
  const firestore = getFirestore(firebaseApp);
  [span_6](start_span)const auth = getAuth(firebaseApp);[span_6](end_span)
  return {
    firebaseApp,
    auth: auth,
    firestore: firestore
  [span_7](start_span)};[span_7](end_span)
}

[span_8](start_span)// التصديرات الشاملة من الملفات الأخرى[span_8](end_span)
export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';

/** * تنبيه: إذا استمر الخطأ في دوال معينة مثل useUser أو useFirestore، 
 * تأكد أن هذه الدوال معرفة داخل ملف ./provider.tsx باستخدام كلمة export const
 */
