import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const rules = readFileSync(resolve(process.cwd(), 'firestore.rules'), 'utf8');

function resolveEmulatorConfig(): { host: string; port: number } | null {
  const raw =
    process.env.FIRESTORE_EMULATOR_HOST ??
    process.env.FIREBASE_EMULATORS_FIRESTORE_HOST ??
    process.env.FIREBASE_FIRESTORE_EMULATOR_ADDRESS ??
    process.env.FIREBASE_EMULATORS_HOST ??
    null;
  if (!raw) {
    return null;
  }
  const [host, portValue] = raw.split(':');
  const port = Number(portValue ?? '8080');
  return { host: host || '127.0.0.1', port: Number.isNaN(port) ? 8080 : port };
}

const emulatorConfig = resolveEmulatorConfig();
const describeRules = emulatorConfig ? describe : describe.skip;

describeRules('betaFeedback security rules', () => {
  let testEnv: Awaited<ReturnType<typeof initializeTestEnvironment>>;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'brandmate-beta-rules',
      firestore: {
        rules,
        host: emulatorConfig!.host,
        port: emulatorConfig!.port,
      },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  it('allows authenticated users to create feedback documents for themselves', async () => {
    const context = testEnv.authenticatedContext('user-1', { email: 'user@example.com' });
    const db = context.firestore();
    const ref = doc(db, 'betaFeedback', 'feedback-1');

    await assertSucceeds(
      setDoc(ref, {
        userId: 'user-1',
        message: 'Great product',
        context: 'dashboard',
        createdAt: 123,
        resolved: false,
      })
    );
  });

  it('rejects feedback creation when userId does not match the authenticated user', async () => {
    const context = testEnv.authenticatedContext('user-1');
    const db = context.firestore();
    const ref = doc(db, 'betaFeedback', 'feedback-2');

    await assertFails(
      setDoc(ref, {
        userId: 'user-2',
        message: 'Broken flow',
        context: 'library',
        createdAt: 123,
        resolved: false,
      })
    );
  });

  it('blocks non-admins from reading beta feedback', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      const db = context.firestore();
      await setDoc(doc(db, 'betaFeedback', 'feedback-3'), {
        userId: 'user-3',
        message: 'Needs polish',
        context: 'settings',
        createdAt: 123,
        resolved: false,
      });
    });

    const context = testEnv.authenticatedContext('user-3');
    const db = context.firestore();
    await assertFails(getDoc(doc(db, 'betaFeedback', 'feedback-3')));
  });

  it('allows admins to read and update beta feedback', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      const db = context.firestore();
      await setDoc(doc(db, 'betaFeedback', 'feedback-4'), {
        userId: 'user-4',
        message: 'Resolved issue',
        context: 'chat',
        createdAt: 123,
        resolved: false,
      });
    });

    const adminContext = testEnv.authenticatedContext('owner', { admin: true });
    const adminDb = adminContext.firestore();

    await assertSucceeds(getDoc(doc(adminDb, 'betaFeedback', 'feedback-4')));
    await assertSucceeds(updateDoc(doc(adminDb, 'betaFeedback', 'feedback-4'), { resolved: true }));
  });
});
