import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';

import QueryProvider from '@/components/query-provider';
import { Toaster } from '@/components/ui/toaster';
import { isOwnerUser } from '@/lib/auth/owner';
import { FirebaseAuthError, requireServerAuthSession } from '@/lib/auth/verify-id-token';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  try {
    const session = await requireServerAuthSession();
    const isAdmin = session.claims.admin === true;
    if (!isAdmin && !isOwnerUser(session.claims)) {
      redirect('/dashboard');
    }
  } catch (error) {
    if (error instanceof FirebaseAuthError && error.status === 401) {
      redirect('/login');
    }

    throw error;
  }

  return (
    <QueryProvider>
      <div className="min-h-screen bg-background text-copy-primary">
        <main className="mx-auto w-full max-w-6xl px-6 py-8">{children}</main>
      </div>
      <Toaster />
    </QueryProvider>
  );
}
