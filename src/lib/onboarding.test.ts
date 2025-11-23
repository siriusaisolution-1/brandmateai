import { describe, expect, it } from "vitest";

import { shouldShowAppTour } from "./onboarding";

describe("shouldShowAppTour", () => {
  it("returns true when user data is missing", () => {
    expect(shouldShowAppTour(undefined)).toBe(true);
    expect(shouldShowAppTour(null)).toBe(true);
  });

  it("returns true when flag is not set", () => {
    expect(shouldShowAppTour({})).toBe(true);
  });

  it("returns false when tour flag is true", () => {
    expect(shouldShowAppTour({ onboardingFlags: { hasSeenAppTour: true } })).toBe(false);
  });
});
