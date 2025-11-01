'use client';

import { useCallback, useState } from 'react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { isWatchtowerEnabled } from '@/config';
import { useToast } from '@/hooks/use-toast';
import {
  buildWatchtowerRequest,
  runCompetitorWatchtower,
  runSyncAdPerformance,
  runTrendAndOpportunityRadar,
} from '@/lib/flows-client';
import type { WatchtowerResponse } from '@/lib/flows-client/watchtowers';

type WatchtowerAction = {
  id: 'competitor' | 'trend' | 'ads';
  label: string;
  description: string;
  run: () => Promise<WatchtowerResponse>;
  testId: string;
};

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const [pending, setPending] = useState<string | null>(null);
  const watchtowersEnabled = isWatchtowerEnabled();

  const actions: WatchtowerAction[] = [
    {
      id: 'competitor',
      label: 'Run Competitor Watchtower',
      description: 'Capture competitor updates and file an audit trail.',
      testId: 'watchtower-cta',
      run: async () => runCompetitorWatchtower(buildWatchtowerRequest()),
    },
    {
      id: 'trend',
      label: 'Run Trend & Opportunity Radar',
      description: 'Log a scan for market trends and opportunity signals.',
      testId: 'watchtower-action-trend',
      run: async () => runTrendAndOpportunityRadar(buildWatchtowerRequest()),
    },
    {
      id: 'ads',
      label: 'Sync Ad Performance',
      description: 'Snapshot ad platform metrics for the operations report.',
      testId: 'watchtower-action-ads',
      run: async () => runSyncAdPerformance(buildWatchtowerRequest()),
    },
  ];

  const executeAction = useCallback(
    async (action: WatchtowerAction) => {
      setPending(action.id);
      try {
        const response = await action.run();
        toast({
          title: 'Watchtower queued',
          description:
            response.message ?? `${action.label} accepted (status: ${response.status}).`,
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Unexpected error while recording watchtower action.';
        toast({
          title: 'Unable to queue watchtower',
          description: message,
          variant: 'destructive',
        });
      } finally {
        setPending(null);
      }
    },
    [toast]
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-copy-primary">Admin Dashboard</h1>

      <Card className="bg-surface border-gray-700">
        <CardHeader>
          <CardTitle>Temporarily Simplified</CardTitle>
          <CardDescription>
            Original Genkit flows and remote config toggles are disabled for now to unblock the production build.
            We will re-enable them after we wire the Genkit client and move Reactfire off the stack.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This stub removes imports of @genkit-ai/flow/client, reactfire, and the alias path @/ai/flows/* which were causing module-not-found during build.
          </p>
        </CardContent>
      </Card>

      {watchtowersEnabled && (
        <Card className="bg-surface border-primary/40" data-testid="watchtower-actions">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Watchtower Automations
              <span
                className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-primary"
                data-testid="watchtower-toggle"
              >
                Feature Flag
              </span>
            </CardTitle>
            <CardDescription>
              Trigger manual runs of scheduled watchtower tasks. Each action writes an audit entry so operations can trace manual interventions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {actions.map((action) => (
              <div key={action.id} className="flex flex-col gap-2 rounded-lg border border-border/60 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-medium text-copy-primary">{action.label}</p>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
                <Button
                  data-testid={action.testId}
                  onClick={() => executeAction(action)}
                  disabled={pending === action.id}
                >
                  {pending === action.id ? 'Running…' : 'Run now'}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
