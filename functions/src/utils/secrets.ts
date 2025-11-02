import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

type SecretCache = Map<string, Promise<string | undefined>>;

let secretManagerClient: SecretManagerServiceClient | null = null;
const secretCache: SecretCache = new Map();

const getSecretManagerClient = (): SecretManagerServiceClient => {
  if (!secretManagerClient) {
    secretManagerClient = new SecretManagerServiceClient();
  }
  return secretManagerClient;
};

const getProjectId = (): string | undefined => {
  return (
    process.env.SECRET_MANAGER_PROJECT_ID ||
    process.env.GCLOUD_PROJECT ||
    process.env.GCP_PROJECT ||
    process.env.PROJECT_ID ||
    process.env.FUNCTIONS_PROJECT_ID ||
    undefined
  );
};

async function fetchSecretValue(name: string): Promise<string | undefined> {
  const envValue = process.env[name];
  if (envValue && envValue.length > 0) {
    return envValue;
  }

  const projectId = getProjectId();
  if (!projectId) {
    return undefined;
  }

  try {
    const client = getSecretManagerClient();
    const [version] = await client.accessSecretVersion({
      name: `projects/${projectId}/secrets/${name}/versions/latest`,
    });

    const value = version.payload?.data?.toString();
    if (value) {
      process.env[name] = value;
    }
    return value ?? undefined;
  } catch (error) {
    const err = error as { code?: number } | Error;
    if (typeof err === 'object' && err && 'code' in err && err.code === 5) {
      // Secret not found.
      return undefined;
    }
    throw error;
  }
}

const getCachedSecret = (name: string): Promise<string | undefined> => {
  const cached = secretCache.get(name);
  if (cached) {
    return cached;
  }

  const promise = fetchSecretValue(name);
  secretCache.set(name, promise);
  return promise;
};

export const getSecretValue = async (name: string): Promise<string | undefined> => {
  return getCachedSecret(name);
};

export const getRequiredSecretValue = async (name: string): Promise<string> => {
  const value = await getCachedSecret(name);
  if (value && value.length > 0) {
    return value;
  }
  throw new Error(`Missing required secret: ${name}`);
};

export const __resetSecretCacheForTests = (): void => {
  secretCache.clear();
  secretManagerClient = null;
};

