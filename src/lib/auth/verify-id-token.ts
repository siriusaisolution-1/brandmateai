import type { DecodedIdToken } from 'firebase-admin/auth';
import type { NextRequest } from 'next/server';
import { cookies, headers as nextHeaders } from 'next/headers';

import { getAuth } from '@/lib/firebase-admin';

const BEARER_PREFIX = 'Bearer ';
const DEFAULT_COOKIE_NAMES = ['__session'];
const E2E_SESSION_TOKEN = process.env.BRANDMATE_E2E_SESSION_TOKEN ?? null;
const E2E_ADMIN_TOKEN = process.env.BRANDMATE_E2E_ADMIN_TOKEN ?? null;

export class FirebaseAuthError extends Error {
  status: number;

  constructor(message: string, status: number, options?: ErrorOptions) {
    super(message, options);
    this.name = 'FirebaseAuthError';
    this.status = status;
  }
}

export interface VerifiedFirebaseSession {
  token: string;
  claims: DecodedIdToken;
}

function normaliseToken(token: string | undefined | null): string | null {
  const trimmed = token?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

function configuredCookieNames(): string[] {
  const raw = process.env.FIREBASE_AUTH_COOKIE_NAMES ?? process.env.FIREBASE_ID_TOKEN_COOKIE ?? '';
  const explicitNames = raw
    .split(',')
    .map(name => name.trim())
    .filter(Boolean);
  const unique = new Set<string>([...explicitNames, ...DEFAULT_COOKIE_NAMES]);
  return Array.from(unique);
}

type HeaderSource = { get(name: string): string | null };

function createStubClaims(admin: boolean): DecodedIdToken {
  const now = Math.floor(Date.now() / 1000);
  const uid = admin ? 'e2e-admin' : 'e2e-user';

  return {
    aud: 'brandmate-e2e',
    iss: 'https://securetoken.google.com/brandmate-e2e',
    auth_time: now,
    exp: now + 3_600,
    iat: now,
    uid,
    user_id: uid,
    sub: uid,
    email: `${uid}@example.com`,
    email_verified: true,
    firebase: {
      identities: {},
      sign_in_provider: 'custom',
    },
    admin,
  } as DecodedIdToken & { admin: boolean };
}

function resolveE2EStubClaims(token: string | null): DecodedIdToken | null {
  if (!token) {
    return null;
  }

  if (E2E_ADMIN_TOKEN && token === E2E_ADMIN_TOKEN) {
    return createStubClaims(true);
  }

  if (E2E_SESSION_TOKEN && token === E2E_SESSION_TOKEN) {
    return createStubClaims(false);
  }

  return null;
}

export function extractBearerToken(source: HeaderSource): string | null {
  const header = source.get('authorization') ?? source.get('Authorization');
  if (!header?.startsWith(BEARER_PREFIX)) {
    return null;
  }

  return normaliseToken(header.slice(BEARER_PREFIX.length));
}

export async function verifyIdToken(token: string): Promise<DecodedIdToken> {
  const normalised = normaliseToken(token);
  if (!normalised) {
    throw new FirebaseAuthError('Missing bearer token', 401);
  }

  const stubClaims = resolveE2EStubClaims(normalised);
  if (stubClaims) {
    return stubClaims;
  }

  try {
    return await getAuth().verifyIdToken(normalised);
  } catch (error) {
    throw new FirebaseAuthError('Invalid authentication token', 401, { cause: error });
  }
}

export async function requireBearerAuth(request: NextRequest | Request): Promise<VerifiedFirebaseSession> {
  const token = extractBearerToken(request.headers);
  if (!token) {
    throw new FirebaseAuthError('Missing bearer token', 401);
  }

  const claims = await verifyIdToken(token);
  return { token, claims };
}

async function tryVerifyToken(token: string | null): Promise<VerifiedFirebaseSession | null> {
  if (!token) {
    return null;
  }

  const stubClaims = resolveE2EStubClaims(token);
  if (stubClaims) {
    return { token, claims: stubClaims };
  }

  const claims = await verifyIdToken(token);
  return { token, claims };
}

export async function getServerAuthSession(): Promise<VerifiedFirebaseSession | null> {
  const headerList = await nextHeaders();
  const headerToken = extractBearerToken(headerList);
  if (headerToken) {
    return tryVerifyToken(headerToken);
  }

  const cookieStore = await cookies();
  for (const name of configuredCookieNames()) {
    const token = normaliseToken(cookieStore.get(name)?.value ?? null);
    if (!token) {
      continue;
    }

    try {
      return await tryVerifyToken(token);
    } catch (error) {
      // Continue trying other cookies before giving up.
      if (error instanceof FirebaseAuthError && error.status === 401) {
        continue;
      }
      throw error;
    }
  }

  return null;
}

export async function requireServerAuthSession(): Promise<VerifiedFirebaseSession> {
  const session = await getServerAuthSession();
  if (!session) {
    throw new FirebaseAuthError('Missing Firebase ID token', 401);
  }

  return session;
}
