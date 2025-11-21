'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { collection, limit, orderBy, query, where } from 'firebase/firestore';
import { useFirestore, useFirestoreCollectionData } from 'reactfire';
import { captureException } from '@sentry/nextjs';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type ContentRequest = {
  id: string;
  prompt?: string;
  status?: string;
  createdAt?: { seconds: number; nanoseconds: number } | number | string;
};

function formatTimestamp(value: ContentRequest['createdAt']) {
  if (!value) return '—';
  if (typeof value === 'number') {
    return new Date(value).toLocaleString();
  }
  if (typeof value === 'string') {
    return new Date(value).toLocaleString();
  }
  if (typeof value === 'object' && 'seconds' in value) {
    return new Date(value.seconds * 1000).toLocaleString();
  }
  return '—';
}

function ChatSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="h-24 animate-pulse rounded-lg bg-muted/60" />
      ))}
    </div>
  );
}

function ChatContent({ brandId }: { brandId: string }) {
  const firestore = useFirestore();
  const baseQuery = useMemo(
    () =>
      query(
        collection(firestore, 'contentRequests'),
        where('brandId', '==', brandId),
        orderBy('createdAt', 'desc'),
        limit(5),
      ),
    [firestore, brandId],
  );

  const { status, data, error } = useFirestoreCollectionData(baseQuery, { idField: 'id' });

  if (status === 'loading') {
    return <ChatSkeleton />;
  }

  if (status === 'error') {
    captureException(error);
    return (
      <Alert variant="destructive">
        <div className="font-semibold">Unable to load conversations</div>
        <AlertDescription>
          Something went wrong while fetching the last briefs. Please retry.
        </AlertDescription>
      </Alert>
    );
  }

  const requests = (data as ContentRequest[]) ?? [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>How it works</CardTitle>
          <CardDescription>
            Use the floating BrandMate assistant (bottom-right) to send your brief. Recent requests show up below.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Recent briefs</h2>
        {requests.length === 0 && (
          <p className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-4 text-sm text-muted-foreground">
            No content requests yet. Start by telling the Master AI what campaign you need.
          </p>
        )}
        {requests.map(request => (
          <Card key={request.id}>
            <CardHeader>
              <CardTitle className="text-base">{request.prompt ?? 'Untitled brief'}</CardTitle>
              <CardDescription>
                Status: {request.status ?? 'draft'} • {formatTimestamp(request.createdAt)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Every brief here feeds the Requests board where you can follow execution.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function BrandChatPage() {
  const params = useParams<{ brandId: string }>();
  const brandId = params?.brandId;

  if (!brandId) {
    return (
      <Alert>
        <div className="font-semibold">Select a brand</div>
        <AlertDescription>Pick a brand to brief the Master AI.</AlertDescription>
      </Alert>
    );
  }

  return <ChatContent brandId={brandId} />;
}
