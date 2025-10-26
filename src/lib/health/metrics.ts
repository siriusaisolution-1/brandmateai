const serviceStartedAt = Date.now();

export type IntegrationHealth = {
  name: string;
  ok: boolean;
  details?: Record<string, unknown>;
};

export type HealthSnapshot = {
  ok: boolean;
  timestamp: string;
  uptimeSeconds: number;
  version: string;
  environment: string | undefined;
  integrations: IntegrationHealth[];
};

const resolveVersion = (): string => {
  return (
    process.env.NEXT_PUBLIC_APP_VERSION ??
    process.env.VERCEL_GIT_COMMIT_SHA ??
    process.env.SENTRY_RELEASE ??
    'dev'
  );
};

const resolveIntegrations = (): IntegrationHealth[] => {
  const isProd = process.env.NODE_ENV === 'production';

  const withConfigStatus = (name: string, configured: boolean): IntegrationHealth => ({
    name,
    ok: configured || !isProd,
    details: { configured },
  });

  return [
    withConfigStatus('sentry', Boolean(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN)),
    withConfigStatus('firebase', Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY)),
    withConfigStatus('ai-provider', Boolean(process.env.GOOGLE_GENAI_API_KEY || process.env.NOVITA_API_KEY)),
  ];
};

export const buildHealthSnapshot = (): HealthSnapshot => {
  const integrations = resolveIntegrations();
  const uptimeSeconds = Math.round(process.uptime());

  return {
    ok: integrations.every(integration => integration.ok),
    timestamp: new Date().toISOString(),
    uptimeSeconds,
    version: resolveVersion(),
    environment: process.env.NODE_ENV,
    integrations,
  } satisfies HealthSnapshot;
};

export const getServiceStartedAt = (): number => serviceStartedAt;
