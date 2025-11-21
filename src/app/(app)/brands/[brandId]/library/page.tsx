'use client';

import { useParams } from 'next/navigation';

import { BrandMediaLibrary } from '@/components/brand-media-library';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function BrandLibraryPage() {
  const params = useParams<{ brandId: string }>();
  const brandId = params?.brandId;

  if (!brandId) {
    return (
      <Alert>
        <div className="font-semibold">Select a brand</div>
        <AlertDescription>Pick a brand to see its media library.</AlertDescription>
      </Alert>
    );
  }

  return <BrandMediaLibrary brandId={brandId} />;
}
