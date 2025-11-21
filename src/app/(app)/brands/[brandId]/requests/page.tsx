'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { CalendarClock, Loader2, PlayCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useBrandContentRequests } from '@/hooks/brand-content';
import { useToast } from '@/hooks/use-toast';
import { processContentRequest } from '@/lib/flows-client/process-content-request';
import type { ContentRequest } from '@/types/firestore';

function formatDate(value?: Date) {
  if (!value) return 'Unknown';
  return value.toLocaleDateString();
}

const statusStyles: Record<string, string> = {
  draft: 'bg-gray-800 text-gray-100',
  queued: 'bg-amber-900 text-amber-50',
  processing: 'bg-blue-900 text-blue-50',
  done: 'bg-emerald-900 text-emerald-50',
  failed: 'bg-red-900 text-red-50',
};

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  const style = statusStyles[status] ?? 'bg-gray-800 text-gray-100';
  return (
    <span className={`text-xs px-2 py-1 rounded-full capitalize ${style}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

function summarizeOutputs(request: ContentRequest) {
  const parts = [] as string[];
  if (request.requestedVideos) parts.push(`${request.requestedVideos} video` + (request.requestedVideos > 1 ? 's' : ''));
  if (request.requestedImages) parts.push(`${request.requestedImages} image${request.requestedImages > 1 ? 's' : ''}`);
  if (request.requestedCopy) parts.push(`${request.requestedCopy} copy`);
  return parts.join(', ') || 'Not specified';
}

export default function BrandRequestsPage() {
  const params = useParams<{ brandId: string }>();
  const brandId = params?.brandId;
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { status, data } = useBrandContentRequests(brandId);
  const requests = data ?? [];

  const handleProcess = async (id: string) => {
    setProcessingId(id);
    try {
      await processContentRequest(id);
      toast({
        title: 'Processing started',
        description: 'The orchestrator will handle this request shortly.',
      });
    } catch (error) {
      toast({
        title: 'Could not trigger processing',
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Content Requests</h1>
        <p className="text-muted-foreground text-sm">
          Track all campaigns and briefs generated for this brand. You can trigger processing for drafts or queued requests.
        </p>
      </div>

      {status === 'loading' && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading requests...
        </div>
      )}

      {status === 'success' && requests.length === 0 && (
        <Card className="bg-surface border-gray-700">
          <CardHeader>
            <CardTitle>No content requests</CardTitle>
            <CardDescription>
              You don’t have any AI content requests yet. Open chat and tell BrandMate what you need.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={`/brands/${brandId}/chat`}>Open chat</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {status === 'success' && requests.length > 0 && (
        <Card className="bg-surface border-gray-700">
          <CardHeader>
            <CardTitle>Requests</CardTitle>
            <CardDescription>Latest requests for this brand.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Goal / Channel</TableHead>
                  <TableHead>Requested outputs</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => {
                  const canProcess = ['draft', 'queued'].includes(request.status ?? '');
                  const isLoading = processingId === request.id;
                  return (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="font-medium">{request.title ?? 'Untitled request'}</div>
                        <div className="text-xs text-muted-foreground">{request.description}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{request.goal ?? 'Campaign goal pending'}</div>
                        {request.channel && (
                          <div className="text-xs text-muted-foreground">{request.channel}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{summarizeOutputs(request)}</TableCell>
                      <TableCell>
                        <StatusBadge status={request.status} />
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <CalendarClock className="h-4 w-4" /> {formatDate(request.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleProcess(request.id!)}
                          disabled={!canProcess || isLoading}
                          className="inline-flex items-center gap-2"
                        >
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
                          Process now
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
