import { describe, expect, it } from 'vitest';

import { groupOutputsByDate } from '@/hooks/brand-content';
import type { Output } from '@/types/firestore';

describe('groupOutputsByDate', () => {
  it('groups outputs by ISO date string', () => {
    const outputs: Array<Output & { id: string; createdAt?: Date }> = [
      { id: '1', brandId: 'b1', type: 'video', createdAt: new Date('2024-05-01T10:00:00Z') },
      { id: '2', brandId: 'b1', type: 'image', createdAt: new Date('2024-05-01T15:00:00Z') },
      { id: '3', brandId: 'b1', type: 'copy', createdAt: new Date('2024-05-02T08:00:00Z') },
      { id: '4', brandId: 'b1', type: 'copy' },
    ];

    const grouped = groupOutputsByDate(outputs);

    expect(Object.keys(grouped).sort()).toEqual(['2024-05-01', '2024-05-02', 'unknown']);
    expect(grouped['2024-05-01'].map((o) => o.id)).toEqual(['1', '2']);
    expect(grouped['unknown'][0].id).toBe('4');
  });
});
