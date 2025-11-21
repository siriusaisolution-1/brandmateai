// src/app/(app)/layout.tsx
import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";
import { CommandPalette } from "@/components/command-palette";
import { MasterAiChat } from "@/components/master-ai-chat";
import QueryProvider from "@/components/query-provider";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseAuthError, requireServerAuthSession } from "@/lib/auth/verify-id-token";
import { getBuildInfo } from "@/lib/runtime/build-info";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let userId: string;
  try {
    const session = await requireServerAuthSession();
    const uid = session.claims.uid ?? (typeof session.claims.sub === "string" ? session.claims.sub : null);
    if (!uid) {
      redirect("/login");
    }
    userId = uid;
  } catch (error) {
    if (error instanceof FirebaseAuthError && error.status === 401) {
      redirect("/login");
    }
    throw error;
  }

  const buildInfo = getBuildInfo();

  return (
    <QueryProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <AppSidebar />
        <div className="flex flex-col">
          <AppTopbar />
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            {children}
          </main>
          <footer className="border-t bg-muted/40 px-4 py-3 text-sm text-muted-foreground lg:px-6">
            BrandMate v3 – build {buildInfo.label}
          </footer>
        </div>
      </div>

      <CommandPalette userId={userId} />
      <MasterAiChat />
      <Toaster />
    </QueryProvider>
  );
}
