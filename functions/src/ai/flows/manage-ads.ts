// functions/src/ai/flows/manage-ads.ts
import {
  DocumentReference,
  FieldValue,
  getFirestore,
} from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v1/https";
import { z } from "zod";

import { extractAuthUserId } from "../../utils/flow-context";

type FirestoreLike = ReturnType<typeof getFirestore>;

/**
 * Test-friendly DB accessor.
 * In Vitest, __vitestFirebaseAdmin.mocks.collection is injected so we avoid loading real Admin SDK.
 */
function getDb(): FirestoreLike {
  const mockCollection = (
    globalThis as {
      __vitestFirebaseAdmin?: {
        mocks?: { collection?: FirestoreLike["collection"] };
      };
    }
  ).__vitestFirebaseAdmin?.mocks?.collection;

  if (typeof mockCollection === "function") {
    return { collection: mockCollection } as FirestoreLike;
  }

  return getFirestore();
}

export const ManageAdsInputSchema = z.object({
  eventId: z.string().min(1),
  adAccountId: z.string().min(1),
  brandId: z.string().min(1).optional(),
  notes: z.string().max(2000).optional(),
});

export const ManageAdsOutputSchema = z.object({
  status: z.string(),
  requestId: z.string(),
});

async function resolveRequesterRole(
  db: FirestoreLike,
  uid: string,
): Promise<string | null> {
  const snapshot = await db.collection("users").doc(uid).get();
  if (!snapshot.exists) {
    return null;
  }
  const role = snapshot.get("role");
  return typeof role === "string" ? role : null;
}

async function ensureNotQueuedYet(
  requestRef: DocumentReference,
): Promise<void> {
  const existing = await requestRef.get();
  if (existing.exists) {
    throw new HttpsError(
      "already-exists",
      "This ad sync request has already been queued.",
    );
  }
}

async function queueAdSyncRequest(
  db: FirestoreLike,
  input: z.infer<typeof ManageAdsInputSchema>,
  uid: string,
): Promise<void> {
  const requestRef = db
    .collection("adSyncRequests")
    .doc(input.eventId) as unknown as DocumentReference;

  await ensureNotQueuedYet(requestRef);

  await requestRef.set(
    {
      eventId: input.eventId,
      adAccountId: input.adAccountId,
      brandId: input.brandId ?? null,
      notes: input.notes ?? null,
      requestedBy: uid,
      status: "queued",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: false },
  );

  // Write an audit entry (best-effort, but fail loudly if audit collection is missing)
  await db.collection("operationsAudit").add({
    type: "ad-sync-queued",
    referenceId: input.eventId,
    adAccountId: input.adAccountId,
    brandId: input.brandId ?? null,
    requestedBy: uid,
    createdAt: FieldValue.serverTimestamp(),
  });
}

export async function manageAdsFlow(
  input: z.infer<typeof ManageAdsInputSchema>,
  { context }: { context?: Record<string, unknown> } = {},
): Promise<z.infer<typeof ManageAdsOutputSchema>> {
  const uid = extractAuthUserId(context);

  if (!uid) {
    throw new HttpsError("unauthenticated", "Authentication is required.");
  }

  const db = getDb();
  const role = await resolveRequesterRole(db, uid);

  if (role !== "admin") {
    throw new HttpsError(
      "permission-denied",
      "Only administrators can queue ad sync requests.",
    );
  }

  await queueAdSyncRequest(db, input, uid);

  return ManageAdsOutputSchema.parse({
    status: "queued",
    requestId: input.eventId,
  });
}

export const _test = {
  getDb,
  resolveRequesterRole,
  ensureNotQueuedYet,
  queueAdSyncRequest,
  ManageAdsInputSchema,
  ManageAdsOutputSchema,
};

export default manageAdsFlow;