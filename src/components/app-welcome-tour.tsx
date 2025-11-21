'use client';

import { useMemo, useState } from 'react';
import { useFirestore, useFirestoreDocData, useUser } from 'reactfire';
import { doc, setDoc } from 'firebase/firestore';
import { captureException } from '@sentry/nextjs';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { shouldShowAppTour, type OnboardingAware } from '@/lib/onboarding';

function TourContent({ userId }: { userId: string }) {
  const firestore = useFirestore();
  const userRef = useMemo(() => doc(firestore, 'users', userId), [firestore, userId]);
  const { status, data, error } = useFirestoreDocData(userRef, { idField: 'id' });
  const [isSaving, setIsSaving] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (status === 'error') {
    captureException(error);
    return null;
  }

  const showTour =
    status === 'success' && shouldShowAppTour(data as OnboardingAware) && !dismissed;

  if (!showTour) {
    return null;
  }

  const handleDismiss = async () => {
    setIsSaving(true);
    setLocalError(null);
    try {
      await setDoc(
        userRef,
        {
          onboardingFlags: {
            ...(data as OnboardingAware | undefined)?.onboardingFlags,
            hasSeenAppTour: true,
          },
        },
        { merge: true },
      );
      setDismissed(true);
    } catch (err) {
      captureException(err);
      setLocalError('Unable to save your preference. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal
      aria-label="BrandMate welcome tour"
      data-testid="app-welcome-tour"
    >
      <Card className="max-w-xl bg-gray-950 text-gray-100">
        <CardHeader>
          <CardTitle>Welcome to BrandMate v3</CardTitle>
          <CardDescription className="text-gray-300">
            Quick orientation for your first session. You can revisit this later in Settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <ol className="list-decimal space-y-3 pl-4">
            <li>
              <span className="font-semibold">Chat with the Master AI</span> – brief the orchestrator to plan your next campaigns.
            </li>
            <li>
              <span className="font-semibold">Media Library</span> – review every generated visual and upload your own assets.
            </li>
            <li>
              <span className="font-semibold">Requests</span> – track the status of each ask you logged via chat or forms.
            </li>
            <li>
              <span className="font-semibold">Billing &amp; Limits</span> – stay on top of usage, invoices and credits.
            </li>
          </ol>
          {localError && <p className="text-sm text-red-300">{localError}</p>}
          <div className="flex justify-end">
            <Button onClick={handleDismiss} disabled={isSaving}>
              {isSaving ? 'Saving…' : `Let's start`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function AppWelcomeTour() {
  const { data: user, status } = useUser();

  if (status !== 'success' || !user) {
    return null;
  }

  return <TourContent userId={user.uid} />;
}
