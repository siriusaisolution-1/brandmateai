import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { AppWelcomeTour } from "./app-welcome-tour";

vi.mock("reactfire", () => ({
  useUser: () => ({ data: { uid: "user-123" }, status: "success" }),
  useFirestore: () => ({}),
  useFirestoreDocData: () => ({
    status: "success",
    data: { onboardingFlags: { hasSeenAppTour: false } },
  }),
}));

vi.mock("firebase/firestore", () => ({
  doc: vi.fn(() => ({})),
  setDoc: vi.fn(() => Promise.resolve()),
}));

vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));

describe("AppWelcomeTour", () => {
  it("shows the welcome copy when the tour has not been seen", () => {
    render(<AppWelcomeTour />);
    expect(screen.getByTestId("app-welcome-tour")).toBeInTheDocument();
    expect(screen.getByText(/Welcome to BrandMate v3/)).toBeVisible();
  });
});
