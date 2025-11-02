# Environment Variables

This project relies on a small set of environment variables for Firebase, Sentry, and local tooling. Secrets must **not** be committed; use the templates below to provision values per environment.

## Firebase (Client)

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Public Web API key for the Firebase project. |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Auth domain, e.g. `my-project.firebaseapp.com`. |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase/Google Cloud project identifier. |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Default Cloud Storage bucket used by the web app. |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender ID for the Firebase project. |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Web application ID from Firebase console. |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | (Optional) Analytics measurement ID. |
| `NEXT_PUBLIC_USE_LONG_POLLING` | Set to `1` to force Firestore long polling behind restrictive proxies. |
| `NEXT_PUBLIC_ALLOWED_DEV_ORIGINS` | Comma separated list of origins allowed during local development. |

## Firebase (Server/Admin)

| Variable | Description |
| --- | --- |
| `FIREBASE_SERVICE_ACCOUNT` | JSON string of the Firebase Admin service account (mutually exclusive with `FIREBASE_SERVICE_ACCOUNT_BASE64`). |
| `FIREBASE_SERVICE_ACCOUNT_BASE64` | Base64 encoded JSON for the Admin SDK credentials. |
| `FIREBASE_STORAGE_BUCKET` | Cloud Storage bucket used by background jobs and signed URLs. |
| `FIREBASE_PROJECT_ID` | Explicit project ID override for Admin SDK helpers. |
| `GOOGLE_CLOUD_PROJECT` / `GCP_PROJECT` | Optional Google Cloud project hints when running in GCP. |

## Sentry

| Variable | Description |
| --- | --- |
| `SENTRY_DSN` | Server-side DSN for reporting backend errors. |
| `NEXT_PUBLIC_SENTRY_DSN` | Browser DSN for client-side error reporting. |
| `SENTRY_ORG` | Sentry organisation slug, required for build-time sourcemap uploads. |
| `SENTRY_PROJECT` | Project slug used together with `SENTRY_ORG`. |
| `SENTRY_ENVIRONMENT` | Deploy environment label (e.g. `development`, `production`). |
| `SENTRY_TRACES_SAMPLE_RATE` | Fraction of backend traces to collect (`0`–`1`). |
| `SENTRY_PROFILES_SAMPLE_RATE` | Fraction of backend profiles to collect. |
| `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE` | Front-end tracing sample rate override. |
| `NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE` | Percentage of sessions captured by Sentry replays. |
| `NEXT_PUBLIC_SENTRY_REPLAYS_ERROR_SAMPLE_RATE` | Percentage of error sessions captured by replays. |

## Tooling & Tests

| Variable | Description |
| --- | --- |
| `NODE_ENV` | Standard Node environment flag. |
| `NEXT_TELEMETRY_DISABLED` | Set to `1` to disable Next.js telemetry during local/dev runs. |
| `PLAYWRIGHT_TEST_BASE_PORT` | Base port used when spinning up the dev server for Playwright tests. |

## Cloud Functions Secrets

- **Local development:** store required values in `functions/.env` (or export them before launching the Firebase emulator). Keys include `NOVITA_API_KEY`, `GOOGLE_GENAI_API_KEY`, Stripe credentials, and the `ENCRYPTION_KEY` used by auth triggers.
- **Production:** configure the same keys as Google Secret Manager secrets. Cloud Functions retrieve them at runtime via `@google-cloud/secret-manager` (see `functions/src/utils/secrets.ts`), so no environment variables need to be set manually in the deployed service.

## Templates

- Copy `env/.example` to `env/.local` (or your preferred filename) and inject local secrets.
- CI pipelines should provide the same keys as secure environment variables/secrets.
