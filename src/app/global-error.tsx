// src/app/global-error.tsx
'use client'
import { useEffect } from 'react'
import { captureException } from '@/lib/monitoring/sentry'
export default function GlobalError({ error }: { error: Error }) {
  useEffect(() => {
    captureException(error, { scope: 'global-error-boundary' })
  }, [error])
  return (
    <html lang="en">
      <body>
        <h2>Something went wrong</h2>
        <pre>{error.message}</pre>
      </body>
    </html>
  )
}
