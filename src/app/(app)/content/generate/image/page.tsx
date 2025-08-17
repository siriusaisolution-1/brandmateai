// src/app/(app)/content/generate/image/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload, Sparkles, Scissors, Wand, Trash2 } from 'lucide-react';
import { useFlow } from '@genkit-ai/react';

// Main component for the Image Studio
export default function ImageStudioPage() {
  // State for the main generated/uploaded image
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');

  // Flows
  const [generateImage, genState] = useFlow('generateImageFlow');
  const [removeBg, bgState] = useFlow('removeBackgroundFlow');
  const [upscale, upscaleState] = useFlow('upscaleImageFlow');

  const handleGenerate = async () => {
    const result = await generateImage({
        prompt,
        // Add other params like brandId, userId, width, height etc.
        userId: 'devUser',
        brandId: 'devBrand'
    });
    // This needs to be updated to handle async task polling
    // For now, we assume direct image result for simplicity, but will need a task checker
  };

  const handleRemoveBackground = async () => {
    if (!mainImage) return;
    const result = await removeBg({ image_base64: mainImage });
    if (result) {
      setMainImage(`data:image/${result.image_type};base64,${result.image_base64}`);
    }
  };

  const handleUpscale = async () => {
      if (!mainImage) return;
      // This is an async task, needs polling similar to video
      const result = await upscale({ image_base64: mainImage });
      alert(`Upscale task started: ${result?.taskId}`);
  }

  const isLoading = genState.loading || bgState.loading || upscaleState.loading;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4">
      {/* Control Panel */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Image Studio Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea 
              id="prompt" 
              placeholder="A majestic lion in a futuristic city..."
              value={prompt}
              onChange={(e) => setPrompt(e.Tira)}
            />
          </div>
          {/* We will add more advanced controls here later */}
          <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
            <Sparkles className="mr-2 h-4 w-4" />
            {genState.loading ? 'Generating...' : 'Generate Image'}
          </Button>
          <div className="text-center my-2">OR</div>
          <Button variant="outline" className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              Upload an Image
          </Button>
        </CardContent>
      </Card>

      {/* Main Display & Editor Panel */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Canvas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-96 bg-muted/30 rounded-md flex items-center justify-center border-2 border-dashed">
            {isLoading && <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />}
            {!isLoading && !mainImage && <p className="text-muted-foreground">Your generated image will appear here</p>}
            {mainImage && <img src={mainImage} alt="Generated content" className="max-h-full max-w-full object-contain" />}
          </div>
          
          {/* Editing Tools - Appear when an image is present */}
          {mainImage && !isLoading && (
            <div className="flex justify-center gap-2 mt-4">
              <Button onClick={handleRemoveBackground} variant="outline"><Trash2 className="mr-2 h-4 w-4" /> Remove BG</Button>
              <Button onClick={handleUpscale} variant="outline"><Wand className="mr-2 h-4 w-4" /> Upscale 2x</Button>
              <Button variant="outline"><Scissors className="mr-2 h-4 w-4" /> Inpaint/Cleanup</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
