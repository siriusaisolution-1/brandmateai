// src/components/firebase-providers.tsx
"use client";

import { ReactNode } from "react";
import { FirebaseAppProvider, AuthProvider, FirestoreProvider } from "reactfire";
import { app, auth, firestore } from "@/lib/firebase"; // proveri da exportuješ `app`, `auth`, `firestore`

type Props = { children: ReactNode };

export default function FirebaseProviders({ children }: Props) {
  return (
    <FirebaseAppProvider firebaseApp={app}>
      <AuthProvider sdk={auth}>
        <FirestoreProvider sdk={firestore}>
          {children}
        </FirestoreProvider>
      </AuthProvider>
    </FirebaseAppProvider>
  );
}