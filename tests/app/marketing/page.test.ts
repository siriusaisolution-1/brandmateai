import { expect, test } from 'vitest';

test('marketing home page module imports without throwing', async () => {
  const pageModule = await import('@/app/(marketing)/page');
  expect(typeof pageModule.default).toBe('function');
});
