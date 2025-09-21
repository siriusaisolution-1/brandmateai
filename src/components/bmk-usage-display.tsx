// src/components/bmk-usage-display.tsx
'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useFirestoreDocData } from 'reactfire';
import { doc } from 'firebase/firestore';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import type { User as AppUser } from '@/types/firestore';

const PLAN_QUOTAS: Record<string, number> = {
  free: 100,
  solo: 1000,
  pro: 3000,
  agency: 9000,
};

export function BmkUsageDisplay() {
  const { data: user } = useUser();
  const firestore = useFirestore();

  // ✅ Uvek pozovi hook; koristi placeholder UID kad nema user-a
  const uid = user?.uid ?? '__no_user__';
  const userRef = useMemo(() => doc(firestore, 'users', uid), [firestore, uid]);
  const { status, data } = useFirestoreDocData(userRef, { idField: 'id' });

  // Loading skeleton (ili kad je placeholder uid => data undefined)
  if (status === 'loading' || !user || !data) {
    return <div className="h-10 w-full animate-pulse rounded-md bg-gray-700" />;
  }

  const appUser = data as AppUser;
  const balance = appUser.bmkBalance ?? 0;
  const plan = appUser.subscriptionPlan ?? 'free';
  const totalQuota = PLAN_QUOTAS[plan] ?? 0;
  const pct = totalQuota > 0 ? Math.min(100, (balance / totalQuota) * 100) : 0;

  return (
    <div className="rounded-lg bg-gray-800 p-3">
      <div className="mb-1 flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs font-bold text-copy-primary">
          <Sparkles size={12} className="text-yellow-400" /> BMK Balance
        </span>
        <span className="text-xs text-copy-secondary">
          {balance.toFixed(2)} / {totalQuota.toLocaleString()}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-600">
        <div className="h-1.5 rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
      <Link href="/pricing" className="mt-2 block text-center text-xs text-indigo-400 hover:underline">
        Upgrade Plan or Top-up
      </Link>
    </div>
  );
}