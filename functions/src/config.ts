// Centralized environment configuration for Cloud Functions runtime.

/**
 * Fetches an environment variable from `process.env`.
 * Throws a descriptive error when the variable is required but missing.
 */
const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

/**
 * Optional helper for environment variables that may fall back to a default.
 */
const optionalEnv = (name: string): string | undefined => {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
};

export const NOVITA_API_KEY = requireEnv('NOVITA_API_KEY');
export const GOOGLE_GENAI_API_KEY = requireEnv('GOOGLE_GENAI_API_KEY');
export const GEMINI_MODEL_ID = optionalEnv('GEMINI_MODEL_ID') ?? 'gemini-1.5-pro-latest';

export const ENCRYPTION_KEY = optionalEnv('ENCRYPTION_KEY');
export const HAS_VALID_ENCRYPTION_KEY =
  typeof ENCRYPTION_KEY === 'string' && ENCRYPTION_KEY.length === 32;

export { requireEnv, optionalEnv };
