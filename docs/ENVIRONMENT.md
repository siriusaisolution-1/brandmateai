# Environment Configuration

This document summarizes the runtime configuration required for BrandMate in the
Codex environment. Secrets are managed through the Codex console; public
settings live in the Codex Environment variables panel.

## Codex Secrets (server-side)

| Key | Purpose | Notes |
| --- | --- | --- |
| `NOVITA_API_KEY` | Authenticates Novita.ai image/video flows. | Required for all Novita callable functions and pollers. |
| `GOOGLE_GENAI_API_KEY` | Access token for Google GenAI via Genkit. | Required for every Genkit flow. |
| `GEMINI_MODEL_ID` | Overrides the default Gemini model (defaults to `gemini-1.5-pro-latest`). | Optional; set only if a different model is desired. |
| `ENCRYPTION_KEY` | 32-character key for encrypting OAuth tokens before persisting. | Required for auth trigger to store credentials. |
| `FIREBASE_SERVICE_ACCOUNT_BASE64` | Base64-encoded Firebase service account JSON. | Powers Admin SDK usage in Next.js server routes. |
| `FIREBASE_STORAGE_BUCKET` | Storage bucket used by Admin SDK helpers. | Should match the Firebase project configuration. |
| `SENTRY_DSN` | Server-side Sentry DSN. | Enables error reporting for API routes and server components. |
| `SENTRY_ENVIRONMENT` | Overrides the environment tag reported to Sentry. | Optional; defaults to `NODE_ENV`. |
| `SENTRY_TRACES_SAMPLE_RATE` / `SENTRY_PROFILES_SAMPLE_RATE` | Fine-grained sampling controls. | Optional numeric values between 0 and 1. |
| `STRIPE_SECRET_KEY` | Authenticates the Stripe SDK for checkout/session APIs. | Required for billing flows. |
| `STRIPE_WEBHOOK_SECRET` | Verifies webhook payload authenticity. | Required when deploying the Stripe webhook function. |

Configure these secrets under **Codex → Secrets** for the production and
staging environments. Redeploy Functions after updating secrets so new values
are picked up.

## Codex Environment (public + build-time)

| Key | Purpose |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase web app config. |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase web app config. |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase web app config. |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase web app config. |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase web app config. |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase web app config. |
| `NEXT_PUBLIC_SENTRY_DSN` | Browser Sentry DSN. |
| `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE` | Optional browser traces sampling rate override. |
| `NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE` / `NEXT_PUBLIC_SENTRY_REPLAYS_ERROR_SAMPLE_RATE` | Optional Replay sampling controls. |
| `NEXT_PUBLIC_FEAT_*` | Feature flags for admin, reports, video studio, newsletter, etc. |
| `SENTRY_ORG` / `SENTRY_PROJECT` | Build-time configuration for uploading sourcemaps. |

Set these values under **Codex → Environment** so they are available to both the
Next.js build and runtime. Keep `.env.local` in sync for local development.
