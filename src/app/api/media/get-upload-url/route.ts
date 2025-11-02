export const runtime = 'nodejs';
export const maxDuration = 10;

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from '@/lib/firebase-admin';
import { requireBearerAuth } from '@/lib/auth/verify-id-token';

import { getMediaRateLimiter } from '../rate-limit';

const ALLOWED_CONTENT_PREFIXES = ['image/', 'video/'];
const ALLOWED_EXACT_CONTENT_TYPES = new Set([
  'application/pdf',
]);

function assertString(name: string, value: unknown): asserts value is string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Invalid "${name}"`);
  }
}

function normaliseFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9_.-]/g, '_').slice(0, 120);
}

function isAllowedContentType(contentType: string) {
  if (ALLOWED_EXACT_CONTENT_TYPES.has(contentType)) {
    return true;
  }

  return ALLOWED_CONTENT_PREFIXES.some((prefix) => contentType.startsWith(prefix));
}

async function assertBrandOwnership(brandId: string, userId: string) {
  const db = getFirestore();
  const brandRef = db.collection('brands').doc(brandId);
  const brandSnap = await brandRef.get();

  if (!brandSnap.exists) {
    throw Object.assign(new Error('Brand not found'), { status: 404 });
  }

  const ownerId = brandSnap.get('ownerId');
  if (ownerId !== userId) {
    throw Object.assign(new Error('Forbidden'), { status: 403 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { claims: authUser } = await requireBearerAuth(request);
    const body = await request.json().catch(() => ({}));
    const { brandId, filename, contentType } = (body ?? {}) as Record<string, unknown>;

    assertString('brandId', brandId);
    assertString('filename', filename);
    assertString('contentType', contentType);

    const safeContentType = contentType.trim();
    if (!isAllowedContentType(safeContentType)) {
      throw Object.assign(new Error('Unsupported content type'), { status: 415 });
    }

    await assertBrandOwnership(brandId, authUser.uid);

    const rateKey = `${authUser.uid}:${brandId}`;
    const rateResult = await getMediaRateLimiter().attempt(rateKey);

    if (!rateResult.ok) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter: rateResult.retryAfterSeconds },
        {
          status: 429,
          headers: { 'Retry-After': rateResult.retryAfterSeconds.toString() },
        },
      );
    }

    const bucket = getStorage().bucket();
    const timestamp = Date.now();
    const safeFilename = normaliseFilename(filename);
    const storagePath = `brands/${brandId}/${authUser.uid}/${timestamp}_${safeFilename}`;
    const downloadToken = crypto.randomUUID();

    const [uploadUrl] = await bucket
      .file(storagePath)
      .getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: Date.now() + 15 * 60 * 1000,
        contentType: safeContentType,
        extensionHeaders: {
          'x-goog-meta-firebaseStorageDownloadTokens': downloadToken,
        },
      });

    const db = getFirestore();
    const pendingRef = await db.collection('mediaUploads').add({
      brandId,
      userId: authUser.uid,
      storagePath,
      fileName: safeFilename,
      contentType: safeContentType,
      downloadToken,
      createdAt: FieldValue.serverTimestamp(),
      status: 'pending',
    });

    return NextResponse.json({
      uploadUrl,
      storagePath,
      expectedContentType: safeContentType,
      uploadId: pendingRef.id,
      downloadToken,
      bucket: bucket.name,
    });
  } catch (error) {
    const status = (error as { status?: number }).status ?? 400;
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status });
  }
}
