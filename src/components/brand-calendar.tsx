'use client';

import { useMemo } from 'react';
import { collection, orderBy, query, where } from 'firebase/firestore';
import { useFirestore, useFirestoreCollectionData } from 'reactfire';
import { captureException } from '@sentry/nextjs';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CalendarEvent } from '@/types/firestore';

function formatDate(value: CalendarEvent['startTime']) {
  if (!value) return '—';
  if (typeof value === 'number') return new Date(value).toLocaleString();
  if (typeof value === 'string') return new Date(value).toLocaleString();
  if (typeof value === 'object' && 'seconds' in value) {
    return new Date(value.seconds * 1000).toLocaleString();
  }
  return '—';
}

function CalendarSkeleton() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-32 animate-pulse rounded bg-muted/60" />
      ))}
    </div>
  );
}

export function BrandCalendar({ brandId }: { brandId: string }) {
  const firestore = useFirestore();
  const eventsQuery = useMemo(
    () =>
      query(
        collection(firestore, 'calendar'),
        where('brandId', '==', brandId),
        orderBy('startTime', 'asc'),
      ),
    [firestore, brandId],
  );
  const { status, data, error } = useFirestoreCollectionData(eventsQuery, { idField: 'id' });

  if (status === 'loading') {
    return <CalendarSkeleton />;
  }

  if (status === 'error') {
    captureException(error);
    return (
      <Alert variant="destructive">
        <div className="font-semibold">Unable to load calendar</div>
        <AlertDescription>
          Something went wrong while fetching scheduled content. Please retry.
        </AlertDescription>
      </Alert>
    );
  }

  const events = (data as (CalendarEvent & { id: string })[]) ?? [];

  if (events.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-4 text-sm text-muted-foreground">
        No scheduled content yet. Approve a request and schedule it to see it here.
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {events.map(event => (
        <Card key={event.id}>
          <CardHeader>
            <CardTitle className="text-base">{event.title}</CardTitle>
            <CardDescription>{formatDate(event.startTime)}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{event.description ?? 'No additional notes.'}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
