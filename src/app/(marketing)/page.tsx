import type { Metadata } from "next";
import "./_noop-client";
import { redirect } from "next/navigation";

import { HomePageClient } from "./_components/home-page-client";
import ManifestNop from "@/components/manifest-nop";
import { FirebaseAuthError, getServerAuthSession } from "@/lib/auth/verify-id-token";

export const metadata: Metadata = {
  title: "BrandMate AI | AI marketing co-pilot",
  description:
    "Log in for free to BrandMate AI, create and schedule campaigns with AI, and pay only when you need more credits.",
};

export default async function HomePage() {
  try {
    const session = await getServerAuthSession();
    if (session) {
      redirect("/dashboard");
    }
  } catch (error) {
    if (error instanceof FirebaseAuthError && error.status === 401) {
      // Invalid tokens should behave as an anonymous visit.
    } else {
      throw error;
    }
  }

  return (
    <>
      <ManifestNop />
      <HomePageClient />
    </>
  );
}
