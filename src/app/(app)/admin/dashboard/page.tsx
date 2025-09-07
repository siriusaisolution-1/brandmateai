'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export default function AdminDashboardPage() {
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
    </div>
  )
}