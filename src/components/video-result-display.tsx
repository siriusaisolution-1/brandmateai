// src/components/video-result-display.tsx
'use client';

import { useEffect, useState } from 'react';
import { useFlow } from '@genkit-ai/react';
import { Loader2 } from 'lucide-react';

interface VideoResultDisplayProps {
  taskId: string;
}

export function VideoResultDisplay({ taskId }: VideoResultDisplayProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState('processing');
  
  const [checkStatus, { data, error }] = useFlow('checkVideoStatusFlow');

  useEffect(() => {
    if (!taskId) return;

    const intervalId = setInterval(async () => {
      const result = await checkStatus({ taskId });
      if (result?.status === 'succeeded') {
        setVideoUrl(result.videoUrl || null);
        setStatus('succeeded');
        clearInterval(intervalId);
      } else if (result?.status === 'failed') {
        setStatus('failed');
        clearInterval(intervalId);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId);
  }, [taskId, checkStatus]);

  if (status === 'processing') {
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
