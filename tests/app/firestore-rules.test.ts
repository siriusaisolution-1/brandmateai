import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import { beforeAll, afterAll, describe, it } from 'vitest';

const rules = readFileSync(join(process.cwd(), 'firestore.rules'), 'utf8');
const emulatorConfigPath = join(process.cwd(), 'firebase.rules-test.json');
const emulatorConfig = JSON.parse(readFileSync(emulatorConfigPath, 'utf8')) as {
  emulators?: { firestore?: { host?: string; port?: number } };
};

  describe('firestore rules - master chat', () => {
    let testEnv: Awaited<ReturnType<typeof initializeTestEnvironment>> | undefined;

    beforeAll(async () => {
      try {
        testEnv = await initializeTestEnvironment({
          projectId: 'demo-master-chat',
          firestore: {
            rules,
            host: emulatorConfig.emulators?.firestore?.host ?? '127.0.0.1',
            port: emulatorConfig.emulators?.firestore?.port ?? 8080,
          },
        });
      } catch (error) {
        console.warn('Firestore emulator unavailable, skipping rules tests', error);
        testEnv = undefined;
      }
    });

  afterAll(async () => {
      await testEnv?.cleanup();
    });

    it('allows owner to manage their chat session and messages', async () => {
      if (!testEnv) return;
      const owner = testEnv.authenticatedContext('user-1', {});
    const db = owner.firestore();

    const sessionRef = db.collection('chatSessions').doc('s1');
    await assertSucceeds(
      sessionRef.set({ userId: 'user-1', brandId: 'b1', title: 'Test', createdAt: 1, updatedAt: 1 }),
    );

    const messageRef = db.collection('chatMessages').doc('m1');
    await assertSucceeds(
      messageRef.set({
        sessionId: 's1',
        brandId: 'b1',
        userId: 'user-1',
        role: 'user',
        content: 'hi',
        createdAt: 1,
      }),
    );
  });

    it('blocks other users from reading chat sessions they do not own', async () => {
      if (!testEnv) return;
      const owner = testEnv.authenticatedContext('user-1', {});
    await owner.firestore().collection('chatSessions').doc('s2').set({
      userId: 'user-1',
      brandId: 'b1',
      title: 'Private',
      createdAt: 1,
      updatedAt: 1,
    });

    const intruder = testEnv.authenticatedContext('user-2', {});
    const db = intruder.firestore();
    await assertFails(db.collection('chatSessions').doc('s2').get());
    await assertFails(
      db.collection('chatMessages').add({
        sessionId: 's2',
        brandId: 'b1',
        userId: 'user-2',
        role: 'user',
        content: 'steal',
        createdAt: 1,
      }),
    );
  });

    it('restricts content requests to brand owners', async () => {
      if (!testEnv) return;
      const owner = testEnv.authenticatedContext('owner-1', {});
    const db = owner.firestore();
    await db.collection('brands').doc('b-brand').set({ ownerId: 'owner-1' });

    await assertSucceeds(
      db.collection('contentRequests').add({
        brandId: 'b-brand',
        userId: 'owner-1',
        title: 'Req',
        channels: ['tiktok'],
        requestedOutputs: { video: 1 },
        status: 'draft',
        masterBrief: {},
        createdAt: 1,
        updatedAt: 1,
      }),
    );

    const other = testEnv.authenticatedContext('stranger', {});
    await assertFails(
      other.firestore().collection('contentRequests').add({
        brandId: 'b-brand',
        userId: 'stranger',
        title: 'Req',
        channels: ['tiktok'],
        requestedOutputs: { video: 1 },
        status: 'draft',
        masterBrief: {},
        createdAt: 1,
        updatedAt: 1,
      }),
    );
  });
});
