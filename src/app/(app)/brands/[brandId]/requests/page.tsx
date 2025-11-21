'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { collection, orderBy, query, where } from 'firebase/firestore';
import { useFirestore, useFirestoreCollectionData } from 'reactfire';
import { captureException } from '@sentry/nextjs';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type ContentRequest = {
  id: string;
  title?: string;
  prompt?: string;
  status?: string;
  priority?: string;
  createdAt?: { seconds: number } | number | string;
};

function formatTimestamp(value: ContentRequest['createdAt']) {
  if (!value) return '—';
  if (typeof value === 'number') return new Date(value).toLocaleDateString();
  if (typeof value === 'string') return new Date(value).toLocaleDateString();
  if (typeof value === 'object' && 'seconds' in value) return new Date(value.seconds * 1000).toLocaleDateString();
  return '—';
}

function RequestsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="h-16 animate-pulse rounded bg-muted/60" />
      ))}
    </div>
  );
}

function RequestsContent({ brandId }: { brandId: string }) {
  const firestore = useFirestore();
  const requestsQuery = useMemo(
    () =>
      query(
        collection(firestore, 'contentRequests'),
        where('brandId', '==', brandId),
        orderBy('createdAt', 'desc'),
      ),
    [firestore, brandId],
  );

  const { status, data, error } = useFirestoreCollectionData(requestsQuery, { idField: 'id' });

  if (status === 'loading') {
    return <RequestsSkeleton />;
  }

  if (status === 'error') {
    captureException(error);
    return (
      <Alert variant="destructive">
        <div className="font-semibold">Unable to load requests</div>
        <AlertDescription>
          Something went wrong while loading the queue. Please refresh.
        </AlertDescription>
      </Alert>
    );
  }

  const requests = (data as ContentRequest[]) ?? [];

  if (requests.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-4 text-sm text-muted-foreground">
        No requests yet. Use the chat to brief your next content batch.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Request</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map(request => (
          <TableRow key={request.id}>
            <TableCell>{request.title ?? request.prompt ?? 'Untitled'}</TableCell>
            <TableCell className="capitalize">{request.status ?? 'draft'}</TableCell>
            <TableCell>{request.priority ?? 'normal'}</TableCell>
            <TableCell>{formatTimestamp(request.createdAt)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function BrandRequestsPage() {
  const params = useParams<{ brandId: string }>();
  const brandId = params?.brandId;

  if (!brandId) {
    return (
      <Alert>
        <div className="font-semibold">Select a brand</div>
        <AlertDescription>Pick a brand to review requests.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Requests</CardTitle>
          <CardDescription>Everything the AI is working on for this brand.</CardDescription>
        </CardHeader>
      </Card>
      <RequestsContent brandId={brandId} />
    </div>
  );
}
