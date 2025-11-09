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
      answer: "Nope. Jump in without adding payment details and explore what BrandMate AI can do for you.",
    },
    {
      question: "What do I get for free?",
      answer:
        "Kick off with generous credits for generating campaigns, visuals, and insights—enough to launch real projects.",
    },
    {
      question: "Can I cancel anytime?",
      answer: "Absolutely. You stay in control and can upgrade, downgrade, or cancel whenever it suits your team.",
    },
  ];

  return (
    <section className="container py-16 md:py-24 text-center" data-testid="final-cta">
      <div className="mx-auto max-w-2xl space-y-6">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Launch in minutes. Pay only when you outgrow free credits.
        </h2>
        <p className="text-muted-foreground">
          Build your workspace, invite collaborators, and start delivering campaigns with AI assistance right away.
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
