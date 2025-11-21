'use client';

import { useParams } from 'next/navigation';

import { BrandCalendar } from '@/components/brand-calendar';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function BrandCalendarRoute() {
  const params = useParams<{ brandId: string }>();
  const brandId = params?.brandId;

  if (!brandId) {
    return (
      <Alert>
        <div className="font-semibold">Select a brand</div>
        <AlertDescription>Pick a brand to review the calendar.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-copy-primary">Calendar</h1>
        <p className="text-muted-foreground">Scheduled posts and campaigns for this brand.</p>
      </div>
      <BrandCalendar brandId={brandId} />
    </div>
  );
}
