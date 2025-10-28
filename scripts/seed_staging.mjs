#!/usr/bin/env node

import { initializeApp as initializeAdminApp, cert, applicationDefault, getApps as getAdminApps } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeApp as initializeClientApp, getApps as getClientApps } from 'firebase/app';
import { getAuth as getClientAuth, signInWithCustomToken } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';

const REQUIRED_CLIENT_ENV = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

const DEFAULT_BRAND_ID = 'brandmate-demo-staging';
const DEFAULT_BRAND_NAME = 'BrandMate Staging Demo';
const DEFAULT_ASSET_FILENAME = 'staging-demo-hero.png';
const DEFAULT_ASSET_CONTENT_TYPE = 'image/png';
const SEED_METADATA_SOURCE = 'scripts/seed_staging.mjs';

function fail(message) {
  console.error(`\n❌ ${message}`);
  process.exitCode = 1;
  throw new Error(message);
}

function readRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    fail(`Missing required environment variable: ${name}`);
  }
  return value;
}

function readOptionalEnv(name, fallback) {
  const value = process.env[name];
  return typeof value === 'undefined' ? fallback : value;
}

function normalizeFlag(value, fallback = true) {
  if (typeof value !== 'string') {
    return fallback;
  }
  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true;
  }
  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false;
  }
  return fallback;
}

function parseServiceAccount() {
  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  const rawB64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

  if (rawJson) {
    const parsed = JSON.parse(rawJson);
    return {
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: String(parsed.private_key || '').replace(/\\n/g, '\n'),
    };
  }

  if (rawB64) {
    const decoded = Buffer.from(rawB64, 'base64').toString('utf8');
    const parsed = JSON.parse(decoded);
    return {
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: String(parsed.private_key || '').replace(/\\n/g, '\n'),
    };
  }

  return null;
}

function resolveBaseUrl() {
  const candidates = [
    process.env.STAGING_BASE_URL,
    process.env.BRANDMATE_BASE_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.SITE_URL,
  ];

  for (const candidate of candidates) {
    if (candidate) {
      return candidate.replace(/\/?$/, '');
    }
  }

  fail('Unable to resolve base URL. Provide STAGING_BASE_URL (or BRANDMATE_BASE_URL / NEXT_PUBLIC_SITE_URL).');
}

async function ensureAdminApp() {
  if (!getAdminApps().length) {
    const serviceAccount = parseServiceAccount();
    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
    const options = {};

    if (serviceAccount) {
      options.credential = cert({
        projectId: serviceAccount.projectId,
        clientEmail: serviceAccount.clientEmail,
        privateKey: serviceAccount.privateKey,
      });
      if (serviceAccount.projectId && !process.env.GOOGLE_CLOUD_PROJECT) {
        options.projectId = serviceAccount.projectId;
      }
    } else {
      options.credential = applicationDefault();
    }

    if (storageBucket) {
      options.storageBucket = storageBucket;
    }

    initializeAdminApp(options);
  }

  return {
    auth: getAdminAuth(),
    firestore: getFirestore(),
  };
}

function ensureClientApp(config) {
  const existing = getClientApps();
  if (existing.length) {
    return existing[0];
  }
  return initializeClientApp(config);
}

function createLogger() {
  return {
    info: (message) => console.log(`➡️  ${message}`),
    step: (message) => console.log(`\n▶️  ${message}`),
    success: (message) => console.log(`✅ ${message}`),
  };
}

async function ensureDemoUser(adminAuth, email, displayName) {
  try {
    const existing = await adminAuth.getUserByEmail(email);
    if (existing.displayName !== displayName || !existing.emailVerified) {
      await adminAuth.updateUser(existing.uid, {
        displayName,
        emailVerified: true,
      });
    }
    return existing;
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'auth/user-not-found') {
      const password = process.env.STAGING_DEMO_PASSWORD;
      if (!password) {
        fail('STAGING_DEMO_PASSWORD must be set to create the demo user on first run.');
      }
      const record = await adminAuth.createUser({
        email,
        password,
        displayName,
        emailVerified: true,
        disabled: false,
      });
      return record;
    }
    throw error;
  }
}

async function ensureDemoBrand(firestore, brandId, ownerId, displayName) {
  const docRef = firestore.collection('brands').doc(brandId);
  const snap = await docRef.get();
  const payload = {
    name: displayName,
    ownerId,
    updatedAt: FieldValue.serverTimestamp(),
    status: 'active',
    metadata: {
      ...(snap.exists ? snap.get('metadata') || {} : {}),
      seededBy: SEED_METADATA_SOURCE,
      seededAt: new Date().toISOString(),
    },
  };

  if (!snap.exists) {
    await docRef.set({
      ...payload,
      createdAt: FieldValue.serverTimestamp(),
      brandVoice: 'Confident and inspiring',
      keyInfo: 'Staging demo brand for walkthroughs',
      industry: 'Software',
    });
    return { created: true, docRef };
  }

  const owner = snap.get('ownerId');
  if (owner && owner !== ownerId) {
    fail(`Existing brand ${brandId} belongs to a different user (${owner}).`);
  }

  await docRef.set(payload, { merge: true });
  return { created: false, docRef };
}

function encodeDemoImage() {
  const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=';
  return Buffer.from(base64, 'base64');
}

async function findExistingAsset(firestore, brandId, fileName) {
  const snapshot = await firestore
    .collection('mediaAssets')
    .where('brandId', '==', brandId)
    .where('fileName', '==', fileName)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return { id: doc.id, data: doc.data() };
}

async function seedAsset({ baseUrl, idToken, brandId, fileName, buffer, contentType }) {
  const uploadResponse = await fetch(`${baseUrl}/api/media/get-upload-url`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      brandId,
      filename: fileName,
      contentType,
    }),
  });

  if (!uploadResponse.ok) {
    const body = await uploadResponse.text();
    fail(`Failed to obtain upload URL (${uploadResponse.status}): ${body}`);
  }

  const uploadPayload = await uploadResponse.json();
  const { uploadUrl, storagePath, uploadId } = uploadPayload;

  const putResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
      'Content-Length': buffer.length.toString(),
    },
    body: buffer,
  });

  if (!putResponse.ok) {
    const body = await putResponse.text().catch(() => '');
    fail(`Failed to upload asset to signed URL (${putResponse.status}): ${body}`);
  }

  const registerResponse = await fetch(`${baseUrl}/api/media/register-upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      brandId,
      storagePath,
      fileName,
      contentType,
      size: buffer.length,
      uploadId,
    }),
  });

  if (!registerResponse.ok) {
    const body = await registerResponse.text();
    fail(`Failed to register uploaded asset (${registerResponse.status}): ${body}`);
  }

  const registerPayload = await registerResponse.json();
  return registerPayload;
}

async function obtainIdToken(adminAuth, clientConfig, uid) {
  const customToken = await adminAuth.createCustomToken(uid);
  const app = ensureClientApp(clientConfig);
  const auth = getClientAuth(app);
  const credential = await signInWithCustomToken(auth, customToken);
  const idToken = await credential.user.getIdToken(true);
  return { idToken, auth, app };
}

async function triggerNewsletter(functions, brandId) {
  const callable = httpsCallable(functions, 'generateNewsletter');
  const response = await callable({
    audience: 'Staging product update subscribers',
    keyPoints: ['Fresh demo content', 'Media library seeded automatically'],
    brandId,
  });
  return response.data;
}

async function triggerImage(functions, brandId, userId) {
  const callable = httpsCallable(functions, 'generateImageFlow');
  const response = await callable({
    prompt: 'A vibrant hero image representing an AI marketing assistant helping a creative team',
    userId,
    brandId,
  });
  return response.data;
}

(async () => {
  const logger = createLogger();
  const baseUrl = resolveBaseUrl();

  REQUIRED_CLIENT_ENV.forEach(readRequiredEnv);
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const { auth: adminAuth, firestore } = await ensureAdminApp();

  const demoEmail = readOptionalEnv('STAGING_DEMO_EMAIL', 'demo+staging@brandmate.ai');
  const demoDisplayName = readOptionalEnv('STAGING_DEMO_DISPLAY_NAME', 'BrandMate Demo User');
  const brandId = readOptionalEnv('STAGING_DEMO_BRAND_ID', DEFAULT_BRAND_ID);
  const brandName = readOptionalEnv('STAGING_DEMO_BRAND_NAME', DEFAULT_BRAND_NAME);
  const assetFileName = readOptionalEnv('STAGING_DEMO_ASSET_FILENAME', DEFAULT_ASSET_FILENAME);
  const assetContentType = readOptionalEnv('STAGING_DEMO_ASSET_CONTENT_TYPE', DEFAULT_ASSET_CONTENT_TYPE);

  logger.step('Ensuring demo user exists');
  const userRecord = await ensureDemoUser(adminAuth, demoEmail, demoDisplayName);
  logger.info(`Demo user ready (${userRecord.uid})`);

  logger.step('Ensuring demo brand document');
  const { created } = await ensureDemoBrand(firestore, brandId, userRecord.uid, brandName);
  logger.info(created ? `Created brand ${brandId}` : `Updated brand ${brandId}`);

  logger.step('Acquiring Firebase ID token for API calls');
  const { idToken } = await obtainIdToken(adminAuth, firebaseConfig, userRecord.uid);
  logger.info('ID token acquired');

  logger.step('Ensuring demo media asset');
  const existingAsset = await findExistingAsset(firestore, brandId, assetFileName);
  if (existingAsset) {
    logger.info(`Asset already exists with id ${existingAsset.id}`);
  } else {
    const assetBuffer = encodeDemoImage();
    const registered = await seedAsset({
      baseUrl,
      idToken,
      brandId,
      fileName: assetFileName,
      buffer: assetBuffer,
      contentType: assetContentType,
    });
    logger.info(`Uploaded asset ${assetFileName} to ${registered.storagePath}`);
  }

  const functions = getFunctions(ensureClientApp(firebaseConfig), 'us-central1');

  const newsletterFlag = normalizeFlag(process.env.FEAT_NEWSLETTER, true);
  const imageFlag = normalizeFlag(
    process.env.FEAT_IMAGE ?? process.env.FEAT_MEDIA ?? process.env.FEAT_VIDEO,
    true
  );

  if (newsletterFlag) {
    logger.step('Triggering newsletter flow');
    try {
      const result = await triggerNewsletter(functions, brandId);
      logger.info(`Newsletter flow completed (${JSON.stringify(result)})`);
    } catch (error) {
      fail(`Newsletter flow failed: ${(error && error.message) || error}`);
    }
  } else {
    logger.info('Skipping newsletter flow (FEAT_NEWSLETTER disabled)');
  }

  if (imageFlag) {
    logger.step('Triggering image generation flow');
    try {
      const result = await triggerImage(functions, brandId, userRecord.uid);
      logger.info(`Image flow triggered (${JSON.stringify(result)})`);
    } catch (error) {
      fail(`Image generation flow failed: ${(error && error.message) || error}`);
    }
  } else {
    logger.info('Skipping image generation flow (feature flag disabled)');
  }

  logger.success('Staging seed completed successfully');
})();
