import { Inter as FontSans } from "next/font/google"
import "@/app/globals.css"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { FirebaseAppProvider, AuthProvider, FirestoreProvider } from "reactfire"
import { firebaseConfig, auth, firestore } from "@/lib/firebase" // Ensure auth and firestore are exported from here

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata = {
  title: "BrandMate AI",
  description: "Your AI Marketing Co-pilot",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        <FirebaseAppProvider firebaseConfig={firebaseConfig}>
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
      </body>
    </html>
  )
}
