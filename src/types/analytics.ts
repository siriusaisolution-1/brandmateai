import type { Timestamp } from 'firebase/firestore';

export type AnalyticsPeriod = {
  start: Date;
  end: Date;
};

export type OutputCounts = {
  total: number;
  video: number;
  image: number;
  copy: number;
};

export type ContentRequestCounts = {
  total: number;
  completed: number;
  pending: number;
};

export type UsageCounts = {
  totalTasks?: number;
  videoTasks?: number;
  imageTasks?: number;
};

export type BrandAnalyticsSnapshot = {
  brandId: string;
  brandName?: string;
  periodStart: Timestamp;
  periodEnd: Timestamp;
  outputs: OutputCounts;
  contentRequests: ContentRequestCounts;
  usage?: UsageCounts;
};

export type GlobalAnalyticsSnapshot = {
  periodStart: Timestamp;
  periodEnd: Timestamp;
  totals: {
    brands: number;
    outputs: number;
    video: number;
    image: number;
    copy: number;
    contentRequests: number;
  };
  perBrand: BrandAnalyticsSnapshot[];
};
