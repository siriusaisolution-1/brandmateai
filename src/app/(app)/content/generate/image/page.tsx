'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export default function ImageStudioPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-copy-primary">Image Studio</h1>

      <Card className="bg-surface border-gray-700">
        <CardHeader>
          <CardTitle>Temporarily Disabled</CardTitle>
          <CardDescription>
            Image generation UI is paused while we remove Genkit hooks and align with Firebase v11.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            We&rsquo;ll re-introduce this screen after the migration (without <code>@genkit-ai/react</code> and
            custom <code>Textarea</code> dependency).
          </p>
        </CardContent>
      </Card>
    </div>
  )
}