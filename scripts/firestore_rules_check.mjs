import { readFileSync } from 'node:fs';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';

async function main() {
  const hostEnv = process.env.FIRESTORE_EMULATOR_HOST;
  if (!hostEnv) {
    console.warn('Skipping Firestore rules check: FIRESTORE_EMULATOR_HOST not set.');
    return;
  }

  const [host, portStr] = hostEnv.split(':');
  const port = Number(portStr);

  const testEnv = await initializeTestEnvironment({
    projectId: 'demo-project',
    firestore: {
      host,
      port,
      rules: readFileSync('firestore.rules', 'utf8'),
    },
  });

  try {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await db.collection('brands').doc('brand-123').set({ ownerId: 'user-123' });
      await db.collection('mediaAssets').doc('existing-asset').set({
        brandId: 'brand-123',
        url: 'https://example.com',
      });
    });

    const ownerDb = testEnv.authenticatedContext('user-123').firestore();
    const intruderDb = testEnv.authenticatedContext('user-999').firestore();

    const createAttempt = await assertFails(
      ownerDb.collection('mediaAssets').add({
        brandId: 'brand-123',
        url: 'https://example.com/new',
      })
    );

    const readOwn = await assertSucceeds(
      ownerDb.collection('mediaAssets').doc('existing-asset').get()
    );

    const readForeign = await assertFails(
      intruderDb.collection('mediaAssets').doc('existing-asset').get()
    );

    const uploadWrite = await assertFails(
      ownerDb.collection('mediaUploads').add({
        brandId: 'brand-123',
        storagePath: 'brands/brand-123/user-123/demo.png',
      })
    );

    console.log('mediaAssets create blocked:', Boolean(createAttempt));
    console.log('mediaAssets owner read allowed:', Boolean(readOwn));
    console.log('mediaAssets foreign read blocked:', Boolean(readForeign));
    console.log('mediaUploads write blocked:', Boolean(uploadWrite));
  } finally {
    await testEnv.cleanup();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
