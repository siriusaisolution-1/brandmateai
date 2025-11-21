'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useConfetti } from '@/hooks/use-confetti';
import { useToast } from "@/hooks/use-toast";
import { track } from '@/lib/analytics';
import { performBrandAudit, saveBrand } from '@/lib/flows-client';
import type { BrandAuditResponse, SaveBrandRequest } from '@/lib/flows-client';
import { getAllowedBrandCountForUser, getPlanConfig } from '@/lib/billing/plans';
import type { User as AppUser } from '@/types/firestore';
import { useFirestore, useFirestoreDocData, useUser } from 'reactfire';
import { collection, doc, getCountFromServer, query, where } from 'firebase/firestore';

export default function NewBrandPage() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [brandKit, setBrandKit] = useState<BrandAuditResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [competitors, setCompetitors] = useState('');
  const [industry, setIndustry] = useState('');
  const [auditSource, setAuditSource] = useState('manual');
  const [currentBrandCount, setCurrentBrandCount] = useState<number | null>(null);
  const [allowedBrandCountOverride, setAllowedBrandCountOverride] = useState<number | null>(null);
  const [showExtraModal, setShowExtraModal] = useState(false);
  const [pendingExtraPayload, setPendingExtraPayload] = useState<SaveBrandRequest | null>(null);
  const { fire } = useConfetti();
  const { toast } = useToast();

  const firestore = useFirestore();
  const { data: authUser } = useUser();
  const userRef = useMemo(() => (authUser ? doc(firestore, 'users', authUser.uid) : null), [authUser, firestore]);
  const { data: userDoc } = useFirestoreDocData(userRef ?? undefined, { idField: 'id' });
  const appUser = (userDoc as AppUser | undefined) ?? undefined;

  const plan = getPlanConfig(appUser?.subscriptionPlan);
  const allowedBrandCount =
    allowedBrandCountOverride ?? (appUser ? getAllowedBrandCountForUser(appUser) : plan.baseBrandLimit);

  useEffect(() => {
    if (!authUser) return;

    const fetchCount = async () => {
      const baseQuery = query(collection(firestore, 'brands'), where('ownerId', '==', authUser.uid));
      const countSnap = await getCountFromServer(baseQuery);
      setCurrentBrandCount(countSnap.data().count);
    };

    void fetchCount();
  }, [authUser, firestore]);

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

  const submitBrand = async (payload: SaveBrandRequest, asExtraBrand: boolean) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await saveBrand({
        ...payload,
        markAsExtraBrand: asExtraBrand,
        acquireExtraBrandSlot: asExtraBrand,
      });

      fire();
      track('brand_saved', { brandId: response.brandId, source: auditSource, isExtraBrand: asExtraBrand });
      toast({
        title: asExtraBrand ? 'Extra brand added' : 'Brand saved',
        description: asExtraBrand
          ? 'We added an extra brand slot and created your brand.'
          : 'Your brand profile is ready to review.',
      });

      setCurrentBrandCount((prev) => (prev ?? 0) + 1);
      if (asExtraBrand) {
        setAllowedBrandCountOverride((allowedBrandCount ?? 0) + 1);
      }
      setPendingExtraPayload(null);
    } catch (saveError) {
      console.error('Saving brand failed:', saveError);
      setError('We could not save the brand right now. Please try again.');
    } finally {
      setIsLoading(false);
      setShowExtraModal(false);
    }
  };

  const handleSaveBrand = async (asExtraBrand: boolean = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const competitorWebsites = competitors
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean);

      const payload: SaveBrandRequest = {
        name: brandKit?.name || 'Untitled Brand',
        brandVoice: brandKit?.brandVoice || '',
        keyInfo: brandKit?.keyInfo || '',
        colors: brandKit?.suggestedColors || [],
        industry: industry || undefined,
        competitorWebsites,
      };

      const currentCount = currentBrandCount ?? 0;
      const allowedCount = allowedBrandCount;

      if (currentCount >= allowedCount) {
        if (!plan.id.startsWith('agency')) {
          setError("You've reached your brand limit. Upgrade to Agency to add more brands.");
          return;
        }

        setPendingExtraPayload(payload);
        setShowExtraModal(true);
        return;
      }

      await submitBrand(payload, asExtraBrand);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-4">
      <div className="flex flex-col gap-2">
        <span className="text-sm text-muted-foreground">Brands</span>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{currentBrandCount ?? '–'} brands</span>
          <span className="text-xs">/</span>
          <span className="font-semibold text-foreground">{allowedBrandCount} allowed</span>
          <span className="text-xs text-muted-foreground">Plan: {plan.name}</span>
        </div>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create a New Brand</CardTitle>
          <CardDescription>Start by importing from a website, or fill in the details manually below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="url">Import from Website (AI Audit)</Label>
            <div className="flex gap-2">
              <Input id="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" disabled={isLoading} />
              <Button onClick={handleAudit} disabled={isLoading} data-testid="brand-audit-button">
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
            <Button onClick={() => handleSaveBrand(false)} disabled={isLoading} data-testid="brand-save-button">
              {isLoading ? 'Saving...' : 'Save Brand'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showExtraModal} onOpenChange={setShowExtraModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add extra brand (+${plan.extraBrandPriceUsd ?? 30} USD/month)</AlertDialogTitle>
            <AlertDialogDescription>
              You reached the included brand limit for your Agency plan. Confirm to add an extra brand slot (includes +20
              videos & +100 images per month) and create this brand.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isLoading || !pendingExtraPayload}
              onClick={() => pendingExtraPayload && submitBrand(pendingExtraPayload, true)}
            >
              Confirm &amp; Add Brand
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
