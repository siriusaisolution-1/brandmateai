#!/usr/bin/env node
import { randomUUID } from 'node:crypto';

import { deleteApp, getApps, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

const DEFAULT_EMULATOR_HOST = '127.0.0.1:8080';
const DEFAULT_PROJECT_ID = 'brandmateai-test';

process.env.FIRESTORE_EMULATOR_HOST ??= DEFAULT_EMULATOR_HOST;
process.env.GCLOUD_PROJECT ??= DEFAULT_PROJECT_ID;

const projectId = process.env.GCLOUD_PROJECT;

const existingApp = getApps()[0];
const app = existingApp ?? initializeApp({ projectId });

const withTimeout = async (promise, timeoutMs, onTimeoutMessage) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(onTimeoutMessage));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

try {
  const firestore = getFirestore(app);
  firestore.settings({ ignoreUndefinedProperties: true });

  const seededBrandId =
    process.env.BRANDMATE_E2E_BRAND_ID ?? `brand-${randomUUID()}`;
  const seededMediaId =
    process.env.BRANDMATE_E2E_MEDIA_ID ?? `${seededBrandId}-media`;

  const mediaUrl =
    process.env.BRANDMATE_E2E_MEDIA_URL ??
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAE0lEQVR42mP8/5+hHgAHggJ/P8hX4AAAAABJRU5ErkJggg==';
  const mediaFileName =
    process.env.BRANDMATE_E2E_MEDIA_FILENAME ?? 'seeded-media.png';

  const writes = [
    firestore.collection('users').doc('e2e-user').set(
      {
        email: 'e2e@example.com',
        brands: [seededBrandId],
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    ),
    firestore.collection('brands').doc(seededBrandId).set(
      {
        id: seededBrandId,
        name: 'E2E Seed Brand',
        slug: 'e2e-seed-brand',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    ),
    firestore.collection('mediaAssets').doc(seededMediaId).set(
      {
        id: seededMediaId,
        brandId: seededBrandId,
        fileName: mediaFileName,
        url: mediaUrl,
        mimeType: 'image/png',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    ),
  ];

  try {
    await withTimeout(
      Promise.all(writes),
      3_000,
      'Firestore emulator write timed out'
    );
  } catch (error) {
    console.warn(
      'Firestore emulator unavailable, continuing with in-memory seed payload:',
      error.message
    );
  }

  const payload = {
    brandId: seededBrandId,
    mediaId: seededMediaId,
    mediaFileName,
    mediaUrl,
  };

  process.stdout.write(`${JSON.stringify(payload)}\n`);
} finally {
  try {
    await deleteApp(app);
  } catch (error) {
    if (error?.code !== 'app/no-app') {
      console.warn('Unable to delete Firebase admin app', error);
    }
  }
}
