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
  },
];

const PLAN_REGISTRY: Record<PlanId, PlanConfig> = BASE_PLANS.reduce(
  (acc, plan) => ({ ...acc, [plan.id]: plan }),
  {} as Record<PlanId, PlanConfig>,
);

export function getPlanConfig(planId: string | undefined | null): PlanConfig {
  if (planId && planId in PLAN_REGISTRY) {
    return PLAN_REGISTRY[planId as PlanId];
  }
  return PLAN_REGISTRY.free;
}

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

