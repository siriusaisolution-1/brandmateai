export interface BuildInfo {
  appVersion: string;
  gitSha: string;
  label: string;
}

export function getBuildInfo(): BuildInfo {
  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION ?? "dev";
  const gitSha =
    process.env.NEXT_PUBLIC_GIT_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.SENTRY_RELEASE ?? "unknown";

  const label = appVersion !== "dev" ? appVersion : gitSha;

  return { appVersion, gitSha, label };
}
