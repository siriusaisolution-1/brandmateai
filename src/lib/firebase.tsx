"use client";

import type { ReactNode } from "react";
import {
  FirebaseAppProvider,
  AuthProvider,
  FirestoreProvider,
} from "reactfire";
import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signOut,
  type Auth,
} from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  type Firestore,
} from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getFunctions, type Functions } from "firebase/functions";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let firebaseApp: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let firestoreInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;
let functionsInstance: Functions | null = null;
let googleProvider: GoogleAuthProvider | null = null;
let facebookProvider: FacebookAuthProvider | null = null;

const shouldForceLongPolling =
  typeof window !== "undefined" && process.env.NEXT_PUBLIC_USE_LONG_POLLING === "1";

function ensureFirestore(app: FirebaseApp): Firestore {
  if (firestoreInstance) {
    return firestoreInstance;
  }

  try {
    firestoreInstance = initializeFirestore(app, {
      experimentalAutoDetectLongPolling: !shouldForceLongPolling,
      experimentalForceLongPolling: shouldForceLongPolling,
    });
  } catch {
    firestoreInstance = getFirestore(app);
  }

  return firestoreInstance;
}

export function getFirebaseApp(): FirebaseApp {
  if (firebaseApp) {
    return firebaseApp;
  }

  firebaseApp = getApps()[0] ?? initializeApp(firebaseConfig);
  return firebaseApp;
}

export function getFirebaseAuth(): Auth {
  if (authInstance) {
    return authInstance;
  }

  authInstance = getAuth(getFirebaseApp());
  return authInstance;
}

function getGoogleAuthProvider(): GoogleAuthProvider {
  if (googleProvider) {
    return googleProvider;
  }

  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: "select_account" });
  return googleProvider;
}

function getFacebookAuthProvider(): FacebookAuthProvider {
  if (facebookProvider) {
    return facebookProvider;
  }

  facebookProvider = new FacebookAuthProvider();
  facebookProvider.addScope("email");
  return facebookProvider;
}

export function getFirebaseFirestore(): Firestore {
  return ensureFirestore(getFirebaseApp());
}

export function getFirebaseStorage(): FirebaseStorage {
  if (storageInstance) {
    return storageInstance;
  }

  storageInstance = getStorage(getFirebaseApp());
  return storageInstance;
}

export function getFirebaseFunctions(): Functions {
  if (functionsInstance) {
    return functionsInstance;
  }

  functionsInstance = getFunctions(getFirebaseApp());
  return functionsInstance;
}

export function signInWithGoogle() {
  return signInWithPopup(getFirebaseAuth(), getGoogleAuthProvider());
}

export function signInWithFacebook() {
  return signInWithPopup(getFirebaseAuth(), getFacebookAuthProvider());
}

export function signOutApp() {
  return signOut(getFirebaseAuth());
}

export const app = getFirebaseApp();
export const auth = getFirebaseAuth();
export const firestore = getFirebaseFirestore();
export const storage = getFirebaseStorage();
export const functions = getFirebaseFunctions();

export function FirebaseProviders({ children }: { children: ReactNode }) {
  const appInstance = getFirebaseApp();
  const authSdk = getFirebaseAuth();
  const firestoreSdk = getFirebaseFirestore();

  return (
    <FirebaseAppProvider firebaseApp={appInstance}>
      <AuthProvider sdk={authSdk}>
        <FirestoreProvider sdk={firestoreSdk}>{children}</FirestoreProvider>
      </AuthProvider>
    </FirebaseAppProvider>
  );
}
