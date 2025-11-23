'use client';

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentReference,
} from 'firebase/firestore';

import { firestore } from './firebase';
import type { Brand, BrandMemory } from '@/types/firestore';

export interface QuickBrandInput {
  ownerId: string;
  name: string;
  industry?: string;
  website?: string;
  instagramHandle?: string;
  tiktokHandle?: string;
  otherHandle?: string;
  priceRange?: 'low' | 'mid' | 'high';
  targetAudienceSummary?: string;
}

function buildSocialHandles(input: QuickBrandInput) {
  const handles = {
    instagram: input.instagramHandle,
    tiktok: input.tiktokHandle,
    other: input.otherHandle,
  } as const;

  if (!handles.instagram && !handles.tiktok && !handles.other) {
    return undefined;
  }

  return handles;
}

async function findBrandMemoryRefByBrandId(brandId: string): Promise<DocumentReference | undefined> {
  const snapshot = await getDocs(
    query(collection(firestore, 'brandMemories'), where('brandId', '==', brandId)),
  );

  const document = snapshot.docs.at(0);
  return document?.ref;
}

export async function createBrandWithMemory(
  input: QuickBrandInput,
): Promise<{ brand: Brand; memory: BrandMemory }> {
  const timestamps = serverTimestamp();
  const brandDoc = await addDoc(collection(firestore, 'brands'), {
    ownerId: input.ownerId,
    name: input.name,
    industry: input.industry,
    website: input.website,
    socialHandles: buildSocialHandles(input),
    priceRange: input.priceRange,
    targetAudienceSummary: input.targetAudienceSummary,
    status: 'active',
    createdAt: timestamps,
    updatedAt: timestamps,
  });

  const brandMemoryDoc = await addDoc(collection(firestore, 'brandMemories'), {
    brandId: brandDoc.id,
    toneOfVoice: undefined,
    mission: undefined,
    values: [],
    personas: [],
    primaryColors: [],
    fonts: [],
    preferences: [],
    assetsSummary: undefined,
    incomplete: true,
    createdAt: timestamps,
    updatedAt: timestamps,
  });

  await updateDoc(brandDoc, { brandMemoryRef: brandMemoryDoc.path });

  const [brandSnap, memorySnap] = await Promise.all([getDoc(brandDoc), getDoc(brandMemoryDoc)]);
  const { id: _memoryId, ...memoryData } = memorySnap.data() as BrandMemory;

  return {
    brand: { id: brandSnap.id, ...(brandSnap.data() as Brand) },
    memory: { id: memorySnap.id, ...memoryData },
  };
}

export async function updateBrandMemory(brandId: string, patch: Partial<BrandMemory>): Promise<void> {
  const memoryRef = await findBrandMemoryRefByBrandId(brandId);
  if (!memoryRef) {
    throw new Error('Brand memory not found');
  }

  await updateDoc(memoryRef, { ...patch, updatedAt: serverTimestamp() });
}

export async function getBrandsForUser(userId: string): Promise<Brand[]> {
  const result = await getDocs(
    query(collection(firestore, 'brands'), where('ownerId', '==', userId)),
  );

  return result.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as Brand) }));
}

export async function getBrandWithMemory(brandId: string): Promise<{ brand: Brand; memory: BrandMemory } | undefined> {
  const brandRef = doc(firestore, 'brands', brandId);
  const brandSnap = await getDoc(brandRef);
  if (!brandSnap.exists()) {
    return undefined;
  }

  const memoryRef = await findBrandMemoryRefByBrandId(brandId);
  if (!memoryRef) {
    return undefined;
  }

  const memorySnap = await getDoc(memoryRef);
  if (!memorySnap.exists()) {
    return undefined;
  }

  const { id: _memoryId, ...memoryData } = memorySnap.data() as BrandMemory;

  return {
    brand: { id: brandSnap.id, ...(brandSnap.data() as Brand) },
    memory: { id: memorySnap.id, ...memoryData },
  };
}
