import { describe, expect, it, beforeEach, vi } from 'vitest';
import { fetchBrandAnalytics, fetchGlobalAnalytics, createDefaultAnalyticsPeriod } from './analytics-data';
import type { Brand } from '@/types/firestore';

const mockGetDocs = vi.fn();

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual<typeof import('firebase/firestore')>('firebase/firestore');
  return {
    ...actual,
    collection: (_db: unknown, path: string) => ({ path }),
    query: (...args: unknown[]) => args,
    where: (...args: unknown[]) => args,
    getDocs: (...args: unknown[]) => mockGetDocs(...args),
  } as typeof actual;
});

const brandDoc = (id: string, data: Partial<Brand>) => ({ id, data: () => data });
const outputDoc = (type: string) => ({ data: () => ({ type }) });
const requestDoc = (status: string) => ({ data: () => ({ status }) });
const usageDoc = (counts: Record<string, number>) => ({ data: () => counts });

beforeEach(() => {
  mockGetDocs.mockReset();
});

describe('analytics data layer', () => {
  it('calculates brand metrics across outputs and requests', async () => {
    const period = createDefaultAnalyticsPeriod();

    mockGetDocs
      .mockResolvedValueOnce({ docs: [outputDoc('video'), outputDoc('image')] })
      .mockResolvedValueOnce({ docs: [requestDoc('completed'), requestDoc('queued')] })
      .mockResolvedValueOnce({ docs: [usageDoc({ totalTasks: 3, videoTasks: 2, imageTasks: 1 })] });

    const snapshot = await fetchBrandAnalytics('brand-1', period, {} as never);

    expect(snapshot.outputs.video).toBe(1);
    expect(snapshot.outputs.image).toBe(1);
    expect(snapshot.outputs.copy).toBe(0);
    expect(snapshot.contentRequests.total).toBe(2);
    expect(snapshot.contentRequests.completed).toBe(1);
    expect(snapshot.contentRequests.pending).toBe(1);
    expect(snapshot.usage?.totalTasks).toBe(3);
  });

  it('aggregates multiple brands for global analytics', async () => {
    const period = createDefaultAnalyticsPeriod();

    mockGetDocs
      .mockResolvedValueOnce({ docs: [brandDoc('brand-1', { name: 'Alpha' }), brandDoc('brand-2', { name: 'Beta' })] })
      .mockResolvedValueOnce({ docs: [outputDoc('video')] })
      .mockResolvedValueOnce({ docs: [requestDoc('completed')] })
      .mockResolvedValueOnce({ docs: [usageDoc({ totalTasks: 1 })] })
      .mockResolvedValueOnce({ docs: [outputDoc('image'), outputDoc('copy')] })
      .mockResolvedValueOnce({ docs: [requestDoc('queued')] })
      .mockResolvedValueOnce({ docs: [usageDoc({ totalTasks: 2 })] });

    const global = await fetchGlobalAnalytics('owner-1', period, {} as never);

    expect(global.totals.brands).toBe(2);
    expect(global.totals.outputs).toBe(3);
    expect(global.totals.video).toBe(1);
    expect(global.totals.image).toBe(1);
    expect(global.totals.copy).toBe(1);
    expect(global.totals.contentRequests).toBe(2);
    expect(global.perBrand).toHaveLength(2);
  });
});
