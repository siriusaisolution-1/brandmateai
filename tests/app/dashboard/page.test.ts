import { expect, test } from 'vitest'

// Ensure the authenticated shell entry point renders without throwing
// (auth is enforced at runtime via middleware/layout guards).
test('dashboard page module loads', async () => {
  const pageModule = await import('@/app/(app)/dashboard/page')
  expect(typeof pageModule.default).toBe('function')
})
