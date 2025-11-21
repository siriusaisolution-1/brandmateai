'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { useFirestore, useFirestoreCollectionData } from 'reactfire';
import { collection, query, where } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const statusVariant: Record<string, string> = {
  completed: 'success',
  processing: 'secondary',
  queued: 'outline',
  needs_revision: 'destructive',
};

export default function BrandRequestsPage() {
  const params = useParams<{ brandId: string }>();
  const brandId = params?.brandId as string;
  const firestore = useFirestore();
  const col = useMemo(() => collection(firestore, 'contentRequests'), [firestore]);
  const q = useMemo(() => query(col, where('brandId', '==', brandId)), [col, brandId]);

  const { status, data, error } = useFirestoreCollectionData(q, { idField: 'id' });
  const requests = (data as Array<{ id: string; title?: string; status?: string; summary?: string }> | undefined) ?? [];

  const resolvedStatus = status === 'loading' ? 'loading' : error ? 'error' : 'success';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Content requests</h1>
        <p className="text-sm text-muted-foreground">Track generation requests for this brand.</p>
      </div>

      {resolvedStatus === 'loading' && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-20 rounded-md bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {resolvedStatus === 'error' && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load requests. Please try again later.
        </div>
      )}

      {resolvedStatus === 'success' && requests.length === 0 && (
        <Card className="bg-surface border-muted">
          <CardContent className="py-10 text-center space-y-2">
            <p className="text-lg font-semibold">No content requests yet</p>
            <p className="text-sm text-muted-foreground">Use the chat or generation tools to create your first brief.</p>
          </CardContent>
        </Card>
      )}

      {resolvedStatus === 'success' && requests.length > 0 && (
        <div className="space-y-3">
          {requests.map((req) => {
            const statusKey = (req.status ?? 'queued').toLowerCase();
            return (
              <Card key={req.id} className="bg-surface border-muted">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base">{req.title ?? 'Untitled request'}</CardTitle>
                  <Badge variant={(statusVariant[statusKey] as any) ?? 'outline'} className="uppercase text-[10px]">
                    {statusKey}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{req.summary ?? 'Awaiting generation steps...'}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
