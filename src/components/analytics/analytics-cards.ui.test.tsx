import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { Timestamp } from 'firebase/firestore';
import { GlobalOverview, PerBrandGrid } from './analytics-cards';
import type { BrandAnalyticsSnapshot, GlobalAnalyticsSnapshot } from '@/types/analytics';

const baseSnapshot: BrandAnalyticsSnapshot = {
  brandId: 'brand-1',
  brandName: 'Alpha',
  periodStart: Timestamp.now(),
  periodEnd: Timestamp.now(),
  outputs: { total: 3, video: 1, image: 1, copy: 1 },
  contentRequests: { total: 2, completed: 1, pending: 1 },
  usage: { totalTasks: 2, videoTasks: 1, imageTasks: 1 },
};

describe('analytics UI', () => {
  it('renders global overview stats', () => {
    const global: GlobalAnalyticsSnapshot = {
      periodStart: Timestamp.now(),
      periodEnd: Timestamp.now(),
      totals: { brands: 1, outputs: 3, video: 1, image: 1, copy: 1, contentRequests: 2 },
      perBrand: [baseSnapshot],
    };

    render(<GlobalOverview snapshot={global} />);

    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Content requests')).toBeInTheDocument();
  });

  it('lists per-brand cards when multiple brands are present', () => {
    const otherBrand: BrandAnalyticsSnapshot = {
      ...baseSnapshot,
      brandId: 'brand-2',
      brandName: 'Beta',
      outputs: { total: 2, video: 0, image: 1, copy: 1 },
    };

    render(<PerBrandGrid snapshots={[baseSnapshot, otherBrand]} />);

    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getAllByText('Content requests')).toHaveLength(2);
  });
});
