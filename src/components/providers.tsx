"use client";

import React from "react";
import { FirebaseProviders } from "@/components/firebase-providers";
import { ThemeProvider } from "@/components/theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseProviders>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </FirebaseProviders>
  );
}
