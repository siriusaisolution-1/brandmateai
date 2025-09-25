'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export default function VideoStudioPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-copy-primary">Video Studio</h1>

      <Card className="bg-surface border-gray-700">
        <CardHeader>
          <CardTitle>Temporarily Disabled</CardTitle>
          <CardDescription>
            Video generation UI is paused during dependency alignment. No Genkit hooks or custom Textarea import here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            We will re-introduce this screen after the migration to Firebase v11 and a clean client API.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}