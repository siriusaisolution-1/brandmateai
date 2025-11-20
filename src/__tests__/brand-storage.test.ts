import { describe, expect, it } from 'vitest';

import { getInitialActiveBrandId, persistActiveBrandId, ACTIVE_BRAND_STORAGE_KEY } from '@/lib/brand-storage';
import type { Brand } from '@/types/firestore';

class MemoryStorage implements Storage {
  private data = new Map<string, string>();

  get length() {
    return this.data.size;
  }

  clear(): void {
    this.data.clear();
  }

  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.data.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }
}

const brands: Brand[] = [
  { id: 'a', ownerId: 'u', name: 'Alpha', status: 'active', createdAt: 0, updatedAt: 0 },
  { id: 'b', ownerId: 'u', name: 'Beta', status: 'active', createdAt: 0, updatedAt: 0 },
];

describe('getInitialActiveBrandId', () => {
  it('returns the cached brand when present', () => {
    const storage = new MemoryStorage();
    storage.setItem(ACTIVE_BRAND_STORAGE_KEY, 'b');

    const value = getInitialActiveBrandId(brands, storage);

    expect(value).toBe('b');
  });

  it('falls back to the first brand when cache is missing', () => {
    const storage = new MemoryStorage();

    const value = getInitialActiveBrandId(brands, storage);

    expect(value).toBe('a');
  });

  it('returns undefined when there are no brands', () => {
    const storage = new MemoryStorage();

    const value = getInitialActiveBrandId([], storage);

    expect(value).toBeUndefined();
  });
});

describe('persistActiveBrandId', () => {
  it('stores the active brand id in storage', () => {
    const storage = new MemoryStorage();

    persistActiveBrandId('c', storage);

    expect(storage.getItem(ACTIVE_BRAND_STORAGE_KEY)).toBe('c');
  });
});
