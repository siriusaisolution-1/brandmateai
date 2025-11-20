# Environment Configuration (Local & Codex)

This project relies on Firebase (client + admin), Sentry, and AI provider keys. Use the templates below to configure local development and make sure secrets are never committed.

## Local development

1. Copy `.env.example` to `.env.local` in the repo root.
2. Populate the Firebase web app config values from your Firebase console (Project settings → General → Your apps).
3. If you run Functions locally, also export the same values to your shell or to a `.env` file inside `functions/` as needed.
4. Start the dev server with `pnpm dev`.

### Required for Next.js (client)

Set these in `.env.local` so the browser SDK can initialize:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Optional client flags: `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`, `NEXT_PUBLIC_USE_LONG_POLLING`, `NEXT_PUBLIC_ALLOWED_DEV_ORIGINS`, `NEXT_PUBLIC_FEATURE_WATCHTOWERS`, Sentry sampling envs.

### Required for server features

Set these in `.env.local` for server routes and tooling:

- `FIREBASE_SERVICE_ACCOUNT_BASE64` (preferred) or `FIREBASE_SERVICE_ACCOUNT` JSON
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_PROJECT_ID` / `GOOGLE_CLOUD_PROJECT`
- `SENTRY_DSN` (if you want error reporting locally)
- `GOOGLE_GENAI_API_KEY`, `NOVITA_API_KEY`, `GEMINI_MODEL_ID`, `ENCRYPTION_KEY` (AI + token encryption)
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` for billing flows when enabled

Testing helpers (optional): `BRANDMATE_E2E_SESSION_TOKEN`, `BRANDMATE_E2E_ADMIN_TOKEN`, `PLAYWRIGHT_TEST_BASE_PORT`.

## Codex / hosted environments

Configure the same variables in the Codex console:

- **Secrets**: all non-public values (service accounts, Stripe, Novita, GenAI, Sentry server DSN).
- **Environment variables**: public build-time values such as `NEXT_PUBLIC_FIREBASE_*`, `NEXT_PUBLIC_SENTRY_*`, feature flags, release metadata (`SENTRY_RELEASE`, `NEXT_PUBLIC_APP_VERSION`).

Redeploy Functions after changing secrets so the new values propagate to the runtime.
