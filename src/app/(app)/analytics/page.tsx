'use client';

import { useEffect } from 'react';
import { useUser } from 'reactfire';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { fetchGlobalAnalytics, createDefaultAnalyticsPeriod } from '@/lib/analytics-data';
import { EmptyAnalyticsState, GlobalOverview, PerBrandGrid } from '@/components/analytics/analytics-cards';
import { useToast } from '@/components/ui/use-toast';

export default function AnalyticsPage() {
  const { data: user, status: authStatus } = useUser();
  const { toast } = useToast();

  const { data, status, error } = useQuery({
    queryKey: ['global-analytics', user?.uid],
    queryFn: () => fetchGlobalAnalytics(user?.uid ?? '', createDefaultAnalyticsPeriod()),
    enabled: Boolean(user?.uid),
  });

  useEffect(() => {
    if (error) {
      toast({ title: 'Failed to load analytics', description: String(error), variant: 'destructive' });
    }
  }, [error, toast]);

  if (authStatus === 'loading' || status === 'pending') {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading analytics...
      </div>
    );
  }

  if (!user?.uid) {
    return <EmptyAnalyticsState />;
  }

  if (!data || data.perBrand.length === 0) {
    return <EmptyAnalyticsState />;
  }

  const singleBrand = data.perBrand.length === 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Global overview across your brands.</p>
      </div>

      <GlobalOverview snapshot={data} />

      {!singleBrand && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Per-brand performance</h2>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </div>
          <PerBrandGrid snapshots={data.perBrand} />
        </div>
      )}
    </div>
  );
}
