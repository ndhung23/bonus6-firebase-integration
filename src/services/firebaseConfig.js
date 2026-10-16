import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Đọc cấu hình Firebase trực tiếp từ biến môi trường (.env)
export const firebaseConfig = {
  apiKey: (process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '').trim(),
  authDomain: (process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '').trim(),
  projectId: (process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '').trim(),
  storageBucket: (process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '').trim(),
  messagingSenderId: (
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || ''
  ).trim(),
  appId: (process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '').trim(),
};

export const vapidKey = (
  process.env.EXPO_PUBLIC_FIREBASE_VAPID_KEY || ''
).trim();

export const firebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const firebaseAuth = getAuth(firebaseApp);
export const firebaseDb = getFirestore(firebaseApp);
