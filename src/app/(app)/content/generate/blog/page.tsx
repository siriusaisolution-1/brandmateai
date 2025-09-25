'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export default function BlogGeneratorPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-copy-primary">Blog Generator</h1>

      <Card className="bg-surface border-gray-700">
        <CardHeader>
          <CardTitle>Temporarily Simplified</CardTitle>
          <CardDescription>
            AI blog generation is paused during dependency clean-up. No Genkit nor react-markdown imports here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            We&rsquo;ll re-enable generation via Firebase v11 + React Query pipeline after migration.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}