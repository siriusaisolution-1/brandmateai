// functions/src/billing/plans.ts
// Unified plan registry:
// - Keeps Codex pricing/yearly/free/extra-brand logic
// - Preserves older main exports (PLAN_DEFINITIONS, coercePlanId, getPlanForUser)

import type { UserProfile } from '../types/firestore';

export type PlanId =
  | 'starter'
  | 'pro'
  | 'agency'
  | 'starter_yearly'
  | 'pro_yearly'
  | 'agency_yearly'
  | 'free';

export interface PlanConfig {
  id: PlanId;
  name: string;
  monthlyPriceUsd: number | null;
  yearlyPriceUsd?: number | null;
  baseBrandLimit: number;
  includedVideoPerMonth: number;
  includedImagePerMonth: number;
  extraBrandPriceUsd?: number;
  extraBrandIncludedVideoPerMonth?: number;
  extraBrandIncludedImagePerMonth?: number;
  billingInterval: 'monthly' | 'yearly' | 'free';
  marketingTagline?: string;
  /** Legacy/compat: max requests per month for this plan. */
  maxRequestsPerMonth?: number;
}

const BASE_PLANS: PlanConfig[] = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPriceUsd: 49,
    baseBrandLimit: 1,
    includedVideoPerMonth: 20,
    includedImagePerMonth: 100,
    billingInterval: 'monthly',
    marketingTagline: 'Kickstart AI content for a single brand.',
    maxRequestsPerMonth: 120,
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPriceUsd: 149,
    baseBrandLimit: 5,
    includedVideoPerMonth: 80,
    includedImagePerMonth: 400,
    billingInterval: 'monthly',
    marketingTagline: 'More capacity for growing teams and portfolios.',
    maxRequestsPerMonth: 480,
  },
  {
    id: 'agency',
    name: 'Agency',
    monthlyPriceUsd: 399,
    baseBrandLimit: 10,
    includedVideoPerMonth: 200,
    includedImagePerMonth: 1000,
    extraBrandPriceUsd: 30,
    extraBrandIncludedVideoPerMonth: 20,
    extraBrandIncludedImagePerMonth: 100,
    billingInterval: 'monthly',
    marketingTagline: 'Scale multi-brand operations with built-in headroom.',
    maxRequestsPerMonth: 1800,
  },
  {
    id: 'starter_yearly',
    name: 'Starter (Yearly)',
    monthlyPriceUsd: null,
    yearlyPriceUsd: 490,
    baseBrandLimit: 1,
    includedVideoPerMonth: 20,
    includedImagePerMonth: 100,
    billingInterval: 'yearly',
    marketingTagline: 'Pay yearly and get 2 months free.',
    maxRequestsPerMonth: 120,
  },
  {
    id: 'pro_yearly',
    name: 'Pro (Yearly)',
    monthlyPriceUsd: null,
    yearlyPriceUsd: 1490,
    baseBrandLimit: 5,
    includedVideoPerMonth: 80,
    includedImagePerMonth: 400,
    billingInterval: 'yearly',
    marketingTagline: 'Best value for scaling brands year-round.',
    maxRequestsPerMonth: 480,
  },
  {
    id: 'agency_yearly',
    name: 'Agency (Yearly)',
    monthlyPriceUsd: null,
    yearlyPriceUsd: 3990,
    baseBrandLimit: 10,
    includedVideoPerMonth: 200,
    includedImagePerMonth: 1000,
    extraBrandPriceUsd: 30,
    extraBrandIncludedVideoPerMonth: 20,
    extraBrandIncludedImagePerMonth: 100,
    billingInterval: 'yearly',
    marketingTagline: 'Agency at annual scale – 2 months free.',
    maxRequestsPerMonth: 1800,
  },
  {
    id: 'free',
    name: 'Free',
    monthlyPriceUsd: 0,
    baseBrandLimit: 1,
    includedVideoPerMonth: 0,
    includedImagePerMonth: 0,
    billingInterval: 'free',
    marketingTagline: 'Sandbox access for onboarding and trials.',
    maxRequestsPerMonth: 0,
  },
];

const PLAN_REGISTRY: Record<PlanId, PlanConfig> = BASE_PLANS.reduce(
  (acc, plan) => ({ ...acc, [plan.id]: plan }),
  {} as Record<PlanId, PlanConfig>,
);

/**
 * Get PlanConfig by id. Falls back to free.
 */
export function getPlanConfig(planId: string | undefined | null): PlanConfig {
  if (planId && planId in PLAN_REGISTRY) {
    return PLAN_REGISTRY[planId as PlanId];
  }
  return PLAN_REGISTRY.free;
}

/**
 * Allowed brand count = baseBrandLimit(plan or override) + extraBrandCount(meta)
 */
export function getAllowedBrandCountForUser(user: {
  subscriptionPlan?: string | null;
  subscriptionMeta?: {
    baseBrandLimit?: number;
    extraBrandCount?: number;
  } | null;
}): number {
  const plan = getPlanConfig(user.subscriptionPlan ?? undefined);
  const baseLimit = user.subscriptionMeta?.baseBrandLimit ?? plan.baseBrandLimit;
  const extra = user.subscriptionMeta?.extraBrandCount ?? 0;
  return baseLimit + extra;
}

/* -------------------------------------------------------------------------- */
/* Legacy-compatible exports from main branch                                  */
/* -------------------------------------------------------------------------- */

export type SubscriptionPlanId = 'starter' | 'pro' | 'agency';

export interface PlanLimits {
  maxVideosPerMonth: number;
  maxImagesPerMonth: number;
  maxRequestsPerMonth: number;
}

export interface PlanDefinition {
  id: SubscriptionPlanId;
  label: string;
  limits: PlanLimits;
  description?: string;
}

/**
 * Legacy view of the three core plans.
 * Backed by the unified PLAN_REGISTRY.
 */
export const PLAN_DEFINITIONS: Record<SubscriptionPlanId, PlanDefinition> = {
  starter: {
    id: 'starter',
    label: PLAN_REGISTRY.starter.name,
    limits: {
      maxVideosPerMonth: PLAN_REGISTRY.starter.includedVideoPerMonth,
      maxImagesPerMonth: PLAN_REGISTRY.starter.includedImagePerMonth,
      maxRequestsPerMonth: PLAN_REGISTRY.starter.maxRequestsPerMonth ?? 120,
    },
    description: PLAN_REGISTRY.starter.marketingTagline,
  },
  pro: {
    id: 'pro',
    label: PLAN_REGISTRY.pro.name,
    limits: {
      maxVideosPerMonth: PLAN_REGISTRY.pro.includedVideoPerMonth,
      maxImagesPerMonth: PLAN_REGISTRY.pro.includedImagePerMonth,
      maxRequestsPerMonth: PLAN_REGISTRY.pro.maxRequestsPerMonth ?? 480,
    },
    description: PLAN_REGISTRY.pro.marketingTagline,
  },
  agency: {
    id: 'agency',
    label: PLAN_REGISTRY.agency.name,
    limits: {
      maxVideosPerMonth: PLAN_REGISTRY.agency.includedVideoPerMonth,
      maxImagesPerMonth: PLAN_REGISTRY.agency.includedImagePerMonth,
      maxRequestsPerMonth: PLAN_REGISTRY.agency.maxRequestsPerMonth ?? 1800,
    },
    description: PLAN_REGISTRY.agency.marketingTagline,
  },
};

export function listPlans() {
  return PLAN_DEFINITIONS;
}

export function coercePlanId(plan?: string | null): SubscriptionPlanId {
  if (plan === 'pro' || plan === 'agency' || plan === 'starter') {
    return plan;
  }
  return 'starter';
}

export function getPlanForUser(
  user: UserProfile | null | undefined,
): PlanDefinition {
  const planId = coercePlanId(user?.subscriptionPlan);
  return PLAN_DEFINITIONS[planId];
}