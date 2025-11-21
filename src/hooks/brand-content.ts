'use client';

import { useMemo } from 'react';
import { collection, orderBy, query, where, type Query } from 'firebase/firestore';
import { useFirestore, useFirestoreCollectionData } from 'reactfire';
import type {
  CalendarEvent,
  ContentRequest,
  Output,
  OutputType,
  WithId,
} from '@/types/firestore';

function toDate(value: unknown): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  if (typeof value === 'number') return new Date(value);
  if (typeof value === 'object' && 'seconds' in (value as Record<string, unknown>)) {
    const obj = value as { seconds: number; nanoseconds?: number };
    return new Date(obj.seconds * 1000);
  }
  return undefined;
}

function noopQuery(firestore: ReturnType<typeof useFirestore>): Query {
  return query(collection(firestore, '__noop__'));
}

export type OutputsFilter = {
  type?: OutputType;
  contentRequestId?: string;
};

export function useBrandOutputs(brandId?: string, filters?: OutputsFilter) {
  const firestore = useFirestore();

  const baseCollection = useMemo(() => collection(firestore, 'outputs'), [firestore]);
  const emptyQuery = useMemo(() => noopQuery(firestore), [firestore]);

  const outputsQuery = useMemo(() => {
    if (!brandId) return emptyQuery;
    const clauses = [where('brandId', '==', brandId)];
    if (filters?.type) clauses.push(where('type', '==', filters.type));
    if (filters?.contentRequestId) {
      clauses.push(where('contentRequestId', '==', filters.contentRequestId));
    }
    return query(baseCollection, ...clauses, orderBy('createdAt', 'desc'));
  }, [baseCollection, brandId, emptyQuery, filters?.contentRequestId, filters?.type]);

  const { status, data, error } = useFirestoreCollectionData(outputsQuery, {
    idField: 'id',
  });

  const outputs = ((data as WithId<Output>[] | undefined) ?? []).map((item) => ({
    ...item,
    createdAt: toDate(item.createdAt),
  }));

  return { status, data: outputs, error };
}

export function useBrandContentRequests(brandId?: string) {
  const firestore = useFirestore();

  const baseCollection = useMemo(() => collection(firestore, 'contentRequests'), [firestore]);
  const emptyQuery = useMemo(() => noopQuery(firestore), [firestore]);

  const requestsQuery = useMemo(() => {
    if (!brandId) return emptyQuery;
    return query(baseCollection, where('brandId', '==', brandId), orderBy('createdAt', 'desc'));
  }, [baseCollection, brandId, emptyQuery]);

  const { status, data, error } = useFirestoreCollectionData(requestsQuery, {
    idField: 'id',
  });

  const requests = ((data as WithId<ContentRequest>[] | undefined) ?? []).map((item) => ({
    ...item,
    createdAt: toDate(item.createdAt),
  }));

  return { status, data: requests, error };
}

export type CalendarRange = { start: Date; end: Date };

export function useBrandCalendarEvents(brandId?: string, range?: CalendarRange) {
  const firestore = useFirestore();

  const baseCollection = useMemo(() => collection(firestore, 'calendarEvents'), [firestore]);
  const emptyQuery = useMemo(() => noopQuery(firestore), [firestore]);

  const eventsQuery = useMemo(() => {
    if (!brandId) return emptyQuery;
    const clauses = [where('brandId', '==', brandId)];
    if (range?.start) clauses.push(where('startTime', '>=', range.start));
    if (range?.end) clauses.push(where('startTime', '<=', range.end));
    return query(baseCollection, ...clauses, orderBy('startTime', 'asc'));
  }, [baseCollection, brandId, emptyQuery, range?.end, range?.start]);

  const { status, data, error } = useFirestoreCollectionData(eventsQuery, {
    idField: 'id',
  });

  const events = ((data as WithId<CalendarEvent>[] | undefined) ?? []).map((item) => ({
    ...item,
    startTime: toDate(item.startTime),
    endTime: toDate(item.endTime),
  }));

  return { status, data: events, error };
}

export function groupOutputsByDate(outputs: Array<WithId<Output> & { createdAt?: Date }>) {
  return outputs.reduce<Record<string, Array<WithId<Output> & { createdAt?: Date }>>>(
    (acc, item) => {
      const key = item.createdAt ? item.createdAt.toISOString().slice(0, 10) : 'unknown';
      acc[key] = acc[key] ? [...acc[key], item] : [item];
      return acc;
    },
    {}
  );
}
