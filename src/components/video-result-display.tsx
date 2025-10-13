// src/components/video-result-display.tsx
'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { checkVideoStatus } from '@/lib/flows-client';

interface VideoResultDisplayProps {
  taskId: string;
}

export function VideoResultDisplay({ taskId }: VideoResultDisplayProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState('processing');
  
  useEffect(() => {
    if (!taskId) return;

    let isActive = true;

    const poll = async () => {
      try {
        const result = await checkVideoStatus({ taskId });
        if (!isActive) return;

        if (result.status === 'succeeded') {
          setVideoUrl(result.videoUrl || null);
          setStatus('succeeded');
        } else if (result.status === 'failed') {
          setStatus('failed');
        } else {
          setStatus('processing');
        }
      } catch (pollError) {
        if (!isActive) return;
        console.error('Video status polling failed:', pollError);
        setStatus('failed');
      }
    };

    poll();
    const intervalId = setInterval(poll, 5000); // Poll every 5 seconds

    return () => {
      isActive = false;
      clearInterval(intervalId);
    };
  }, [taskId]);

  if (status === 'processing' && !videoUrl) {
    return (
      <div className="flex items-center space-x-2 mt-4">
        <Loader2 className="animate-spin" />
        <span>Processing video... This may take a few minutes.</span>
      </div>
    );
  }

  if (status === 'failed') {
    return <p className="text-red-500 mt-4">Video generation failed. Please try again.</p>;
  }

  if (videoUrl) {
    return (
      <div className="mt-4">
        <h3 className="text-lg font-semibold">Your video is ready!</h3>
        <video src={videoUrl} controls autoPlay className="w-full rounded-md mt-2">
          {/* zašto: Provide an interim caption track until Novita returns authored captions. */}
          <track
            kind="captions"
            src="/captions/placeholder.vtt"
            srcLang="en"
            label="English captions"
            default
          />
        </video>
      </div>
    );
  }

  return null;
}
