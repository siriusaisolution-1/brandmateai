// src/lib/billing/plans.ts
// Frontend-facing billing/plan helpers.
// We re-export the canonical plan registry from functions to avoid drift.

export type {
  PlanId,
  PlanConfig,
  SubscriptionPlanId,
  PlanLimits,
  PlanDefinition,
} from "../../../functions/src/billing/plans";

export {
  PLAN_DEFINITIONS,
  coercePlanId,
  getPlanForUser,
  getPlanConfig,
  getAllowedBrandCountForUser,
  listPlans,
} from "../../../functions/src/billing/plans";