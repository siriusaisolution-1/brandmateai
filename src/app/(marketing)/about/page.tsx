import type { Metadata } from "next";
import Link from "next/link";

import { MarketingFooter } from "@/components/marketing-footer";
import { MarketingHeader } from "@/components/marketing-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About — BrandMate AI",
  description:
    "Learn why we built BrandMate AI: an AI content studio for video, visuals, and copy that keeps every brand consistent.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <MarketingHeader current="about" />
      <main className="pb-24">
        <section className="container py-16 md:py-24">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/80">
            Our Story
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            Building an AI content studio that feels like a creative partner
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
            BrandMate AI was created for founders, creators and lean marketing teams
            that need high-quality campaigns without hiring a full creative crew. We
            combine a master AI orchestrator, brand memory, and specialized agents
            for copy, visuals, and video so every launch feels intentional and on-brand.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/register">Start free trial</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/features">Explore the platform</Link>
            </Button>
          </div>
        </section>

        <section className="container grid gap-8 md:grid-cols-3" aria-label="Mission pillars">
          {["Focus", "Consistency", "Momentum"].map((pillar) => (
            <div key={pillar} className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="text-xl font-semibold">{pillar}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {pillar === "Focus"
                  ? "Master AI collects the brief, clarifies goals, and gives you a clear plan before spending credits."
                  : pillar === "Consistency"
                    ? "Brand memory keeps tone, colors, and audiences aligned across video, visuals, and copy."
                    : "Reusable workflows, calendar visibility, and analytics keep teams shipping week after week."}
              </p>
            </div>
          ))}
        </section>

        <section className="container mt-16 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold md:text-3xl">What guides the roadmap</h2>
            <p className="text-muted-foreground">
              We are building BrandMate v3 to serve small teams at scale: around 1–2k
              users that expect reliability, guardrails, and clear usage visibility.
              Every release focuses on keeping production smooth while protecting media
              budgets and brand integrity.
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Brief first, then AI — no runaway spend or hidden prompts.</li>
              <li>• Video, images, and copy in one place, with the same voice.</li>
              <li>• Practical analytics so you know what to repeat next month.</li>
            </ul>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Who we build for</h3>
            <p className="mt-2 text-muted-foreground">
              Solo founders, creators, and boutique agencies that need to ship campaigns
              quickly without sacrificing quality. If that sounds like you, we would love
              to hear your feedback as we expand the beta.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span className="rounded-full bg-muted px-3 py-1">Solo founders</span>
              <span className="rounded-full bg-muted px-3 py-1">Creators</span>
              <span className="rounded-full bg-muted px-3 py-1">Small agencies</span>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
