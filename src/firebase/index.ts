'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * تهيئة Firebase بطريقة تدعم Firebase App Hosting وبيئات التطوير المختلفة.
 *
 */
export function initializeFirebase() {
  if (!getApps().length) {
    let firebaseApp;
    try {
      // محاولة التهيئة التلقائية عبر متغيرات البيئة في Firebase App Hosting
      firebaseApp = initializeApp();
    } catch (e) {
      // في حال الفشل (غالباً في بيئة التطوير)، يتم استخدام إعدادات Config يدوياً
      if (process.env.NODE_ENV === "production") {
        console.warn('Automatic initialization failed. Falling back to firebase config object.', e);
      }
      firebaseApp = initializeApp(firebaseConfig);
    }
    return getSdks(firebaseApp);
  }
  
  // إذا كانت التهيئة موجودة مسبقاً، نرجع الـ SDKs الخاصة بها
  return getSdks(getApp());
}

/**
 * دالة لاستخراج الخدمات الأساسية من تطبيق Firebase
 *
 */
export function getSdks(firebaseApp: FirebaseApp) {
  const firestore = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);
  return {
    firebaseApp,
    auth: auth,
    firestore: firestore
  };
}

/** * تصدير كافة الـ Hooks والمكونات لضمان وصول صفحة Home وبقية التطبيق إليها
 *
 */
export * from './provider';          // يحتوي على useUser, useAuth, useFirestore, useMemoFirebase
export * from './client-provider';   // المكون الذي يغلف التطبيق بالـ Provider
export { useCollection } from './firestore/use-collection'; //
export { useDoc } from './firestore/use-doc';               //
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
