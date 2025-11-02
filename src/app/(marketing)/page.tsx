import './_noop-client';
import { redirect } from "next/navigation";

import { HomePageClient } from "./_components/home-page-client";
import { FirebaseAuthError, getServerAuthSession } from "@/lib/auth/verify-id-token";

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

  return <HomePageClient />;
}
