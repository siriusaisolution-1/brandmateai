// src/app/(app)/notifications/page.tsx
'use client';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth, useFirestore, useFirestoreCollectionData } from 'reactfire';
import { collection, orderBy, query } from 'firebase/firestore';

type FirestoreTimestamp = { seconds: number; nanoseconds: number };
type Notif = {
  id: string;
  title?: string;
  summary?: string;
  message?: string;
  read?: boolean;
  createdAt?: FirestoreTimestamp | Date | number;
};

function toDateSafe(v?: Notif['createdAt']): Date | null {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof v === 'number') return new Date(v);
  if (typeof v === 'object' && 'seconds' in v && 'nanoseconds' in v) {
    return new Date(v.seconds * 1000);
  }
  return null;
}

export default function NotificationsPage() {
  const auth = useAuth();
  const user = auth.currentUser;
  const firestore = useFirestore();

  const q = user
    ? query(collection(firestore, 'users', user.uid, 'notifications'), orderBy('createdAt', 'desc'))
    : null;

  const { status, data } = q
    ? useFirestoreCollectionData(q, { idField: 'id' })
    : ({ status: 'success', data: [] as Notif[] } as const);

  const list = (data as unknown as Notif[]) ?? [];

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      <div className="space-y-3">
        {status === 'loading' && <div className="h-20 w-full animate-pulse rounded-lg bg-gray-800" />}
        {status === 'success' &&
          list.map((notif) => {
            const dt = toDateSafe(notif.createdAt)?.toLocaleString() ?? '';
            return (
              <Card
                key={notif.id}
                className={`bg-surface border-gray-700 hover:border-primary transition-colors ${
                  !notif.read ? 'border-primary' : ''
                }`}
              >
                <CardHeader>
                  <CardTitle>{notif.title ?? 'Notification'}</CardTitle>
                  <CardDescription>{notif.summary ?? notif.message ?? ''}</CardDescription>
                  <div className="text-xs text-muted-foreground mt-1">{dt}</div>
                </CardHeader>
              </Card>
            );
          })}
        {status === 'success' && list.length === 0 && (
          <div className="text-sm text-muted-foreground">No notifications yet.</div>
        )}
      </div>
    </div>
  );
}