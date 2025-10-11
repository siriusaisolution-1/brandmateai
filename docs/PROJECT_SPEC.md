# BrandMate Project Specification

## Vision and Goals
- Deliver BrandMate as an AI-first marketing SaaS that automates content ideation, production, and distribution across channels.
- Complete the migration from Firebase Studio to the Codex runtime while preserving existing Firebase integrations (Auth, Firestore, Storage, Functions).
- Integrate external providers (Novita.ai, Stripe, SendGrid, Genkit/Gemini, Sentry) behind consistent abstractions so both the Next.js frontend and Firebase Functions share typed contracts.
- Establish a reliable delivery pipeline (GitHub → Codex) with observability, cost controls, and a documented operating playbook ready for production launch.
- Achieve and maintain ≥80% automated test coverage prior to production GA.

## System Architecture Overview
- **Frontend**: Next.js 15 (App Router) with React 18, TailwindCSS, React Query, Firebase client SDK, and shared Firestore typings.
- **Backend**: Firebase Functions (Gen 2) deployed through Codex, using Genkit flows for AI orchestration, Stripe for billing, and SendGrid for transactional e-mail.
- **Data Layer**: Firebase Auth for identity, Firestore for persisted entities (brands, campaigns, media assets, analytics), Firebase Storage for media blobs.
- **AI & Media Integrations**:
  - Genkit + Google Gemini models for text and strategic analysis flows.
  - Novita.ai for video generation, inpainting, background removal, upscaling.
- **Observability & Operations**: Sentry for error tracking (client, server, edge), structured logging in Functions, GitHub Actions for CI/CD to Codex, and Codex-managed secrets & environment variables.

## Sprint Roadmap
### Sprint 1 – Foundation
- Stabilize dependency management under pnpm 10.2.1 (Corepack enabled).
- Harden TypeScript configuration for both the Next.js workspace and Firebase Functions package.
- Establish a Gen2-compatible Functions build pipeline executed in CI.
- **Exit criteria**: Clean `pnpm install`, `pnpm lint --max-warnings=0`, `pnpm typecheck`, successful Functions deploy via Codex pipeline.

### Sprint 2 – AI Core
- Migrate legacy flows to `@genkit-ai/googleai`.
- Refactor flows to use `ai.defineFlow` with Zod validation on inputs/outputs.
- Integrate Novita.ai with retry/backoff helpers and signed asset URL resolution.
- **Exit criteria**: All flows pass emulator smoke tests; Novita tasks complete without errors; developer UI displays flow outputs end-to-end.

### Sprint 3 – Security & Runtime
- Audit Firebase/Codex rules for least privilege and SSRF protection for auxiliary services.
- Ensure all secrets originate from Codex Secret Manager (no `functions.config()` fallback).
- Align Next.js runtime targets (Node.js vs Edge) per API requirements; add SSRF/abuse mitigations.
- **Exit criteria**: Emulator confirms rule protections; zero hard-coded secrets; build stable without runtime mismatches.

### Sprint 4 – Ops & Scale ✅
- Implement centralized observability (Sentry, structured logs, metrics dashboards).
- Introduce rate limiting and cost controls for AI flows and external APIs.
- Finalize GitHub Actions CI/CD pipeline with quality gates (lint, typecheck, tests, Functions build) ahead of Codex deploy.
- **Exit criteria**: Metrics visible in Codex/GCP; rate limiting enforced in prod; pipeline green through deploy stage.

### Sprint 5 – Polish & Maintenance ✅
- Build automated test harness covering unit, integration, and E2E scenarios.
- Produce comprehensive documentation/playbooks (setup, deploy, on-call, rollback).
- **Exit criteria**: ≥80% test coverage; onboarding playbook enables new engineer to deploy unaided.

## Progress Snapshot
- ✅ Sentry wired for client/server/edge with structured logs and metrics helpers in Functions and scraper-service.
- ✅ Rate limiting enforced for callable analytics/billing and scraper-service via env-configured token buckets.
- ✅ GitHub Actions deploy workflow now requires lint, typecheck, unit tests, e2e smoke, and build before release.
- ✅ Vitest unit harness covers AI usage tracker, media asset resolver, and flow clients with coverage thresholds at 80%.
- ✅ Playwright smoke suite validates marketing landing and `/health` heartbeat via auto-started dev server.
- ✅ `/health` endpoint responds with JSON heartbeat for uptime probes.
- ✅ Operational playbook and SPEC_STATUS tracking document release readiness.
- ✅ Coverage run via `pnpm test:unit` reports 84% statements/lines with V8 instrumentation; additional suites keep this guard.

## Quality Gates & Ongoing Controls
- Mandatory checks per PR: `pnpm lint --max-warnings=0`, `pnpm typecheck`, `pnpm build`, targeted smoke tests (`pnpm test` or emulator suites as applicable).
- Secrets inventory maintained in `docs/ENVIRONMENT.md` with Codex Secret Manager as source of truth.
- Regular dependency audits (`pnpm outdated`, scripts in `scripts/`) and automated vulnerability scans.
- Runtime health verification via `/health` endpoint and periodic flow smoke tests.

## Assumptions & Notes
- Codex project manages deployment credentials and secret provisioning; values are not committed.
- Novita.ai, Stripe, SendGrid usage incurs variable costs—rate limiting and sandbox modes must be respected in lower environments.
- The specification will evolve alongside product discovery; gap analysis and backlog grooming are required at the end of each sprint.
