'use client';

import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useFlow } from '@/lib/genkit-react';
import { trainLoraModelFlow, getUploadUrlFlow } from '@/ai/flows/train-lora-model';
import { Loader2 } from 'lucide-react';

export function LoraTrainingManager({ brandId, userId }: { brandId: string; userId: string }) {
  const [files, setFiles] = useState<File[]>([]);
  const [modelName, setModelName] = useState(`${brandId}_style`);

  const [runTrainModel, trainingState] = useFlow(trainLoraModelFlow);
  const [runGetUploadUrl, uploadUrlState] = useFlow(getUploadUrlFlow);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  };

  const handleTrainModel = async () => {
    if (files.length < 10) {
      alert('Please upload at least 10 images to train the model.');
      return;
    }

    alert('This is a high-cost operation. Starting the training process...');

    try {
      const uploadPromises = files.map(async (file) => {
        const urlResponse: any = await runGetUploadUrl({ file_extension: 'png' });
        if (urlResponse?.upload_url) {
          await fetch(urlResponse.upload_url, { method: 'PUT', body: file });
        }
        return urlResponse?.assets_id ?? null;
      });

      const assetIds = (await Promise.all(uploadPromises)).filter(Boolean) as string[];

      await runTrainModel({
        userId,
        brandId,
        modelName,
        imageAssetIds: assetIds,
        trainingType: 'style',
      });

      alert('Training has started! We will notify you when it is complete.');
    } catch (error) {
      console.error('Training failed:', error);
      alert('An error occurred during the training process.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personalized AI Model</CardTitle>
        <CardDescription>
          Train a custom AI model on your brand&apos;s style. Upload 10-20 high-quality images
          (products, brand visuals) for the best results.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="model-name">Model Name</Label>
          <Input id="model-name" value={modelName} onChange={(e) => setModelName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="images">Upload Images (10+)</Label>
          <Input id="images" type="file" multiple onChange={handleFileChange} />
        </div>
        <Button onClick={handleTrainModel} disabled={trainingState.loading || uploadUrlState.loading}>
          {(trainingState.loading || uploadUrlState.loading) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Train Personal Model
        </Button>
      </CardContent>
    </Card>
  );
}