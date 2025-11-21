import { beforeEach, describe, expect, it } from "vitest";

import { isBetaMode } from "./featureFlags";

describe("isBetaMode", () => {
  const original = process.env.NEXT_PUBLIC_BETA_MODE;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_BETA_MODE = original;
  });

  it("returns true when flag is set", () => {
    process.env.NEXT_PUBLIC_BETA_MODE = "true";
    expect(isBetaMode()).toBe(true);
  });

  it("returns false for any other value", () => {
    process.env.NEXT_PUBLIC_BETA_MODE = "false";
    expect(isBetaMode()).toBe(false);
    process.env.NEXT_PUBLIC_BETA_MODE = undefined;
    expect(isBetaMode()).toBe(false);
  });
});
