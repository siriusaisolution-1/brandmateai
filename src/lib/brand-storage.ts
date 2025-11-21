'use client';

import type { Brand } from '@/types/firestore';

export const ACTIVE_BRAND_STORAGE_KEY = 'brandmate.activeBrandId';

export function persistActiveBrandId(brandId: string, storage: Storage = window.localStorage) {
  storage.setItem(ACTIVE_BRAND_STORAGE_KEY, brandId);
}

export function getInitialActiveBrandId(
  brands: Brand[],
  storage: Storage | null = typeof window !== 'undefined' ? window.localStorage : null,
): string | undefined {
  if (!brands.length) {
    return undefined;
  }

  const cached = storage?.getItem(ACTIVE_BRAND_STORAGE_KEY);
  if (cached && brands.some((brand) => brand.id === cached)) {
    return cached;
  }

  return brands[0]?.id;
}
