'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { useFirestore, useFirestoreDocData } from 'reactfire';
import { captureException } from '@sentry/nextjs';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function BrandHomeSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-1/3 animate-pulse rounded bg-muted" />
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="h-40 animate-pulse rounded bg-muted/60" />
        ))}
      </div>
    </div>
  );
}

function BrandHomeContent({ brandId }: { brandId: string }) {
  const router = useRouter();
  const firestore = useFirestore();
  const brandRef = useMemo(() => doc(firestore, 'brands', brandId), [firestore, brandId]);
  const { status, data, error } = useFirestoreDocData(brandRef, {
    idField: 'id',
  });

  if (status === 'loading' || !data) {
    return <BrandHomeSkeleton />;
  }

  if (status === 'error') {
    captureException(error);
    return (
      <Alert variant="destructive">
        <div className="font-semibold">Unable to load brand</div>
        <AlertDescription>
          Something went wrong while loading your brand overview. Please retry.
        </AlertDescription>
      </Alert>
    );
  }

  const brand = data as { name?: string; description?: string; industry?: string; brandVoice?: string };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-copy-primary">{brand.name ?? 'Brand overview'}</h1>
          <p className="text-muted-foreground">
            Quick summary of your brand memory and the next recommended steps.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => router.push(`/brands/${brandId}/chat`)}>Start a brief</Button>
          <Button variant="secondary" onClick={() => router.push(`/media-library/${brandId}`)}>
            Open media library
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Brand voice</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {brand.brandVoice ?? 'Describe how your brand should sound so every output feels consistent.'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Industry / Focus</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {brand.industry ?? 'Tell the AI what market you serve to get better campaign ideas.'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Latest notes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {brand.description ?? 'Upload mood boards or add a short description so every collaborator sees the context.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BrandHomePage() {
  const params = useParams<{ brandId: string }>();
  const brandId = params?.brandId;

  if (!brandId) {
    return (
      <Alert>
        <div className="font-semibold">Select a brand</div>
        <AlertDescription>Pick a brand from the selector to see its overview.</AlertDescription>
      </Alert>
    );
  }

  return <BrandHomeContent brandId={brandId} />;
}
