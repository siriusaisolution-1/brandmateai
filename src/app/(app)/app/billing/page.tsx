'use client';

import { useEffect, useMemo, useState, type ElementType } from 'react';
import { CreditCard, Image as ImageIcon, Video } from 'lucide-react';
import { useFirestore, useUser, useFirestoreDocData } from 'reactfire';
import { doc } from 'firebase/firestore';

import { BrandSelector } from '@/components/brand-selector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { UserProfile } from '@/types/firestore';
import { PLAN_DEFINITIONS, getPlanForUser } from '@/lib/billing/plans';
import { ClientUsageSnapshot, getCurrentYearMonth, getOrCreateClientUsageSnapshot } from '@/lib/billing/usage';

function UsageMeter({ label, icon: Icon, value, limit }: { label: string; icon: ElementType; value: number; limit: number }) {
  const pct = limit > 0 ? Math.min(100, (value / limit) * 100) : 0;
  return (
    <Card className="bg-surface border-muted">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" /> {label}
        </CardTitle>
        <span className="text-xs text-muted-foreground">
          {value} / {limit}
        </span>
      </CardHeader>
      <CardContent>
        <Progress value={pct} className="h-2" />
        <p className="mt-2 text-xs text-muted-foreground">Resets monthly.</p>
      </CardContent>
    </Card>
  );
}

export default function BillingPage() {
  const { data: firebaseUser } = useUser();
  const firestore = useFirestore();
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [usage, setUsage] = useState<ClientUsageSnapshot | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(false);

  const userRef = useMemo(
    () => (firebaseUser ? doc(firestore, 'users', firebaseUser.uid) : doc(firestore, 'users', '__loading__')),
    [firestore, firebaseUser],
  );
  const { data: userProfile } = useFirestoreDocData(userRef, { idField: 'id' });

  const plan = useMemo(() => getPlanForUser(userProfile as UserProfile | undefined), [userProfile]);

  useEffect(() => {
    async function loadUsage() {
      if (!firebaseUser || !selectedBrand) {
        return;
      }
      setLoadingUsage(true);
      const snapshot = await getOrCreateClientUsageSnapshot(firestore, firebaseUser.uid, selectedBrand, getCurrentYearMonth());
      setUsage(snapshot);
      setLoadingUsage(false);
    }

    void loadUsage();
  }, [firebaseUser, firestore, selectedBrand]);

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-copy-primary">Billing & Usage</h1>
          <p className="text-muted-foreground">Track your plan limits and monthly AI/media usage.</p>
        </div>
        <Button variant="outline" onClick={() => alert('Upgrade flows coming soon')}>
          Upgrade plan
        </Button>
      </div>

      <Card className="bg-surface border-muted">
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Your subscription controls how many assets you can generate each month.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xl font-semibold">{plan.label}</p>
            <p className="text-sm text-muted-foreground">{plan.description ?? 'Standard BrandMate plan.'}</p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div>
              <p className="font-semibold text-copy-primary">Videos</p>
              <p>{plan.limits.maxVideosPerMonth} / month</p>
            </div>
            <div>
              <p className="font-semibold text-copy-primary">Images</p>
              <p>{plan.limits.maxImagesPerMonth} / month</p>
            </div>
            <div>
              <p className="font-semibold text-copy-primary">Requests</p>
              <p>{plan.limits.maxRequestsPerMonth} / month</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-surface border-muted">
        <CardHeader>
          <CardTitle>Active brand</CardTitle>
          <CardDescription>Select a brand to view current month usage.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <BrandSelector onBrandSelected={setSelectedBrand} />
          {!selectedBrand && <p className="text-sm text-muted-foreground">Choose a brand to load usage.</p>}
        </CardContent>
      </Card>

      {selectedBrand && (
        <div className="grid gap-4 md:grid-cols-3">
          <UsageMeter
            label="Videos this month"
            icon={Video}
            value={usage?.videosGenerated ?? 0}
            limit={plan.limits.maxVideosPerMonth}
          />
          <UsageMeter
            label="Images this month"
            icon={ImageIcon}
            value={usage?.imagesGenerated ?? 0}
            limit={plan.limits.maxImagesPerMonth}
          />
          <UsageMeter
            label="Content requests"
            icon={CreditCard}
            value={usage?.requestsProcessed ?? 0}
            limit={plan.limits.maxRequestsPerMonth}
          />
        </div>
      )}

      {loadingUsage && <p className="text-sm text-muted-foreground">Loading usage...</p>}
      {selectedBrand && !loadingUsage && usage && (
        <p className="text-xs text-muted-foreground">Usage resets each calendar month. Upgrading increases your monthly headroom.</p>
      )}

      <Card className="bg-surface border-muted">
        <CardHeader>
          <CardTitle>Upgrade options</CardTitle>
          <CardDescription>Starter, Pro and Agency tiers balance usage caps with predictable pricing.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {Object.values(PLAN_DEFINITIONS).map((planDef) => (
            <div key={planDef.id} className="rounded-lg border border-muted p-4">
              <p className="text-lg font-semibold">{planDef.label}</p>
              <p className="text-sm text-muted-foreground">{planDef.description}</p>
              <ul className="mt-3 space-y-1 text-sm">
                <li>Videos: {planDef.limits.maxVideosPerMonth} / mo</li>
                <li>Images: {planDef.limits.maxImagesPerMonth} / mo</li>
                <li>Requests: {planDef.limits.maxRequestsPerMonth} / mo</li>
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
