import { renderToString } from 'react-dom/server';
import { expect, test, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useParams: () => ({ brandId: 'brand-123' }),
}));

vi.mock('@/hooks/brand-content', () => ({
  useBrandOutputs: () => ({
    status: 'success',
    data: [
      { id: '1', brandId: 'brand-123', type: 'video', title: 'Video Teaser', createdAt: new Date('2024-05-01') },
      { id: '2', brandId: 'brand-123', type: 'copy', title: 'Copy Piece', text: 'Hello world', createdAt: new Date('2024-05-02') },
    ],
  }),
}));

import Page from '@/app/(app)/brands/[brandId]/library/page';

// Basic SSR render check to ensure the component tree compiles with mocked hooks.
test('library page renders asset cards with mocked data', () => {
  const html = renderToString(<Page />);
  expect(html).toContain('Asset Library');
  expect(html).toContain('Video Teaser');
  expect(html).toContain('Copy Piece');
});
