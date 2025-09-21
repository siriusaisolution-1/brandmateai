'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export default function BrandCalendarPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-copy-primary">Calendar</h1>

      <Card className="bg-surface border-gray-700">
        <CardHeader>
          <CardTitle>Temporarily Disabled</CardTitle>
          <CardDescription>
            Calendar actions that trigger ad-campaign flows are disabled while we remove Reactfire and wire Firebase v11.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            We&rsquo;ll bring this back once Genkit flows are replaced with our Firebase v11 + React Query integration.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}