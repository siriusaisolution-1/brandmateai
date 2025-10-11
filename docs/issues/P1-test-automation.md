# P1: Establish Automated Test Harness and Coverage Reporting

## Background
The project specification requires ≥80% automated test coverage and emulator smoke tests for AI flows, but the repository lacks any `pnpm test` script, unit/integration suites, or coverage tooling.【F:docs/PROJECT_SPEC.md†L47-L60】【F:package.json†L10-L52】

## Problem Statement
Without automated tests, regressions in AI flows, billing, and UI cannot be detected before deployment, violating Sprint 5 exit criteria and blocking production readiness.

## Acceptance Criteria
- Introduce unit and integration test suites for both Next.js and Firebase Functions packages.
- Provide a `pnpm test` script (and `pnpm --filter functions test` if needed) that runs locally and in CI.
- Configure coverage reporting with a threshold ≥80% and publish results in CI artifacts.
- Add emulator-based smoke tests for Genkit/Novita flows with mocked external services to keep costs manageable.
- Document how to execute the test harness in README and operational playbooks.

## Dependencies / Notes
- Coordinate with CI quality gates so tests block merges/deploys.
- Mock Stripe, Novita, and Genkit calls to avoid external API spend during automated runs.
