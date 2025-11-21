import { beforeEach, describe, expect, it } from 'vitest';

interface OutputDoc {
  brandId: string;
  requestId: string;
  type: 'image' | 'video' | 'copy';
  status: string;
  createdBy: string;
}

const brands = new Map<string, string>();
const outputs = new Map<string, OutputDoc>();

function canReadOutput(userId: string, outputId: string): boolean {
  const output = outputs.get(outputId);
  if (!output) return false;
  const owner = brands.get(output.brandId);
  return owner === userId;
}

beforeEach(() => {
  brands.clear();
  outputs.clear();
});

describe('outputs security logic', () => {
  it('allows brand owner to read outputs', () => {
    brands.set('brand1', 'user1');
    outputs.set('output1', { brandId: 'brand1', requestId: 'req1', type: 'image', status: 'draft', createdBy: 'user1' });

    expect(canReadOutput('user1', 'output1')).toBe(true);
  });

  it('denies reads for users outside the brand', () => {
    brands.set('brand1', 'user1');
    outputs.set('output1', { brandId: 'brand1', requestId: 'req1', type: 'image', status: 'draft', createdBy: 'user1' });

    expect(canReadOutput('user2', 'output1')).toBe(false);
  });
});
