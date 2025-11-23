# M6 – Billing & Limits – Implementation Report

## 1. Summary
Implemented subscription-aware plan registry, monthly usage tracking, and limit enforcement. Added billing UI to display plan and usage, updated Firestore rules/tests for new collections, and documented Stripe placeholders.

## 2. Plan model & registry
- Files changed/added:
  - functions/src/billing/plans.ts
  - src/lib/billing/plans.ts
- Plan IDs and limits:
  - Starter: 20 videos / 100 images / 120 requests per month.
  - Pro: 80 videos / 400 images / 480 requests per month.
  - Agency: 200 videos / 1500 images / 1800 requests per month.
- How the plan is selected for a user.
  - `getPlanForUser` coerces `subscriptionPlan` on the user profile to a known plan, defaulting to Starter.

## 3. Usage tracking
- Firestore collections & fields:
  - `usageSnapshots` with `userId`, `brandId`, `yearMonth`, `videosGenerated`, `imagesGenerated`, `requestsProcessed`, `updatedAt`.
- Helper functions for reading/updating usage.
  - `getOrCreateUsageSnapshot`, `incrementUsage`, and `getUsageAndLimits` in Functions; mirrored client helper for UI.
- How `yearMonth` is computed.
  - Derived in UTC as `YYYY-MM` via `getCurrentYearMonth`.

## 4. Limit enforcement in processContentRequest
- Describe the limit-check logic:
  - check current usage + requested deltas against plan caps before invoking agents.
  - when limits exceeded, contentRequest status set to `blocked_limit` with limit reason.
- How usage increments are triggered after successful generation.
  - Usage deltas persisted via `incrementUsage` once agents return results.
- How agents/Novita calls are avoided when limits are exceeded.
  - Agents are not invoked when `checkLimits` fails; the request is short-circuited.

## 5. Billing UI (/app/billing)
- Route path:
  - /app/billing (under authenticated app shell).
- What the user sees (plan, usage, any upgrade CTA).
  - Current plan card, per-brand usage meters for videos/images/requests, upgrade placeholder CTA and plan comparison cards.
- How data is fetched on the frontend.
  - Reactfire fetches the user profile; client helper reads/initializes `usageSnapshots` for the selected brand.

## 6. Firestore rules & tests
- New/updated rules for usage/billing.
  - Added `usageSnapshots` match block restricting access to the authenticated owner.
- New/updated tests and what they validate.
  - Rules tests verify owner access and block cross-user reads/writes; Functions unit tests cover usage helpers and limit enforcement.

## 7. How to verify (for the owner)
1. Login with a test account.
2. Set `subscriptionPlan` in Firestore (e.g. starter).
3. Open `/app/billing` and confirm plan + usage appear.
4. Trigger one or more ContentRequests that:
   - (a) are under the limit → should succeed and move usage up.
   - (b) push over the limit → should be blocked and not create new outputs.
5. Re-open `/app/billing` to confirm usage numbers change.

## 8. Project state
- M6 status: done
- `codex.currentMilestoneId`: M7
- If not fully done, list what is missing and recommended next steps.
  - Stripe checkout UI and webhooks remain placeholder-only for now; upgrade CTA is non-functional.
