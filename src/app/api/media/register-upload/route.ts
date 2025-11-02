import { NextRequest, NextResponse } from 'next/server';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { getStorage } from '@/lib/firebase-admin';
import { requireBearerAuth } from '@/lib/auth/verify-id-token';

function assertString(name: string, value: unknown): asserts value is string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Invalid "${name}"`);
  }
}

function assertNumber(name: string, value: unknown): asserts value is number {
  if (typeof value !== 'number' || Number.isNaN(value) || value < 0) {
    throw new Error(`Invalid "${name}"`);
  }
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

function validateStoragePath(path: string, brandId: string, userId: string) {
  const expectedPrefix = `brands/${brandId}/${userId}/`;
  if (!path.startsWith(expectedPrefix)) {
    throw Object.assign(new Error('Invalid storage path'), { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { claims: authUser } = await requireBearerAuth(request);
    const body = await request.json().catch(() => ({}));
    const { brandId, storagePath, fileName, contentType, size, uploadId } = (body ?? {}) as Record<string, unknown>;

    assertString('brandId', brandId);
    assertString('storagePath', storagePath);
    assertString('fileName', fileName);
    assertString('contentType', contentType);
    assertString('uploadId', uploadId);
    assertNumber('size', size);

    await assertBrandOwnership(brandId, authUser.uid);
    validateStoragePath(storagePath, brandId, authUser.uid);

    const db = getFirestore();
    const bucket = getStorage().bucket();
    const uploadRef = db.collection('mediaUploads').doc(uploadId);
    const uploadSnap = await uploadRef.get();

    if (!uploadSnap.exists) {
      throw Object.assign(new Error('Upload session not found'), { status: 404 });
    }

    if (uploadSnap.get('storagePath') !== storagePath || uploadSnap.get('userId') !== authUser.uid) {
      throw Object.assign(new Error('Upload session mismatch'), { status: 400 });
    }

    if (uploadSnap.get('status') === 'completed') {
      return NextResponse.json({
        assetId: uploadSnap.get('assetId') ?? null,
        storagePath,
        note: 'Already registered',
      });
    }

    const safeFileName = uploadSnap.get('fileName') || fileName;
    const expectedContentType = uploadSnap.get('contentType') || contentType;
    const downloadToken = uploadSnap.get('downloadToken');

    if (typeof downloadToken !== 'string' || !downloadToken) {
      throw Object.assign(new Error('Upload session missing token'), { status: 500 });
    }

    if (contentType !== expectedContentType) {
      throw Object.assign(new Error('Content type mismatch'), { status: 400 });
    }

    const mediaRef = await db.collection('mediaAssets').add({
      brandId,
      userId: authUser.uid,
      fileName: safeFileName,
      contentType: expectedContentType,
      size,
      storagePath,
      url: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media&token=${downloadToken}`,
      createdAt: FieldValue.serverTimestamp(),
      uploadedAt: FieldValue.serverTimestamp(),
    });

    await uploadRef.update({
      status: 'completed',
      completedAt: FieldValue.serverTimestamp(),
      size,
      assetId: mediaRef.id,
    });

    return NextResponse.json({
      assetId: mediaRef.id,
      storagePath,
    });
  } catch (error) {
    const status = (error as { status?: number }).status ?? 400;
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status });
  }
}
