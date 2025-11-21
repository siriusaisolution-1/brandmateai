import * as admin from 'firebase-admin';

import { getPlanForUser } from './plans';
import type { PlanLimits } from './plans';
import type { UserProfile } from '../types/firestore';

const firestore = admin.firestore();
const { FieldValue } = admin.firestore;

export interface UsageSnapshot {
  userId: string;
  brandId: string;
  yearMonth: string;
  videosGenerated: number;
  imagesGenerated: number;
  requestsProcessed: number;
  updatedAt?: FirebaseFirestore.FieldValue;
}

export interface UsageWithLimits {
  usage: UsageSnapshot;
  limits: PlanLimits;
}

export function getCurrentYearMonth(date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const paddedMonth = month.toString().padStart(2, '0');
  return `${year}-${paddedMonth}`;
}

function getUsageDocRef(userId: string, brandId: string, yearMonth: string) {
  return firestore.collection('usageSnapshots').doc(`${userId}:${brandId}:${yearMonth}`);
}

export async function getOrCreateUsageSnapshot(
  userId: string,
  brandId: string,
  yearMonth = getCurrentYearMonth(),
): Promise<UsageSnapshot> {
  const docRef = getUsageDocRef(userId, brandId, yearMonth);
  const snap = await docRef.get();

  if (snap.exists) {
    const data = snap.data() as UsageSnapshot;
    return {
      userId,
      brandId,
      yearMonth,
      videosGenerated: data.videosGenerated ?? 0,
      imagesGenerated: data.imagesGenerated ?? 0,
      requestsProcessed: data.requestsProcessed ?? 0,
      updatedAt: data.updatedAt,
    };
  }

  const empty: UsageSnapshot = {
    userId,
    brandId,
    yearMonth,
    videosGenerated: 0,
    imagesGenerated: 0,
    requestsProcessed: 0,
    updatedAt: FieldValue.serverTimestamp(),
  };

  await docRef.set(empty);
  return empty;
}

export async function incrementUsage(params: {
  userId: string;
  brandId: string;
  videosDelta?: number;
  imagesDelta?: number;
  requestsDelta?: number;
  yearMonth?: string;
}): Promise<void> {
  const { userId, brandId, yearMonth = getCurrentYearMonth(), videosDelta = 0, imagesDelta = 0, requestsDelta = 0 } = params;
  const docRef = getUsageDocRef(userId, brandId, yearMonth);

  const updates: Partial<UsageSnapshot> = {
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (videosDelta) {
    updates.videosGenerated = FieldValue.increment(videosDelta) as unknown as number;
  }
  if (imagesDelta) {
    updates.imagesGenerated = FieldValue.increment(imagesDelta) as unknown as number;
  }
  if (requestsDelta) {
    updates.requestsProcessed = FieldValue.increment(requestsDelta) as unknown as number;
  }

  await docRef.set(
    {
      userId,
      brandId,
      yearMonth,
      videosGenerated: 0,
      imagesGenerated: 0,
      requestsProcessed: 0,
      ...updates,
    },
    { merge: true },
  );
}

export async function getUsageAndLimits(user: UserProfile, brandId: string): Promise<UsageWithLimits> {
  const yearMonth = getCurrentYearMonth();
  const usage = await getOrCreateUsageSnapshot(user.id ?? user.uid ?? '', brandId, yearMonth);
  const limits = getPlanForUser(user).limits;
  return { usage, limits };
}

export const _test = {
  getUsageDocRef,
};
