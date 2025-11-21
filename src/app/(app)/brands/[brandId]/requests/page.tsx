'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { CalendarClock, Loader2, PlayCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { useBrandContentRequests } from '@/hooks/brand-content';
import { useToast } from '@/hooks/use-toast';
import { processContentRequest } from '@/lib/flows-client/process-content-request';
import type { ContentRequest } from '@/types/firestore';

const statusVariant: Record<string, string> = {
  completed: 'success',
  done: 'success',
  processing: 'secondary',
  queued: 'outline',
  draft: 'outline',
  failed: 'destructive',
  needs_revision: 'destructive',
};

function formatDate(value?: Date) {
  if (!value) return 'Unknown';
  try {
    return value.toLocaleDateString();
  } catch {
    return 'Unknown';
  }
}

function summarizeOutputs(request: ContentRequest) {
  const parts: string[] = [];
  if (request.requestedVideos)
    parts.push(
      `${request.requestedVideos} video${request.requestedVideos > 1 ? 's' : ''}`,
    );
  if (request.requestedImages)
    parts.push(
      `${request.requestedImages} image${request.requestedImages > 1 ? 's' : ''}`,
    );
  if (request.requestedCopy)
    parts.push(`${request.requestedCopy} copy`);
  return parts.join(', ') || 'Not specified';
}

export default function BrandRequestsPage() {
  const params = useParams<{ brandId: string }>();
  const brandId = params?.brandId as string | undefined;

  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { status, data, error } = useBrandContentRequests(brandId);
  const requests = useMemo(
    () =>
      (data as Array<
        ContentRequest & { id: string; title?: string; status?: string; summary?: string }
      > | undefined) ?? [],
    [data],
  );

  const resolvedStatus =
    status === 'loading' ? 'loading' : error ? 'error' : 'success';

  const handleProcess = async (id: string) => {
    setProcessingId(id);
    try {
      await processContentRequest(id);
      toast({
        title: 'Processing started',
        description: 'The orchestrator will handle this request shortly.',
      });
    } catch (err) {
      toast({
        title: 'Could not trigger processing',
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Content Requests</h1>
        <p className="text-sm text-muted-foreground">
          Track generation requests for this brand. You can trigger processing for drafts or queued requests.
        </p>
      </div>

      {resolvedStatus === 'loading' && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-24 rounded-md bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {resolvedStatus === 'error' && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load requests. Please try again later.
        </div>
      )}

      {resolvedStatus === 'success' && requests.length === 0 && (
        <Card className="bg-surface border-muted">
          <CardHeader>
            <CardTitle>No content requests yet</CardTitle>
            <CardDescription>
              Use the chat or generation tools to create your first brief.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={`/brands/${brandId}/chat`}>Open chat</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {resolvedStatus === 'success' && requests.length > 0 && (
        <div className="space-y-3">
          {requests.map((req) => {
            const statusKey = (req.status ?? 'queued').toLowerCase();
            const variant =
              (statusVariant[statusKey] as any) ?? 'outline';
            const canProcess = ['draft', 'queued'].includes(statusKey);
            const isLoading = processingId === req.id;

            return (
              <Card key={req.id} className="bg-surface border-muted">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-base">
                      {req.title ?? 'Untitled request'}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {req.description ?? req.summary ?? 'Awaiting generation steps...'}
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant={variant}
                      className="uppercase text-[10px]"
                    >
                      {statusKey.replace('_', ' ')}
                    </Badge>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleProcess(req.id)}
                      disabled={!canProcess || isLoading}
                      className="inline-flex items-center gap-2"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <PlayCircle className="h-4 w-4" />
                      )}
                      Process now
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <div className="text-muted-foreground">
                    Requested outputs: <span className="text-foreground">{summarizeOutputs(req)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <CalendarClock className="h-4 w-4" />
                    {formatDate(req.createdAt)}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}