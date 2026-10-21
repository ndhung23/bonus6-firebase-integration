import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Khởi tạo Auth với AsyncStorage để lưu trữ phiên đăng nhập bền vững trên thiết bị di động
let auth;
if (Platform.OS !== 'web' && typeof getReactNativePersistence === 'function') {
  try {
    auth = initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (_) {
    auth = getAuth(firebaseApp);
  }
} else {
  try {
    auth = getAuth(firebaseApp);
  } catch (_) {
    auth = getAuth(firebaseApp);
  }
}

export const firebaseAuth = auth;
export const firebaseDb = getFirestore(firebaseApp);
