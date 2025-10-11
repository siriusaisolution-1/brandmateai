# P1: Implement Rate Limiting and Cost Controls for AI/Novita Flows

## Background
Sprint 4 requires rate limiting and cost control across AI integrations to keep vendor spend predictable, yet the codebase lacks throttling utilities or usage caps for callable flows.【F:docs/PROJECT_SPEC.md†L47-L52】【F:functions/src/index.ts†L1-L22】

## Problem Statement
Unbounded access to Genkit and Novita flows can trigger runaway costs and potential abuse; there is no mechanism to enforce per-user/per-brand quotas or to short-circuit requests when limits are exceeded.

## Acceptance Criteria
- Design and implement a centralized rate limiting service usable by Functions and Next.js API routes (e.g., Firestore counters + token bucket, Redis, or Codex-native quota tools).
- Enforce per-user and global quotas on high-cost flows (video generation, LoRA training, strategic analysis) with descriptive error messaging for the UI.
- Instrument limits with logging/metrics so SRE/on-call can monitor consumption.
- Add configuration for environment-specific thresholds (dev vs prod) through Codex secrets or environment variables.
- Document the control strategy and escalation process in project docs.

## Dependencies / Notes
- Coordinate with the billing/credit system to ensure limits align with paid tiers.
- Ensure rate limiting bypasses or priority lanes are available for internal/admin tooling when necessary.
