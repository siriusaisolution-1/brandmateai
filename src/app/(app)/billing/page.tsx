'use client';

import { useMemo } from 'react';
import { doc } from 'firebase/firestore';
import { captureException } from '@sentry/nextjs';
import { useFirestore, useFirestoreDocData, useUser } from 'reactfire';

import { BmkUsageDisplay } from '@/components/bmk-usage-display';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function BillingSkeleton() {
  return <div className="h-32 animate-pulse rounded-lg bg-muted/50" />;
}

function BillingContent({ userId }: { userId: string }) {
  const firestore = useFirestore();
  const userRef = useMemo(() => doc(firestore, 'users', userId), [firestore, userId]);
  const { status, data, error } = useFirestoreDocData(userRef, { idField: 'id' });

  if (status === 'loading') {
    return <BillingSkeleton />;
  }

  if (status === 'error') {
    captureException(error);
    return (
      <Alert variant="destructive">
        <div className="font-semibold">Unable to load billing</div>
        <AlertDescription>
          Something went wrong while loading your plan data. Please refresh.
        </AlertDescription>
      </Alert>
    );
  }

  const plan = (data as { subscriptionPlan?: string; billingEmail?: string })?.subscriptionPlan ?? 'free';

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Current plan</CardTitle>
          <CardDescription>Upgrade paths are available via Stripe checkout.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold capitalize">{plan}</p>
          <p className="text-sm text-muted-foreground">Need more volume? Contact support and we will enable additional credits.</p>
        </CardContent>
      </Card>
      <div className="rounded-lg border border-border bg-card p-4">
        <BmkUsageDisplay />
      </div>
    </div>
  );
}

export default function BillingPage() {
  const { data: user, status } = useUser();

  if (status !== 'success' || !user) {
    return <BillingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing &amp; limits</h1>
        <p className="text-muted-foreground">Plan, credits and invoices for your workspace.</p>
      </div>
      <BillingContent userId={user.uid} />
    </div>
  );
}
