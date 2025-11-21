import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { initializeTestEnvironment, assertSucceeds, assertFails, RulesTestEnvironment } from '@firebase/rules-unit-testing';

const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;

if (!emulatorHost) {
  describe.skip('firestore rules - usageSnapshots (emulator required)', () => {
    it('skipped because FIRESTORE_EMULATOR_HOST is not set', () => {
      expect(true).toBe(true);
    });
  });
} else {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    const [host, portStr] = emulatorHost.split(':');
    testEnv = await initializeTestEnvironment({
      projectId: 'brandmateai-test',
      firestore: { host, port: Number(portStr), rules: readFileSync('firestore.rules', 'utf8') },
    });
  });

  afterAll(async () => {
    await testEnv?.cleanup();
  });

  describe('firestore rules - usageSnapshots', () => {
    it('allows owner to create and read their usage snapshot', async () => {
      const ownerContext = testEnv.authenticatedContext('user-1');
      const db = ownerContext.firestore();
      const ref = db.collection('usageSnapshots').doc('user-1:brand-1:2025-01');

      await assertSucceeds(
        ref.set({ userId: 'user-1', brandId: 'brand-1', yearMonth: '2025-01', videosGenerated: 0, imagesGenerated: 0, requestsProcessed: 0 }),
      );

      await assertSucceeds(ref.get());
    });

    it('blocks another user from reading or writing someone else\'s usage', async () => {
      const ownerContext = testEnv.authenticatedContext('owner-1');
      const db = ownerContext.firestore();
      const ref = db.collection('usageSnapshots').doc('owner-1:brand-1:2025-01');
      await ref.set({ userId: 'owner-1', brandId: 'brand-1', yearMonth: '2025-01', videosGenerated: 0, imagesGenerated: 0, requestsProcessed: 0 });

      const intruderDb = testEnv.authenticatedContext('snoop-9').firestore();
      const intruderRef = intruderDb.collection('usageSnapshots').doc('owner-1:brand-1:2025-01');

      await expect(assertFails(intruderRef.get())).resolves.toBeDefined();
      await expect(assertFails(intruderRef.set({ userId: 'owner-1', brandId: 'brand-1' }))).resolves.toBeDefined();
    });
  });
}
