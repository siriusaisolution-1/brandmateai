import { collection, getDocs, query, Timestamp, where } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { firestore as defaultDb } from './firebase';
import type {
  AnalyticsPeriod,
  BrandAnalyticsSnapshot,
  GlobalAnalyticsSnapshot,
  OutputCounts,
  UsageCounts,
} from '@/types/analytics';
import type { Brand } from '@/types/firestore';

const DEFAULT_PERIOD_DAYS = 30;

export function createDefaultAnalyticsPeriod(days: number = DEFAULT_PERIOD_DAYS): AnalyticsPeriod {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);
  return { start, end };
}

function emptyOutputCounts(): OutputCounts {
  return { total: 0, video: 0, image: 0, copy: 0 };
}

function emptyRequestCounts() {
  return { total: 0, completed: 0, pending: 0 };
}

function emptyUsageCounts(): UsageCounts {
  return { totalTasks: 0, videoTasks: 0, imageTasks: 0 };
}

export async function fetchBrandAnalytics(
  brandId: string,
  period: AnalyticsPeriod = createDefaultAnalyticsPeriod(),
  db: Firestore = defaultDb,
): Promise<BrandAnalyticsSnapshot> {
  const startTs = Timestamp.fromDate(period.start);
  const endTs = Timestamp.fromDate(period.end);

  const outputsQuery = query(
    collection(db, 'outputs'),
    where('brandId', '==', brandId),
    where('createdAt', '>=', startTs),
    where('createdAt', '<=', endTs),
  );

  const requestsQuery = query(
    collection(db, 'contentRequests'),
    where('brandId', '==', brandId),
    where('createdAt', '>=', startTs),
    where('createdAt', '<=', endTs),
  );

  const usageQuery = query(
    collection(db, 'usageSnapshots'),
    where('brandId', '==', brandId),
    where('capturedAt', '>=', startTs),
    where('capturedAt', '<=', endTs),
  );

  const [outputsSnapshot, requestsSnapshot, usageSnapshot] = await Promise.all([
    getDocs(outputsQuery),
    getDocs(requestsQuery),
    getDocs(usageQuery),
  ]);

  const outputs = outputsSnapshot.docs.reduce<OutputCounts>((acc, doc) => {
    const data = doc.data() as { type?: string };
    const type = (data.type ?? '').toLowerCase();
    if (type === 'video') acc.video += 1;
    if (type === 'image') acc.image += 1;
    if (type === 'copy') acc.copy += 1;
    acc.total += 1;
    return acc;
  }, emptyOutputCounts());

  const contentRequests = requestsSnapshot.docs.reduce((acc, doc) => {
    const data = doc.data() as { status?: string };
    const status = (data.status ?? '').toLowerCase();
    acc.total += 1;
    if (status === 'completed' || status === 'done') {
      acc.completed += 1;
    } else {
      acc.pending += 1;
    }
    return acc;
  }, emptyRequestCounts());

  const usage = usageSnapshot.docs.reduce<UsageCounts>((acc, doc) => {
    const data = doc.data() as UsageCounts;
    acc.totalTasks = (acc.totalTasks ?? 0) + (data.totalTasks ?? 0);
    acc.videoTasks = (acc.videoTasks ?? 0) + (data.videoTasks ?? 0);
    acc.imageTasks = (acc.imageTasks ?? 0) + (data.imageTasks ?? 0);
    return acc;
  }, emptyUsageCounts());

  return {
    brandId,
    brandName: undefined,
    periodStart: startTs,
    periodEnd: endTs,
    outputs,
    contentRequests,
    usage,
  };
}

export async function fetchGlobalAnalytics(
  userId: string,
  period: AnalyticsPeriod = createDefaultAnalyticsPeriod(),
  db: Firestore = defaultDb,
): Promise<GlobalAnalyticsSnapshot> {
  const brandsQuery = query(collection(db, 'brands'), where('ownerId', '==', userId));
  const brandDocs = await getDocs(brandsQuery);
  const brands = brandDocs.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Brand) }));

  const perBrand = await Promise.all(
    brands.map(async (brand) => {
      const snapshot = await fetchBrandAnalytics(brand.id, period, db);
      return { ...snapshot, brandName: brand.name };
    }),
  );

  const totals = perBrand.reduce(
    (acc, brand) => {
      acc.brands += 1;
      acc.outputs += brand.outputs.total;
      acc.video += brand.outputs.video;
      acc.image += brand.outputs.image;
      acc.copy += brand.outputs.copy;
      acc.contentRequests += brand.contentRequests.total;
      return acc;
    },
    { brands: 0, outputs: 0, video: 0, image: 0, copy: 0, contentRequests: 0 },
  );

  const startTs = Timestamp.fromDate(period.start);
  const endTs = Timestamp.fromDate(period.end);

  return {
    periodStart: startTs,
    periodEnd: endTs,
    totals,
    perBrand,
  };
}
