"use client";

import {
  FirebaseAppProvider,
  AuthProvider,
  FirestoreProvider,
} from "reactfire";
import { ThemeProvider } from "@/components/theme-provider";
import { firebaseConfig, auth, firestore } from "@/lib/firebase";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseAppProvider firebaseConfig={firebaseConfig}> {/* ⬅ овде је исправка */}
      <AuthProvider sdk={auth}>
        <FirestoreProvider sdk={firestore}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </FirestoreProvider>
      </AuthProvider>
    </FirebaseAppProvider>
  );
}