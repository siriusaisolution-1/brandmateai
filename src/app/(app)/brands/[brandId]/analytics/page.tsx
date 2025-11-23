'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useFirestore, useFirestoreDocData } from 'reactfire';
import { doc } from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Loader2, MessageCircle } from 'lucide-react';
import { fetchBrandAnalytics, createDefaultAnalyticsPeriod } from '@/lib/analytics-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function BrandAnalyticsPage() {
  const params = useParams<{ brandId: string }>();
  const brandId = params?.brandId as string;
  const firestore = useFirestore();
  const { data: brandDoc } = useFirestoreDocData(doc(firestore, 'brands', brandId));
  const { toast } = useToast();

  const { data, status, error } = useQuery({
    queryKey: ['brand-analytics', brandId],
    queryFn: () => fetchBrandAnalytics(brandId, createDefaultAnalyticsPeriod()),
    enabled: Boolean(brandId),
  });

  useEffect(() => {
    if (error) {
      toast({ title: 'Failed to load brand analytics', description: String(error), variant: 'destructive' });
    }
  }, [error, toast]);

  const isLoading = status === 'pending';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading brand analytics...
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="bg-surface border-muted">
        <CardContent className="py-10 text-center space-y-3">
          <p className="text-lg font-semibold">No content yet</p>
          <p className="text-sm text-muted-foreground">Start creating campaigns with the Master AI to see analytics.</p>
          <Button asChild variant="default">
            <Link href={`/brands/${brandId}/chat`} className="inline-flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Open Master AI chat
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const emptyOutputs = data.outputs.total === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Brand analytics</p>
          <h1 className="text-3xl font-bold">{brandDoc?.name ?? 'Brand'}</h1>
          <p className="text-sm text-muted-foreground">Last 30 days</p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          {data.outputs.total} outputs
        </Badge>
      </div>

      {emptyOutputs ? (
        <Card className="bg-surface border-muted">
          <CardContent className="py-8 text-center space-y-3">
            <p className="text-lg font-semibold">No content yet</p>
            <p className="text-sm text-muted-foreground">Generate your first video, image, or copy to populate analytics.</p>
            <div className="flex justify-center gap-3">
              <Button asChild>
                <Link href={`/brands/${brandId}/chat`} className="inline-flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Open Master AI chat
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/media-library/${brandId}`}>Open library</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-surface border-muted">
            <CardHeader>
              <CardTitle className="text-lg">Outputs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold">{data.outputs.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Video</span>
                <span className="font-semibold">{data.outputs.video}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Images</span>
                <span className="font-semibold">{data.outputs.image}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Copy</span>
                <span className="font-semibold">{data.outputs.copy}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-muted">
            <CardHeader>
              <CardTitle className="text-lg">Content requests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold">{data.contentRequests.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-semibold">{data.contentRequests.completed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Pending</span>
                <span className="font-semibold">{data.contentRequests.pending}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-muted md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Tasks</p>
                  <p className="text-xl font-semibold">{data.usage?.totalTasks ?? 0}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Video tasks</p>
                  <p className="text-xl font-semibold">{data.usage?.videoTasks ?? 0}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Image tasks</p>
                  <p className="text-xl font-semibold">{data.usage?.imageTasks ?? 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
