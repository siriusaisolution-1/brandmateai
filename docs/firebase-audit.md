# Firebase Collections Audit – Billing & Usage

This document tracks the Firestore collections related to billing, usage, and AI metering.

## Collections

### `users`
- **Fields**: `subscriptionPlan`, `billing.*`, `bmkBalance`, `bmkCredits`.
- **Purpose**: stores subscription tier and credit balances. Plans are resolved in code via the plan registry.

### `usageSnapshots`
- **Shape**:
  - `userId` (string)
  - `brandId` (string)
  - `yearMonth` (string, e.g. `2025-11` in UTC)
  - `videosGenerated` (number)
  - `imagesGenerated` (number)
  - `requestsProcessed` (number)
  - `updatedAt` (server timestamp)
- **Purpose**: per-user + per-brand counters that reset monthly. Used by the billing UI and `processContentRequest` limit checks.

### `aiUsage`, `aiCalls`, `aiUsageDaily`
- **Purpose**: token-level metering for LLM calls (existing from previous milestones). Still used by `trackAiCall`.

### `stripeEvents`
- **Purpose**: idempotency + audit for Stripe webhook events.

### `contentRequests`
- **Purpose**: orchestration status for content generation. The processContentRequest helper writes statuses such as `blocked_limit` and `completed`.

## Security Rules
- `usageSnapshots`: users can **only** read or write documents where `userId` matches `request.auth.uid`.
- Admin/Service roles are not required for these docs; backend functions use Admin SDK bypassing rules.

## Notes
- Year-month is computed in UTC to avoid timezone ambiguity.
- Limits and plan definitions live in code (`functions/src/billing/plans.ts`) and are mirrored in the Next.js app for UI display.
- No Stripe secrets are hard-coded; env placeholders live in `.env.example` and `docs/ENVIRONMENT.md`.
