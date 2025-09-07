// src/components/firebase-providers.tsx
"use client";

import React from "react";
import {
  FirebaseAppProvider,
  AuthProvider,
  FirestoreProvider,
} from "reactfire";

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  initializeFirestore,
  getFirestore,
  type Firestore,
} from "firebase/firestore";

import { firebaseConfig } from "@/lib/firebase";

// --- Singleton init ---
const app: FirebaseApp = getApps()[0] ?? initializeApp(firebaseConfig);
const auth = getAuth(app);

// Dev-only long polling switch (pomaže iza proksija u Firebase Studio okruženju)
const useForceLongPolling =
  typeof window !== "undefined" &&
  process.env.NEXT_PUBLIC_USE_LONG_POLLING === "1";

let db: Firestore;
try {
  db = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: !useForceLongPolling,
    experimentalForceLongPolling: useForceLongPolling,
  });
} catch {
  db = getFirestore(app);
}

// (Opcionalno) eksporti za direktnu upotrebu
export { app, auth, db as firestore };

export function FirebaseProviders({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseAppProvider firebaseApp={app}>
      <AuthProvider sdk={auth}>
        <FirestoreProvider sdk={db}>{children}</FirestoreProvider>
      </AuthProvider>
    </FirebaseAppProvider>
  );
}