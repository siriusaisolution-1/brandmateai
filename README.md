# Brandmate Studio

Brandmate Studio is a Next.js workspace paired with Firebase Cloud Functions
and supporting tooling. The repo uses pnpm workspaces to manage the monorepo
(deep dependencies live under `functions/` and `scraper-service/`).

## Quick Start

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
