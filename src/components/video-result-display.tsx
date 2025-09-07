// src/components/video-result-display.tsx
'use client';

import { useEffect, useState } from 'react';
import { useFlow } from '@/lib/genkit-react';
import { Loader2 } from 'lucide-react';
import { checkVideoStatusFlow } from '@/ai/flows/check-video-status';

interface VideoResultDisplayProps {
  taskId: string;
}

export function VideoResultDisplay({ taskId }: VideoResultDisplayProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState('processing');
  
  const [runCheckStatus, { data, error }] = useFlow(checkVideoStatusFlow);

  useEffect(() => {
    if (!taskId) return;

    const intervalId = setInterval(() => {
      runCheckStatus({ taskId });
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId);
  }, [taskId, runCheckStatus]);

  useEffect(() => {
    if (data?.status === 'succeeded') {
      setVideoUrl(data.videoUrl || null);
      setStatus('succeeded');
    } else if (data?.status === 'failed') {
      setStatus('failed');
    }
  }, [data]);

  if (status === 'processing' && !data) {
    return (
      <div className="flex items-center space-x-2 mt-4">
        <Loader2 className="animate-spin" />
        <span>Processing video... This may take a few minutes.</span>
      </div>
    );
  }

  if (status === 'failed' || error) {
    return <p className="text-red-500 mt-4">Video generation failed. Please try again.</p>;
  }

  if (videoUrl) {
    return (
      <div className="mt-4">
        <h3 className="text-lg font-semibold">Your video is ready!</h3>
        <video src={videoUrl} controls autoPlay className="w-full rounded-md mt-2" />
      </div>
    );
  }

  return null;
}
