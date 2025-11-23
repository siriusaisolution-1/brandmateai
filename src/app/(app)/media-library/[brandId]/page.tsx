'use client';

import { useParams } from 'next/navigation';

import { BrandMediaLibrary } from '@/components/brand-media-library';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function MediaLibraryPage() {
  const params = useParams<{ brandId: string }>();
  const brandId = params?.brandId;

  if (!brandId) {
    return (
      <Alert>
        <div className="font-semibold">Select a brand</div>
        <AlertDescription>
          Pick a brand from the selector to open its media library.
        </AlertDescription>
      </Alert>
    );
  }

  return <BrandMediaLibrary brandId={brandId} />;
}