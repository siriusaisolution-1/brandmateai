import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';

export interface ClientUsageSnapshot {
  userId: string;
  brandId: string;
  yearMonth: string;
  videosGenerated: number;
  imagesGenerated: number;
  requestsProcessed: number;
  updatedAt?: unknown;
}

export function getCurrentYearMonth(date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  return `${year}-${month.toString().padStart(2, '0')}`;
}

export function getUsageSnapshotRef(firestore: Firestore, userId: string, brandId: string, yearMonth: string) {
  return doc(firestore, 'usageSnapshots', `${userId}:${brandId}:${yearMonth}`);
}

export async function getOrCreateClientUsageSnapshot(
  firestore: Firestore,
  userId: string,
  brandId: string,
  yearMonth = getCurrentYearMonth(),
): Promise<ClientUsageSnapshot> {
  const ref = getUsageSnapshotRef(firestore, userId, brandId, yearMonth);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const data = snap.data() as Partial<ClientUsageSnapshot>;
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

  const payload: ClientUsageSnapshot = {
    userId,
    brandId,
    yearMonth,
    videosGenerated: 0,
    imagesGenerated: 0,
    requestsProcessed: 0,
    updatedAt: serverTimestamp(),
  };

  await setDoc(ref, payload);
  return payload;
}
