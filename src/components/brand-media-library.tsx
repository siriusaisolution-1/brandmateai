'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { collection, query, where } from 'firebase/firestore';
import { useFirestore, useFirestoreCollectionData } from 'reactfire';
import { captureException } from '@sentry/nextjs';

import MediaUploader from '@/components/media-uploader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { E2EMediaAsset } from '@/types/e2e-mocks';

type MediaAsset = {
  id: string;
  brandId: string;
  url?: string;
  fileName?: string;
  mimeType?: string;
  createdAt?: unknown;
};

export function BrandMediaLibrary({ brandId }: { brandId: string }) {
  const firestore = useFirestore();
  const col = useMemo(() => collection(firestore, 'mediaAssets'), [firestore]);
  const q = useMemo(() => query(col, where('brandId', '==', brandId)), [col, brandId]);

  const { status, data, error } = useFirestoreCollectionData(q, { idField: 'id' });
  const assetsFromFirestore = (data as unknown as MediaAsset[])?.filter(asset => !!asset.url) ?? [];

  const e2eMocks = typeof window !== 'undefined' ? window.__E2E_MOCKS__ : undefined;
  const [mockAssets, setMockAssets] = useState<E2EMediaAsset[]>(() => e2eMocks?.getMediaAssets?.(brandId) ?? []);

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

  if (resolvedStatus === 'error') {
    captureException(error);
    return (
      <Alert variant="destructive">
        <div className="font-semibold">Unable to load your media</div>
        <AlertDescription>
          Something went wrong while loading assets. Please refresh or try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Media Library</h1>
          <p className="text-sm text-muted-foreground">
            Browse everything the AI generated and upload your own references.
          </p>
        </div>
        <MediaUploader brandId={brandId} />
      </div>

      {resolvedStatus === 'loading' && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="aspect-square animate-pulse rounded-lg bg-muted/40" />
          ))}
        </div>
      )}

      {resolvedStatus === 'success' && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4" data-testid="media-library">
          {assets.map(asset => (
            <div
              key={asset.id}
              className="relative aspect-square overflow-hidden rounded-md border border-gray-700"
              data-testid="media-item"
            >
              {asset.url ? (
                <Image
                  src={asset.url}
                  alt={asset.fileName ?? 'asset'}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 25vw, 50vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Missing URL</div>
              )}
            </div>
          ))}
          {assets.length === 0 && (
            <div className="col-span-full rounded-lg border border-dashed border-muted-foreground/40 bg-muted/30 p-4 text-sm text-muted-foreground">
              No content yet. Start by asking the master AI to create your first campaign.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
