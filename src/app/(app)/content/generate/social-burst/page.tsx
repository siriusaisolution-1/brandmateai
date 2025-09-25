'use client';

import React from 'react';
import { useFeatureFlag } from '@/hooks/use-feature-flag';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { EyeOff } from 'lucide-react';

const FeatureDisabledCard = () => (
  <Card className="max-w-2xl mx-auto mt-16 bg-surface border-yellow-500/50">
    <CardHeader className="text-center">
      <EyeOff className="mx-auto h-12 w-12 text-yellow-500" />
      <CardTitle className="mt-4">Feature Temporarily Disabled</CardTitle>
      <CardDescription>
        This feature is currently turned off by the administrators. Please check back later.
      </CardDescription>
    </CardHeader>
  </Card>
);

export default function SocialBurstPage() {
  const isEnabled = useFeatureFlag('isSocialBurstEnabled');

  if (!isEnabled) {
    return <FeatureDisabledCard />;
  }

  // ✅ minimalan “enabled” UI da JSX nikada ne bude prazan
  return (
    <main className="container mx-auto max-w-4xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Social Burst</CardTitle>
          <CardDescription>
            Placeholder screen while we wire real functionality. (Feature flag is ON)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* TODO: ovde ide prava logika/komponente za Social Burst */}
          <div className="text-sm text-neutral-500">
            Coming soon: campaign presets, channel selection, scheduling, preview…
          </div>
        </CardContent>
      </Card>
    </main>
  );
}