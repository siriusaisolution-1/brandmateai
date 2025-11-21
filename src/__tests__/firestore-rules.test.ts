import { beforeAll, afterAll, describe, it } from 'vitest';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import fs from 'node:fs';

let testEnv: RulesTestEnvironment;
const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
const [host, portString] = emulatorHost?.split(':') ?? [];
const shouldRunRulesTests = Boolean(host && portString);

if (!shouldRunRulesTests) {
  // eslint-disable-next-line no-console
  console.warn('FIRESTORE_EMULATOR_HOST not set; skipping Firestore rule tests.');
}

beforeAll(async () => {
  if (!shouldRunRulesTests) return;

  testEnv = await initializeTestEnvironment({
    projectId: 'brandmateai-test',
    firestore: {
      host,
      port: Number(portString),
      rules: fs.readFileSync('firestore.rules', 'utf8'),
    },
  });
});

afterAll(async () => {
  await testEnv?.cleanup();
});

const conditionalDescribe = shouldRunRulesTests ? describe : describe.skip;

conditionalDescribe('Firestore security rules', () => {
  it('allows owners to create their own brand', async () => {
    const db = testEnv.authenticatedContext('owner-1').firestore();

    await assertSucceeds(
      setDoc(doc(db, 'brands', 'brand-1'), {
        ownerId: 'owner-1',
        name: 'Brand One',
        status: 'active',
        createdAt: 0,
        updatedAt: 0,
      }),
    );
  });

  it('rejects brand creation when ownerId does not match auth user', async () => {
    const db = testEnv.authenticatedContext('owner-1').firestore();

    await assertFails(
      setDoc(doc(db, 'brands', 'brand-2'), {
        ownerId: 'someone-else',
        name: 'Brand Two',
        status: 'active',
        createdAt: 0,
        updatedAt: 0,
      }),
    );
  });

  it('restricts brand memories to the owning user', async () => {
    const ownerDb = testEnv.authenticatedContext('owner-2').firestore();
    const otherDb = testEnv.authenticatedContext('other').firestore();

    await setDoc(doc(ownerDb, 'brands', 'brand-3'), {
      ownerId: 'owner-2',
      name: 'Brand Three',
      status: 'active',
      createdAt: 0,
      updatedAt: 0,
    });

    await assertSucceeds(
      setDoc(doc(ownerDb, 'brandMemories', 'mem-3'), {
        brandId: 'brand-3',
        incomplete: true,
        createdAt: 0,
        updatedAt: 0,
      }),
    );

    await assertFails(getDoc(doc(otherDb, 'brandMemories', 'mem-3')));
  });
});
