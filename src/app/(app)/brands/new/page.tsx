'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button'; // <-- Updated import
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // <-- Updated import
import { Input } from '@/components/ui/input'; // <-- Updated import
import { Label } from '@/components/ui/label'; // <-- Updated import
import { Textarea } from '@/components/ui/textarea'; // <-- Assuming this is also a shadcn component
import { useConfetti } from '@/hooks/use-confetti';
import { useToast } from "@/hooks/use-toast";
import { track } from '@/lib/analytics';
import { performBrandAudit, saveBrand } from '@/lib/flows-client';
import type { BrandAuditResponse } from '@/lib/flows-client';

// ... (schema and type definitions are unchanged)

export default function NewBrandPage() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [brandKit, setBrandKit] = useState<BrandAuditResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [competitors, setCompetitors] = useState('');
  const [industry, setIndustry] = useState('');
  const [auditSource, setAuditSource] = useState('manual');
  const { fire } = useConfetti();
  const { toast } = useToast();

  const handleAudit = async () => {
    if (!url) {
      setError('Please enter a brand URL before running the audit.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const audit = await performBrandAudit({ url, brandId: 'preview' });
      setBrandKit(audit);
      setAuditSource('ai');
      track('brand_audit_run', { url });
      toast({ title: 'Audit complete', description: 'We generated a draft brand kit from the provided URL.' });
    } catch (auditError) {
      console.error('Brand audit failed:', auditError);
      setError('We could not audit that URL. Please double-check it and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBrand = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const competitorWebsites = competitors
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean);

      const payload = {
        name: brandKit?.name || 'Untitled Brand',
        brandVoice: brandKit?.brandVoice || '',
        keyInfo: brandKit?.keyInfo || '',
        colors: brandKit?.suggestedColors || [],
        industry: industry || undefined,
        competitorWebsites,
      };

      const response = await saveBrand(payload);

      fire();
      track('brand_saved', { brandId: response.brandId, source: auditSource });
      toast({ title: 'Brand saved', description: 'Your brand profile is ready to review.' });
    } catch (saveError) {
      console.error('Saving brand failed:', saveError);
      setError('We could not save the brand right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <Card className="max-w-2xl mx-auto"> {/* Using shadcn Card */}
        <CardHeader>
          <CardTitle>Create a New Brand</CardTitle>
          <CardDescription>Start by importing from a website, or fill in the details manually below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="url">Import from Website (AI Audit)</Label>
            <div className="flex gap-2">
              <Input id="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" disabled={isLoading} />
              <Button
                onClick={handleAudit}
                disabled={isLoading}
                data-testid="brand-audit-button"
              >
                {isLoading ? 'Auditing...' : 'Run AI Audit'}
              </Button>
            </div>
          </div>
          
          {error && (
            <p className="text-sm text-red-500" role="alert">
              {error}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="E-commerce"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="competitors">Key Competitors</Label>
            <Textarea
              id="competitors"
              value={competitors}
              onChange={(e) => setCompetitors(e.target.value)}
              placeholder="https://competitor-a.com, https://competitor-b.com"
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setBrandKit(null)} disabled={isLoading}>
              Reset
            </Button>
            <Button
              onClick={handleSaveBrand}
              disabled={isLoading}
              data-testid="brand-save-button"
            >
              {isLoading ? 'Saving...' : 'Save Brand'}
            </Button>
          </div>

          {/* zašto: Keep future customization entrypoint while ensuring lint sees all state in use. */}

        </CardContent>
      </Card>
    </div>
  );
}

// ... (SkeletonLoader is unchanged)
