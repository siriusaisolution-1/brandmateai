// src/app/(app)/notifications/page.tsx
'use client';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth, useFirestore, useFirestoreCollectionData } from 'reactfire';
import { collection, orderBy, query } from 'firebase/firestore';
import { useMemo } from 'react';

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

  const fallbackQuery = useMemo(
    () => query(collection(firestore, '__noop__')),
    [firestore]
  );

  const notificationsQuery = useMemo(() => {
    if (!user) {
      return fallbackQuery;
    }
    return query(
      collection(firestore, 'users', user.uid, 'notifications'),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, user, fallbackQuery]);

  const { status, data } = useFirestoreCollectionData(notificationsQuery, {
    idField: 'id',
  });

  const list = (data as Notif[]) ?? [];
  const isAuthenticated = Boolean(user);

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      <div className="space-y-3">
        {status === 'loading' && <div className="h-20 w-full animate-pulse rounded-lg bg-gray-800" />}
        {status === 'success' && isAuthenticated &&
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
        {status === 'success' && isAuthenticated && list.length === 0 && (
          <div className="text-sm text-muted-foreground">No notifications yet.</div>
        )}
        {!isAuthenticated && (
          <div className="text-sm text-muted-foreground">Sign in to view notifications.</div>
        )}
      </div>
    </div>
  );
}