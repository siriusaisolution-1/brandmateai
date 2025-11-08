#!/usr/bin/env node

import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

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

function ensureAdminApp() {
  if (!getApps().length) {
    const serviceAccount = parseServiceAccount();
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

    if (process.env.FIREBASE_STORAGE_BUCKET) {
      options.storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
    }

    initializeApp(options);
  }

  return {
    auth: getAuth(),
    firestore: getFirestore(),
  };
}

async function ensureAdminUser(auth, { email, password, displayName }) {
  try {
    const existing = await auth.getUserByEmail(email);
    const updates = {};

    if (displayName && existing.displayName !== displayName) {
      updates.displayName = displayName;
    }

    if (!existing.emailVerified) {
      updates.emailVerified = true;
    }

    if (password) {
      updates.password = password;
    }

    if (Object.keys(updates).length > 0) {
      await auth.updateUser(existing.uid, updates);
    }

    return existing;
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'auth/user-not-found') {
      const record = await auth.createUser({
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

async function ensureAdminClaims(auth, uid) {
  const user = await auth.getUser(uid);
  const claims = { ...(user.customClaims || {}), admin: true };

  await auth.setCustomUserClaims(uid, claims);
  return claims;
}

async function ensureDemoBrand(firestore, { brandId, ownerId, name, description }) {
  const docRef = firestore.collection('brands').doc(brandId);
  const snap = await docRef.get();
  const payload = {
    ownerId,
    name,
    description,
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (!snap.exists) {
    await docRef.set({
      ...payload,
      createdAt: FieldValue.serverTimestamp(),
    });
    return { docRef, created: true };
  }

  const existingOwner = snap.get('ownerId');
  if (existingOwner && existingOwner !== ownerId) {
    fail(`Brand ${brandId} already exists and belongs to ${existingOwner}.`);
  }

  await docRef.set(payload, { merge: true });
  return { docRef, created: false };
}

async function ensureDemoMedia(firestore, { mediaId, brandId, userId, fileName, contentType, url }) {
  const collectionRef = firestore.collection('mediaAssets');
  const docRef = mediaId ? collectionRef.doc(mediaId) : collectionRef.doc();
  const snap = mediaId ? await docRef.get() : null;
  const payload = {
    brandId,
    userId,
    fileName,
    contentType,
    url,
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (snap && snap.exists) {
    await docRef.set(payload, { merge: true });
    return { docRef, created: false };
  }

  await docRef.set({
    ...payload,
    createdAt: FieldValue.serverTimestamp(),
    uploadedAt: FieldValue.serverTimestamp(),
  });
  return { docRef, created: true };
}

(async () => {
  try {
    const email = readRequiredEnv('SEED_ADMIN_EMAIL');
    const password = readRequiredEnv('SEED_ADMIN_PASSWORD');
    const displayName = readOptionalEnv('SEED_ADMIN_DISPLAY_NAME', 'BrandMate Admin');

    const brandId = readOptionalEnv('SEED_ADMIN_BRAND_ID', 'brandmate-admin-demo');
    const brandName = readOptionalEnv('SEED_ADMIN_BRAND_NAME', 'BrandMate Admin Demo');
    const brandDescription = readOptionalEnv(
      'SEED_ADMIN_BRAND_DESCRIPTION',
      'Demo brand for admin seed script.'
    );

    const defaultFileName = 'admin-demo-image.png';
    const mediaId = readOptionalEnv('SEED_ADMIN_MEDIA_ID', null);
    const mediaFileName = readOptionalEnv('SEED_ADMIN_MEDIA_FILENAME', defaultFileName);
    const mediaContentType = readOptionalEnv('SEED_ADMIN_MEDIA_CONTENT_TYPE', 'image/png');
    const mediaUrl = readOptionalEnv(
      'SEED_ADMIN_MEDIA_URL',
      'https://via.placeholder.com/600x400.png?text=BrandMate+Admin'
    );

    const { auth, firestore } = ensureAdminApp();

    const adminUser = await ensureAdminUser(auth, { email, password, displayName });
    const claims = await ensureAdminClaims(auth, adminUser.uid);

    const { docRef: brandRef } = await ensureDemoBrand(firestore, {
      brandId,
      ownerId: adminUser.uid,
      name: brandName,
      description: brandDescription,
    });

    const { docRef: mediaRef } = await ensureDemoMedia(firestore, {
      mediaId,
      brandId,
      userId: adminUser.uid,
      fileName: mediaFileName,
      contentType: mediaContentType,
      url: mediaUrl,
    });

    const output = {
      uid: adminUser.uid,
      brandId: brandRef.id,
      mediaId: mediaRef.id,
      claims,
    };

    console.log(JSON.stringify(output, null, 2));
  } catch (error) {
    if (error instanceof Error) {
      fail(error.message);
    } else {
      fail('Unknown error occurred.');
    }
  }
})();
