# Brandmate Studio

Brandmate Studio is a Next.js workspace paired with Firebase Cloud Functions
and supporting tooling. The repo uses pnpm workspaces to manage the monorepo
(deep dependencies live under `functions/` and `scraper-service/`).

## Local Development – Quickstart (M1)

1. **Clone the repo**
   ```bash
   git clone <this-repo-url>
   cd brandmateai
   ```
2. **Install dependencies**
   ```bash
   pnpm install
   ```
3. **Set up environment variables** – copy the template and fill in your Firebase web app config.
   ```bash
   cp .env.example .env.local
   ```
   Populate `NEXT_PUBLIC_FIREBASE_*` with values from Firebase → Project settings → General.
4. **Run the app**
   ```bash
   pnpm dev
   ```
   Visit http://localhost:3000, register or log in, and you will be redirected to `/dashboard` after authentication.

## Quick Start

The full CI-aligned setup remains available if you need the extra tooling.

1. **Install dependencies**
   ```bash
   pnpm -r install
   ```
2. **Provision environment variables** – copy the template and fill in the
   secrets described in [ENV.md](ENV.md).
   ```bash
   cp env/.example env/.local
   ```
3. **Install Playwright browsers** (first run only).
   ```bash
   pnpm exec playwright install --with-deps
   ```
4. **Verify the toolchain** – runs the same quality gates as CI (lint,
   type-check, tests, and builds).
   ```bash
   pnpm run check:all
   ```
5. **Start developing** – this boots the Next.js dev server and watches for
   changes.
   ```bash
   pnpm dev
   ```

## Before opening a PR

Run the fast pre-flight checks locally to mirror the CI gate:

```bash
pnpm run check:fast
```

## Common Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the Next.js development server. |
| `pnpm --filter functions emulators:start` | Launch Firebase emulators for Functions rules/testing. |
| `pnpm test:unit` | Run Vitest unit tests with coverage. |
| `pnpm exec playwright test` | Run Playwright end-to-end tests (staging-tagged specs excluded). |
| `pnpm exec playwright test --grep @staging` | Run the staging-tagged Playwright tests. |
| `pnpm run check:all` | Full CI-equivalent validation (lint → typecheck → tests → builds). |
| `pnpm build` | Create the production Next.js build. |

Refer to [ENV.md](ENV.md) and [`docs/`](docs) for deeper environment and
infrastructure documentation.

## Deployments

- **Vercel** – When redeploying after route group changes (directories in
  `src/app/(...)`), use the **Clear Build Cache** option so the build starts
  from a clean slate and picks up the new layout without stale artifacts from
  previous deployments.
