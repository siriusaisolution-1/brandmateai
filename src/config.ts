const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on']);
const FALSE_VALUES = new Set(['0', 'false', 'no', 'off']);

function normalizeFlag(value: string | undefined, fallback: boolean): boolean {
  if (typeof value !== 'string') {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (TRUE_VALUES.has(normalized)) {
    return true;
  }
  if (FALSE_VALUES.has(normalized)) {
    return false;
  }
  return fallback;
}

export function isWatchtowerEnabled(): boolean {
  if (typeof window !== 'undefined') {
    const override = window.__E2E_MOCKS__?.features?.watchtowersEnabled;
    if (typeof override === 'boolean') {
      return override;
    }
  }

  return FEATURE_WATCHTOWERS;
}

export const FEATURE_WATCHTOWERS = normalizeFlag(
  process.env.NEXT_PUBLIC_FEATURE_WATCHTOWERS,
  false
);

export const featureFlags = {
  watchtowers: isWatchtowerEnabled,
};
