# Environment Configuration (Local & Codex)

This project relies on Firebase (client + admin), Sentry, Stripe, and AI provider keys (GenAI/Gemini + Novita).  
Use the templates below to configure local development and hosted (Codex) environments, and make sure secrets are never committed.

---

## Local development

1. Copy `.env.example` to `.env.local` in the repo root.
2. Populate the Firebase web app config values from your Firebase console  
   (Project settings → General → Your apps).
3. If you run Functions locally, also export the same values to your shell or to a `.env`
   file inside `functions/` as needed.
4. Start the dev server with `pnpm dev`.

### Required for Next.js (client)

Set these in `.env.local` so the browser SDK can initialize:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Optional client flags (as needed):

- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
- `NEXT_PUBLIC_USE_LONG_POLLING`
- `NEXT_PUBLIC_ALLOWED_DEV_ORIGINS`
- `NEXT_PUBLIC_FEATURE_WATCHTOWERS`
- `NEXT_PUBLIC_SENTRY_DSN`
- `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE`
- `NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE`
- `NEXT_PUBLIC_SENTRY_REPLAYS_ERROR_SAMPLE_RATE`

### Required for server features

Set these in `.env.local` for server routes and tooling:

- `FIREBASE_SERVICE_ACCOUNT_BASE64` (preferred) or `FIREBASE_SERVICE_ACCOUNT` JSON
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_PROJECT_ID` / `GOOGLE_CLOUD_PROJECT`
- `SENTRY_DSN` (if you want error reporting locally)
- `GOOGLE_GENAI_API_KEY`, `NOVITA_API_KEY`, `GEMINI_MODEL_ID`, `ENCRYPTION_KEY`
  (AI + token encryption)
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` for billing flows when enabled

Testing helpers (optional):

- `BRANDMATE_E2E_SESSION_TOKEN`
- `BRANDMATE_E2E_ADMIN_TOKEN`
- `PLAYWRIGHT_TEST_BASE_PORT`

---

## Codex / hosted environments

Configure the same variables in the Codex console:

- **Secrets**: all non-public values (service accounts, Stripe, Novita, GenAI, server Sentry DSN).
- **Environment variables**: public build-time values such as `NEXT_PUBLIC_FIREBASE_*`,
  `NEXT_PUBLIC_SENTRY_*`, feature flags, and release metadata.

Redeploy Functions after changing secrets so the new values propagate to runtime.

### Codex Secrets (server-side)

| Key | Purpose | Notes |
| --- | --- | --- |
| `NOVITA_API_KEY` | Authenticates Novita.ai image/video flows. | Required for all Novita callable functions and pollers. |
| `GOOGLE_GENAI_API_KEY` | Access token for Google GenAI via Genkit. | Required for every Genkit flow. |
| `GEMINI_MODEL_ID` | Overrides the default Gemini model (defaults to `gemini-1.5-pro-latest`). | Optional; set only if a different model is desired. |
| `ENCRYPTION_KEY` | 32-character key for encrypting OAuth tokens before persisting. | Required for auth trigger to store credentials. |
| `FIREBASE_SERVICE_ACCOUNT_BASE64` | Base64-encoded Firebase service account JSON. | Powers Admin SDK usage in Next.js server routes and Functions. |
| `FIREBASE_STORAGE_BUCKET` | Storage bucket used by Admin SDK helpers. | Should match the Firebase project configuration. |
| `FIREBASE_PROJECT_ID` / `GOOGLE_CLOUD_PROJECT` | Firebase / GCP project identifier. | Ensure consistency across services. |
| `SENTRY_DSN` | Server-side Sentry DSN. | Enables error reporting for API routes and server components. |
| `SENTRY_ENVIRONMENT` | Overrides the environment tag reported to Sentry. | Optional; defaults to `NODE_ENV`. |
| `SENTRY_TRACES_SAMPLE_RATE` / `SENTRY_PROFILES_SAMPLE_RATE` | Fine-grained sampling controls. | Optional numeric values between 0 and 1. |
| `STRIPE_SECRET_KEY` | Authenticates the Stripe SDK for checkout/session APIs. | Required for billing flows. |
| `STRIPE_WEBHOOK_SECRET` | Verifies webhook payload authenticity. | Required when deploying Stripe webhook Functions. |

> Note: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is a public build-time setting (see below).  
If a hosted environment requires it as a secret for any reason, keep it duplicated in Env too.

### Codex Environment (public + build-time)

| Key | Purpose |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase web app config. |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase web app config. |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase web app config. |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase web app config. |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase web app config. |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase web app config. |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Optional Analytics/Measurement id. |
| `NEXT_PUBLIC_USE_LONG_POLLING` | Optional Firestore transport override. |
| `NEXT_PUBLIC_ALLOWED_DEV_ORIGINS` | Optional dev CORS/origin allowlist. |
| `NEXT_PUBLIC_FEATURE_WATCHTOWERS` | Optional feature flag grouping. |
| `NEXT_PUBLIC_SENTRY_DSN` | Browser Sentry DSN. |
| `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE` | Optional browser traces sampling rate override. |
| `NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE` | Optional Replay sampling controls. |
| `NEXT_PUBLIC_SENTRY_REPLAYS_ERROR_SAMPLE_RATE` | Optional Replay sampling controls. |
| `NEXT_PUBLIC_FEAT_*` | Feature flags for admin, reports, video studio, newsletter, etc. |
| `NEXT_PUBLIC_BETA_MODE` | Set to `true` during the closed beta to show banners/badges. Disable (`false`) once GA-ready. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Publishable key for client-side Stripe (upgrade CTA placeholder). |
| `SENTRY_ORG` / `SENTRY_PROJECT` | Build-time configuration for uploading sourcemaps. |
| `SENTRY_RELEASE` | Release id (often commit SHA). |
| `NEXT_PUBLIC_APP_VERSION` | Public app version string. |
| `VERCEL_GIT_COMMIT_SHA` | Optional host-provided commit SHA. |

Set these values under **Codex → Environment** so they are available to both the
Next.js build and runtime. Keep `.env.local` in sync for local development.

For local development the `.env.local` should keep `NEXT_PUBLIC_BETA_MODE=true`
so the banner and welcome tour are exercised. When deploying to Vercel or Codex
environments flip the variable to `false` once the beta label should disappear –
the UI reacts instantly after the next deployment.

---

## Usage tracking notes

- Monthly usage counters are stored in `usageSnapshots` documents keyed by `{userId}:{brandId}:{yearMonth}`.
- The Functions helper `processContentRequest` and the Billing UI both rely on these documents being readable by the authenticated user.