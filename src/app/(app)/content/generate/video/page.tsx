// src/app/(app)/content/generate/video/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFlow } from '@genkit-ai/react';
// We will create this component in the next step
import { VideoResultDisplay } from '@/components/video-result-display'; 

export default function GenerateVideoPage() {
  const [prompt, setPrompt] = useState('');
  const [imageUrls, setImageUrls] = useState(['']);
  const [duration, setDuration] = useState(6);
  const [taskId, setTaskId] = useState<string | null>(null);

  const [generateVideo, { data, error, loading }] = useFlow('generateVideoFlow');

  const handleGenerate = async () => {
    // Basic validation
    if (!prompt || imageUrls.some(url => !url)) {
      alert('Please fill in all fields.');
      return;
    }

    const result = await generateVideo({
      userPrompt: prompt,
      imageUrls: imageUrls,
      brandId: 'your-brand-id', // Replace with dynamic brand ID
      userId: 'your-user-id',   // Replace with dynamic user ID
      duration,
    });

    if (result) {
      setTaskId(result);
    }
  };
  
  const addImageUrlInput = () => {
    setImageUrls([...imageUrls, '']);
  };

  const handleImageUrlChange = (index: number, value: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>AI Video Generator</CardTitle>
          <CardDescription>Create stunning videos from images and a text prompt.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Your Prompt</Label>
            <Textarea 
              id="prompt" 
              placeholder="e.g., A futuristic car driving through a neon-lit city" 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Reference Image URLs</Label>
            {imageUrls.map((url, index) => (
              <Input 
                key={index}
                type="url"
                placeholder="https://example.com/image.jpg"
                value={url}
                onChange={(e) => handleImageUrlChange(index, e.target.value)}
              />
            ))}
            <Button variant="outline" size="sm" onClick={addImageUrlInput}>Add another image</Button>
          </div>

           <div className="space-y-2">
            <Label>Video Duration</Label>
            <div>
              <Button onClick={() => setDuration(6)} variant={duration === 6 ? 'secondary' : 'outline'}>6 seconds</Button>
              <Button onClick={() => setDuration(12)} variant={duration === 12 ? 'secondary' : 'outline'} className="ml-2">12 seconds</Button>
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Video'}
          </Button>

          {error && <p className="text-red-500">{error.message}</p>}
          
          {taskId && <VideoResultDisplay taskId={taskId} />}

        </CardContent>
      </Card>
    </div>
  );
}
