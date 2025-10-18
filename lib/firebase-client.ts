// /lib/firebase-client.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore/lite";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // optional
};

// Singleton app instance
export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const firestore = getFirestore(firebaseApp);

// Analytics can only run in browser; use a promise to avoid SSR crashes
export const analyticsPromise: Promise<Analytics | null> = (async () => {
  if (typeof window === "undefined") return null;
  const supported = await isSupported().catch(() => false);
  return supported ? getAnalytics(firebaseApp) : null;
})();