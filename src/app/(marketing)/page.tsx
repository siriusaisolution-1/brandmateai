import type { Metadata } from "next";
import "./_noop-client";
import { redirect } from "next/navigation";

import Link from "next/link";

import { HomePageClient } from "./_components/home-page-client";
import { FirebaseAuthError, getServerAuthSession } from "@/lib/auth/verify-id-token";
import ManifestNop from "@/components/manifest-nop";
import { MarketingFooter } from "@/components/marketing-footer";
import { Button } from "@/components/ui/button";

function FinalCTA() {
  const faqs = [
    {
      question: "Do I need a card?",
      answer:
        "No. You can explore BrandMate AI and use your free BMK credits before adding any payment details.",
    },
    {
      question: "What do I get for free?",
      answer:
        "Access to all core tools, plus enough BMK credits to launch your first real campaigns.",
    },
    {
      question: "Can I cancel anytime?",
      answer:
        "Yes. You stay in control — upgrade, downgrade or cancel whenever it suits your team.",
    },
  ];

  return (
    <section className="container py-16 md:py-24 text-center" data-testid="final-cta">
      <div className="mx-auto max-w-2xl space-y-6">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Launch in minutes. Pay only when you outgrow free credits.
        </h2>
        <p className="text-muted-foreground">
          Create your workspace, invite collaborators and start shipping campaigns with AI assistance from day one. Upgrade
          your plan only when you need more BMK credits.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/login">Start now — log in for free</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/pricing">See pricing &amp; credits</Link>
          </Button>
        </div>
      </div>
      <div className="mt-12" data-testid="micro-faq">
        <dl className="grid gap-8 text-left sm:grid-cols-3">
          {faqs.map((faq) => (
            <div key={faq.question} className="space-y-2">
              <dt className="text-lg font-semibold">{faq.question}</dt>
              <dd className="text-sm text-muted-foreground">{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

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
      <FinalCTA />
      <MarketingFooter />
    </>
  );
}
