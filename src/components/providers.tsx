"use client";

import type { ReactNode } from "react";
import { FirebaseProviders } from "@/lib/firebase";
import { ThemeProvider } from "@/components/theme-provider";

export function Providers({ children }: { children: ReactNode }) {
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
