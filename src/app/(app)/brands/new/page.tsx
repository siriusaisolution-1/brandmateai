'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useConfetti } from '@/hooks/use-confetti';
import { run, GenkitError } from '@genkit-ai/flow';
import { performBrandAuditFlow } from '@/ai/flows/brand-audit';

// Define a type for the brandKit state based on the Zod schema
import { z } from 'zod';
const BrandKitSchema = z.object({
    name: z.string(),
    brandVoice: z.string(),
    keyInfo: z.string(),
    suggestedColors: z.array(z.string()),
});
type BrandKit = z.infer<typeof BrandKitSchema>;


export default function NewBrandPage() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { fire } = useConfetti();

  const handleAudit = async () => {
    setIsLoading(true);
    setError(null);
    setBrandKit(null);
    try {
      const result = await run(performBrandAuditFlow, url);
      setBrandKit(result);
      fire();
    } catch (e) {
        if (e instanceof GenkitError) {
            setError(e.message);
        } else {
            setError('An unexpected error occurred.');
        }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <Card className="max-w-2xl mx-auto bg-surface border-gray-700">
        <CardHeader>
          <CardTitle>Create a New Brand</CardTitle>
          <CardDescription>Start by importing from a website, or fill in the details manually below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="url">Import from Website (AI Audit)</Label>
            <div className="flex gap-2">
              <Input id="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" disabled={isLoading} />
              <Button onClick={handleAudit} disabled={isLoading} className="bg-primary hover:bg-primary/90">
                {isLoading ? 'Auditing...' : 'Run AI Audit'}
              </Button>
            </div>
          </div>
          
          {isLoading && <SkeletonLoader />}

          {error && <div className="text-error p-4 bg-error/20 rounded-md">{error}</div>}

          {brandKit && (
            <div className="space-y-4 pt-4 border-t border-gray-700">
                <h3 className="text-lg font-semibold">AI-Generated Brand Kit</h3>
                 <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input defaultValue={brandKit.name} />
                </div>
                 <div className="space-y-2">
                    <Label>Brand Voice</Label>
                    <Input defaultValue={brandKit.brandVoice} />
                </div>
                 <div className="space-y-2">
                    <Label>Key Info</Label>
                    <textarea defaultValue={brandKit.keyInfo} className="w-full bg-background rounded-md p-2" />
                </div>
                <div className="flex items-center gap-4">
                    <Label>Suggested Colors:</Label>
                    <div className="flex gap-2">
                        {brandKit.suggestedColors.map((color: string, i: number) => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-gray-500" style={{ backgroundColor: color }} />
                        ))}
                    </div>
                </div>
                <Button className="w-full bg-success hover:bg-success/90">Save Brand Kit</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const SkeletonLoader = () => (
    <div className="space-y-4 pt-4 border-t border-gray-700 animate-pulse">
      <div className="h-4 bg-gray-700 rounded w-1/4"></div>
      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
      <div className="h-10 bg-gray-700 rounded w-full"></div>
      <div className="flex gap-2">
        <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
        <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
        <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
      </div>
    </div>
);
