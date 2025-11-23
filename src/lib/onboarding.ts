// src/lib/onboarding.ts
export type OnboardingFlags = {
  hasSeenAppTour?: boolean;
};

export type OnboardingAware = {
  onboardingFlags?: OnboardingFlags | null;
};

export function shouldShowAppTour(user?: OnboardingAware | null): boolean {
  if (!user) {
    return true;
  }

  return user.onboardingFlags?.hasSeenAppTour !== true;
}
