import { describe, expect, it } from 'vitest';

import { getAllowedBrandCountForUser, getPlanConfig } from './plans';

describe('plan registry and helpers', () => {
  it('returns base limit for starter without extras', () => {
    const allowed = getAllowedBrandCountForUser({ subscriptionPlan: 'starter' });
    expect(allowed).toBe(1);
  });

  it('returns base limit for agency without extra brands', () => {
    const allowed = getAllowedBrandCountForUser({ subscriptionPlan: 'agency' });
    expect(allowed).toBe(10);
  });

  it('adds extra brand counts for agency', () => {
    const allowed = getAllowedBrandCountForUser({
      subscriptionPlan: 'agency',
      subscriptionMeta: { extraBrandCount: 3 },
    });
    expect(allowed).toBe(13);
  });

  it('includes agency extra brand pricing in registry', () => {
    const plan = getPlanConfig('agency');
    expect(plan.extraBrandPriceUsd).toBe(30);
  });
});
