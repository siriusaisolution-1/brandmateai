'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Film, Image as ImageIcon, Layers, Loader2, StickyNote, Video } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useBrandOutputs } from '@/hooks/brand-content';
import { useToast } from '@/hooks/use-toast';
import type { Output } from '@/types/firestore';

const tabs = [
  { key: 'all', label: 'All', icon: Layers },
  { key: 'video', label: 'Videos', icon: Video },
  { key: 'image', label: 'Images', icon: ImageIcon },
  { key: 'copy', label: 'Copy', icon: StickyNote },
] as const;

type TabKey = (typeof tabs)[number]['key'];

function OutputBadge({ label }: { label: string }) {
  return <span className="text-xs rounded-full bg-gray-800 px-2 py-1 text-gray-200">{label}</span>;
}

function formatDate(value?: Date) {
  if (!value) return 'Unknown date';
  return value.toLocaleString();
}

function CopyPreview({ output }: { output: Output & { createdAt?: Date; id: string } }) {
  const snippet = output.text?.slice(0, 150) ?? output.summary ?? 'No text available';
  const { toast } = useToast();

  const handleCopy = () => {
    if (!output.text) return;
    void navigator.clipboard.writeText(output.text);
    toast({
      title: 'Copied',
      description: 'Full copy has been copied to your clipboard.',
    });
  };

  return (
    <Card className="bg-surface border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <StickyNote className="h-4 w-4" />
          {output.title ?? 'Copy draft'}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {snippet}
          {output.text && output.text.length > 150 ? '...' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex gap-2">
          <OutputBadge label="Copy" />
          {output.platform && <OutputBadge label={output.platform} />}
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary" size="sm">
              View
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{output.title ?? 'Copy asset'}</DialogTitle>
              <DialogDescription>{formatDate(output.createdAt)}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <p className="text-sm whitespace-pre-line">{output.text ?? 'No content available.'}</p>
              <Button onClick={handleCopy} disabled={!output.text}>
                Copy to clipboard
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

function MediaCard({ output }: { output: Output & { createdAt?: Date; id: string } }) {
  const isVideo = output.type === 'video';
  return (
    <Card className="bg-surface border-gray-700 overflow-hidden">
      <div className="relative w-full aspect-video">
        {output.thumbnailUrl || output.mediaUrl ? (
          <Image
            src={(output.thumbnailUrl ?? output.mediaUrl) as string}
            alt={output.title ?? 'Asset thumbnail'}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 33vw, 100vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-900 text-muted-foreground">
            {isVideo ? <Film className="h-6 w-6" /> : <ImageIcon className="h-6 w-6" />}
          </div>
        )}
      </div>
      <CardHeader className="space-y-1">
        <CardTitle className="text-base flex items-center gap-2">
          {isVideo ? <Video className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
          {output.title ?? 'Untitled asset'}
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          {output.platform ?? 'Generic'} • {formatDate(output.createdAt)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-between text-xs text-muted-foreground">
        <div className="flex gap-2">
          <OutputBadge label={isVideo ? 'Video' : 'Image'} />
          {output.contentRequestId && (
            <OutputBadge label={`Request ${output.contentRequestId.slice(0, 6)}`} />
          )}
        </div>
        {output.status && <span className="capitalize">{output.status}</span>}
      </CardContent>
    </Card>
  );
}

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

  const [tab, setTab] = useState<TabKey>('all');

  const { status, data } = useBrandOutputs(brandId, {
    type: tab === 'all' ? undefined : tab,
  });

  const outputs = useMemo(() => data ?? [], [data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Asset Library</h1>
        <p className="text-muted-foreground text-sm">
          All generated videos, images and copy for this brand. Use the filters to quickly scan what the AI produced.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={tab === key ? 'default' : 'secondary'}
            onClick={() => setTab(key)}
            className="flex items-center gap-2"
          >
            <Icon className="h-4 w-4" />
            {label}
          </Button>
        ))}
      </div>

      {status === 'loading' && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading assets...
        </div>
      )}

      {status === 'success' && outputs.length === 0 && (
        <Card className="bg-surface border-gray-700">
          <CardHeader>
            <CardTitle>No assets yet</CardTitle>
            <CardDescription>
              Ask the Master AI to create new content and it will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={`/brands/${brandId}/chat`}>Open chat</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {status === 'success' && outputs.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" data-testid="asset-grid">
          {outputs.map((output) => {
            if (output.type === 'copy') {
              return <CopyPreview key={output.id} output={output} />;
            }
            return <MediaCard key={output.id} output={output} />;
          })}
        </div>
      )}
    </div>
  );
}