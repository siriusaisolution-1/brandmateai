type MaybeAuth = { uid?: unknown; token?: { uid?: unknown } } | undefined;

export function extractAuthUserId(context: unknown): string | undefined {
  if (!context || typeof context !== 'object') {
    return undefined;
  }

  const ctx = context as Record<string, unknown>;
  const metadata = (ctx.metadata as Record<string, unknown> | undefined) ?? {};

  const candidates: unknown[] = [
    (ctx.auth as MaybeAuth)?.uid,
    (ctx.user as MaybeAuth)?.uid,
    (metadata.auth as MaybeAuth)?.uid,
    (metadata.firebase as { auth?: MaybeAuth } | undefined)?.auth?.uid,
    (metadata.user as MaybeAuth)?.uid,
    (metadata.caller as MaybeAuth)?.uid,
    (metadata.auth as MaybeAuth)?.token?.uid,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate;
    }
  }

  return undefined;
}
