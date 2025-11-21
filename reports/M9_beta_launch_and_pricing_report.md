# M9 – Closed Beta Launch & Pricing Alignment Report

## 1. Summary
Aligned pricing registry and UI for Starter/Pro/Agency monthly and yearly plans, added agency extra-brand support across data model and brand creation flow, and introduced health diagnostics plus build info exposure for the beta launch.

## 2. Pricing & Plans
- Plans implemented in shared billing registry (`src/lib/billing/plans.ts` and functions mirror) with Starter/Pro/Agency monthly and yearly SKUs, brand limits, and content allowances.
- Pricing page now shows monthly/yearly toggle with updated prices, limits, and Agency extra-brand notice.

## 3. Agency Extra Brands
- Model: `subscriptionMeta.baseBrandLimit` and `subscriptionMeta.extraBrandCount` on user documents; brand documents mark `isExtraBrand`.
- UI: /app/brands flow counts existing brands, blocks non-agency overages, and offers a modal to add extra brands for Agency (increments extraBrandCount and flags the brand).
- Ograničenja: No real Stripe charge yet; backend guard enforces limits and stores metadata for future billing.

## 4. Diagnostics & Monitoring
- Health endpoint: `/api/health` returns `{ status: "ok", env, timestamp }` (see `src/app/api/health/route.ts`). Existing `/health` remains.
- Build info: `src/lib/runtime/build-info.ts` surfaces env/git info in app shell footer.
- Sentry stub: `src/lib/monitoring/sentry.ts` no-ops when DSN is unset; global error boundary reports via wrapper.

## 5. Tests
- Novi testovi: `src/lib/billing/plans.test.ts`, `src/components/pricing/pricing-page.test.tsx`, `src/app/api/health/route.test.ts`.
- Komanda: `pnpm test:unit`
- Status: pass

## 6. Project state
- M9 status: done
- `codex.currentMilestoneId`: M10 (next milestone)
- Otvorene stavke za sledeći milestone: integrate real billing/Stripe for extra brands, sync brand limit enforcement into Firestore rules if feasible, expand UI badges for `isExtraBrand` across library/views.
