'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export default function NewsletterGeneratorPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-copy-primary">Newsletter Generator</h1>

      <Card className="bg-surface border-gray-700">
        <CardHeader>
          <CardTitle>Temporarily Simplified</CardTitle>
          <CardDescription>
            AI newsletter generation is paused during dependency clean-up. No Genkit or custom flows imported here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            We&rsquo;ll re-enable it with a Firebase v11 + React Query pipeline after migration.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}