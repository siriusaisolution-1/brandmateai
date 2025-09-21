'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export default function ReportsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-copy-primary">Reports</h1>

      <Card className="bg-surface border-gray-700">
        <CardHeader>
          <CardTitle>Temporarily Simplified</CardTitle>
          <CardDescription>
            Performance insights and tables are temporarily removed. No imports from Genkit flows or custom Table UI remain.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            We will bring this back after we finalize the data layer and install only the required client libraries.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}