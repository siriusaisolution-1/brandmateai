'use client';

import Link from 'next/link';
import { ArrowUpRight, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { BrandAnalyticsSnapshot, GlobalAnalyticsSnapshot } from '@/types/analytics';
import { cn } from '@/lib/utils';

export function StatCard({
  label,
  value,
  sublabel,
  highlight,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  highlight?: boolean;
}) {
  return (
    <Card className={cn('bg-surface border-muted', highlight && 'border-primary/60')}> 
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-end justify-between">
        <div className="text-3xl font-semibold">{value}</div>
        {sublabel ? <div className="text-xs text-muted-foreground">{sublabel}</div> : null}
      </CardContent>
    </Card>
  );
}

export function GlobalOverview({ snapshot }: { snapshot: GlobalAnalyticsSnapshot }) {
  const periodLabel = 'Last 30 days';
  return (
    <Card className="bg-surface border-muted">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <p className="text-sm text-muted-foreground">Global analytics</p>
          <CardTitle className="text-xl">Overview</CardTitle>
          <p className="text-xs text-muted-foreground">{periodLabel}</p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <BarChart3 className="h-4 w-4" />
          {snapshot.totals.brands} brand{snapshot.totals.brands === 1 ? '' : 's'}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard label="Outputs" value={snapshot.totals.outputs} sublabel="Video + images + copy" />
          <StatCard label="Videos" value={snapshot.totals.video} />
          <StatCard label="Images" value={snapshot.totals.image} />
          <StatCard label="Copy" value={snapshot.totals.copy} />
          <StatCard label="Content requests" value={snapshot.totals.contentRequests} />
        </div>
      </CardContent>
    </Card>
  );
}

export function PerBrandGrid({ snapshots }: { snapshots: BrandAnalyticsSnapshot[] }) {
  if (snapshots.length === 0) {
    return (
      <Card className="bg-surface border-muted">
        <CardContent className="py-10 text-center text-muted-foreground">No brands yet. Create one to see analytics.</CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {snapshots.map((brand) => (
        <Card key={brand.brandId} className="bg-surface border-muted">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-lg">{brand.brandName ?? 'Brand'}</CardTitle>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </div>
            <Link
              href={`/brands/${brand.brandId}/analytics`}
              className="text-xs text-primary inline-flex items-center gap-1"
            >
              View
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Video</p>
                <p className="text-xl font-semibold">{brand.outputs.video}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Images</p>
                <p className="text-xl font-semibold">{brand.outputs.image}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Copy</p>
                <p className="text-xl font-semibold">{brand.outputs.copy}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Content requests</span>
              <span className="font-medium">{brand.contentRequests.total}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function EmptyAnalyticsState() {
  return (
    <Card className="bg-surface border-muted text-center py-12">
      <CardContent>
        <p className="text-lg font-semibold">No brands yet</p>
        <p className="text-sm text-muted-foreground">Create your first brand to unlock analytics and reporting.</p>
        <Link href="/brands/new" className="inline-flex mt-4 text-primary">
          Start onboarding
        </Link>
      </CardContent>
    </Card>
  );
}
