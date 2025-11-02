# BrandMate Operations Playbook

Authoritative runbook for the BrandMate monorepo. All commands assume Node.js 20 and `pnpm@10.2.1` (the version pinned in `package.json`).

## Local setup

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Copy the example environment if starting from scratch and adjust secrets as needed:
   ```bash
   cp env/.env.example .env.local
   ```
3. Required environment variables for a functional build:
   - `FIREBASE_SERVICE_ACCOUNT_BASE64` – base64 encoded service account JSON used by server utilities.
   - `FIREBASE_STORAGE_BUCKET` – storage bucket (e.g. `project-id.appspot.com`).
   - `NEXT_PUBLIC_FIREBASE_*` – client SDK bootstrap (API key, auth domain, project id, storage bucket, messaging sender id, app id).
   - `NEXT_PUBLIC_USE_LONG_POLLING` – set to `1` in restricted networks (otherwise leave at `0`).
   - Sentry DSNs (`SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`) when observability is desired.
4. Cloud Functions secrets: place values in `functions/.env` (or export them in your shell) when using the Firebase emulator. In production the same keys (`NOVITA_API_KEY`, `GOOGLE_GENAI_API_KEY`, Stripe secrets, encryption key, etc.) are stored in Google Secret Manager and loaded lazily at runtime—no manual environment configuration is required on deployed functions.

## Daily developer commands

| Purpose | Command |
| --- | --- |
| Format & lint | `pnpm lint` |
| Type safety | `pnpm typecheck` |
| Unit + integration tests with coverage | `pnpm test --coverage` |
| Playwright end-to-end suite | `pnpm exec playwright test` |
| Local dev server | `pnpm dev` |
| Production build | `pnpm build` |

Coverage reports are emitted to `coverage/` by Vitest. Thresholds are enforced at 80% for statements, branches, functions, and lines.

## Deployment pipeline

1. Ensure the main branch is green (lint, typecheck, unit/integration tests, and Playwright E2E).
2. Build the app: `pnpm build`.
3. Deploy via Firebase:
   ```bash
   pnpm fb:deploy
   ```
   This publishes Hosting assets and Cloud Functions.
4. Validate smoke checks:
   - `GET /health` should return `{ ok: true }`.
   - `GET /api/diag` should display the expected storage bucket and environment.
   - Run `pnpm exec playwright test` against the deployed preview channel if feasible.

### Rollback procedure

1. Identify the last known-good deployment tag.
2. Redeploy using Firebase Hosting channels:
   ```bash
   firebase hosting:channel:deploy rollback-<timestamp> --only hosting
   ```
3. For Cloud Functions regressions, redeploy the previous build artifact (or run `pnpm fb:deploy --only functions:<name>` with the earlier commit checked out).
4. Monitor Cloud Logging for errors and confirm `/health` is green before announcing recovery.

## Operational monitoring

- **Health checks:**
  - `GET /health` – lightweight heartbeat used by Cloud Run/Firebase.
  - `GET /api/diag` – verifies runtime environment variables (service account, storage bucket, Node version).
- **Logging:** Query Firebase/Cloud Logging for `rate-limit.*`, `scraper.*`, and `billing.*` entries when triaging incidents.
- **Rate limiting overrides:** Adjust `RATE_LIMIT_CALLS_PER_MIN` and `RATE_LIMIT_SCRAPER_PER_MIN` secrets to temporarily throttle abusive traffic.

## Incident response checklist

1. Confirm alert context in Sentry (request ID, user, release version).
2. Inspect Cloud Logging around the reported timestamp (focus on `scraper.request.failed` and `aiUsage` writes).
3. Verify Firebase quotas and Firestore indexes are healthy.
4. If upload issues are reported, hit `/api/media/get-upload-url` and `/api/media/get-read-url` with known-good credentials to reproduce.
5. Communicate status in #ops and create a retro ticket once mitigated.
