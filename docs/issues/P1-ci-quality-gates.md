# P1: Add CI Quality Gates Prior to Firebase Deployments

## Background
The GitHub Actions workflow deploys to Firebase without running lint, typecheck, or tests, conflicting with the specification’s requirement for a green pipeline through quality gates before Codex deploy.【F:.github/workflows/firebase-deploy.yml†L1-L29】【F:docs/PROJECT_SPEC.md†L47-L52】

## Problem Statement
Deploying straight to production without static analysis or automated tests allows regressions (e.g., lint failures, TypeScript errors, failing functions) to reach users, increasing operational risk.

## Acceptance Criteria
- Update CI to execute `pnpm lint --max-warnings=0`, `pnpm typecheck`, `pnpm test`, and functions build prior to deployment steps.
- Configure workflows to fail fast if any gate fails; deployments should be skipped unless all quality checks pass.
- Cache pnpm store appropriately to keep runtimes acceptable (<10 minutes end-to-end).
- Surface command output as GitHub workflow artifacts or summaries for observability.
- Document the updated pipeline behavior in project docs and communicate process changes to the team.

## Dependencies / Notes
- Dependent on the test harness deliverable (P1-test-automation) to provide meaningful automated checks.
- Coordinate with Codex deployment requirements to ensure secrets/credentials remain available for new CI jobs.
