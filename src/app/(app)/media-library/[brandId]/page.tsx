// src/app/(app)/media-library/[brandId]/page.tsx
'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import MediaUploader from '@/components/media-uploader';
import { useFirestore, useFirestoreCollectionData } from 'reactfire';
import { collection, query, where } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import type { E2EMediaAsset } from '@/types/e2e-mocks';

type MediaAsset = {
  id: string;
  brandId: string;
  url?: string;
  fileName?: string;
  mimeType?: string;
  createdAt?: unknown;
};

export default function BrandMediaLibraryPage() {
  const params = useParams<{ brandId: string }>();
  const brandId = params?.brandId as string;

  const firestore = useFirestore();
  const col = useMemo(
    () => collection(firestore, 'mediaAssets'),
    [firestore]
  );
  const q = useMemo(
    () => query(col, where('brandId', '==', brandId)),
    [col, brandId]
  );

  const { status, data, error } = useFirestoreCollectionData(q, { idField: 'id' });
  const assetsFromFirestore = (data as unknown as MediaAsset[])?.filter(a => !!a.url) ?? [];

  const e2eMocks = typeof window !== 'undefined' ? window.__E2E_MOCKS__ : undefined;
  const [mockAssets, setMockAssets] = useState<E2EMediaAsset[]>(() =>
    e2eMocks?.getMediaAssets?.(brandId) ?? []
  );

  useEffect(() => {
    if (!e2eMocks?.subscribeToMediaUpdates) {
      return;
    }

    setMockAssets(e2eMocks.getMediaAssets?.(brandId) ?? []);

    const unsubscribe = e2eMocks.subscribeToMediaUpdates(brandId, updates => {
      setMockAssets(updates);
    });

    return unsubscribe;
  }, [brandId, e2eMocks]);

  const usingE2E = Boolean(e2eMocks?.getMediaAssets || e2eMocks?.subscribeToMediaUpdates);
  const assets = usingE2E
    ? mockAssets.map<MediaAsset>(asset => ({
        id: asset.id,
        brandId: asset.brandId,
        url: asset.url,
        fileName: asset.fileName,
      }))
    : assetsFromFirestore;
  const resolvedStatus = usingE2E ? 'success' : status;

  const hasError = resolvedStatus === 'error' || Boolean(error);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Media Library</h1>
          <p className="text-sm text-muted-foreground">Upload and review videos, images, and documents.</p>
        </div>
        <MediaUploader brandId={brandId} />
      </div>

      {resolvedStatus === 'loading' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" aria-label="media library loading">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="h-32 md:h-40 rounded-md bg-muted animate-pulse"
              aria-hidden
            />
          ))}
        </div>
      )}

      {hasError && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          Unable to load assets right now. Please retry in a moment.
        </div>
      )}

      {resolvedStatus === 'success' && (
        <div
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
          data-testid="media-library"
        >
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="relative w-full aspect-square rounded-md overflow-hidden border border-gray-700"
              data-testid="media-item"
            >
              <Image
                src={asset.url!}
                alt={asset.fileName ?? 'asset'}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 25vw, 50vw"
              />
            </div>
          ))}
          {assets.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-muted-foreground/30 p-6 text-center text-sm text-muted-foreground">
              <p>No assets yet.</p>
              <p className="text-xs text-muted-foreground">Use the uploader above to add your first files.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}