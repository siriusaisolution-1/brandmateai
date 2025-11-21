import type { UserProfile } from '../types/firestore';

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

export const PLAN_DEFINITIONS: Record<SubscriptionPlanId, PlanDefinition> = {
  starter: {
    id: 'starter',
    label: 'Starter',
    limits: {
      maxVideosPerMonth: 20,
      maxImagesPerMonth: 100,
      maxRequestsPerMonth: 120,
    },
    description: 'Great for individual creators testing AI workflows.',
  },
  pro: {
    id: 'pro',
    label: 'Pro',
    limits: {
      maxVideosPerMonth: 80,
      maxImagesPerMonth: 400,
      maxRequestsPerMonth: 480,
    },
    description: 'For teams shipping campaigns weekly with more headroom.',
  },
  agency: {
    id: 'agency',
    label: 'Agency',
    limits: {
      maxVideosPerMonth: 200,
      maxImagesPerMonth: 1500,
      maxRequestsPerMonth: 1800,
    },
    description: 'High-volume tier for agencies managing multiple brands.',
  },
};

export function coercePlanId(plan?: string | null): SubscriptionPlanId {
  if (plan === 'pro' || plan === 'agency' || plan === 'starter') {
    return plan;
  }
  return 'starter';
}

export function getPlanForUser(user: UserProfile | null | undefined): PlanDefinition {
  const planId = coercePlanId(user?.subscriptionPlan);
  return PLAN_DEFINITIONS[planId];
}
