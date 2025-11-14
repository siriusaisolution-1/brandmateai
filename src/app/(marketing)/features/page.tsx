import type { Metadata } from "next";

import Link from "next/link";

import { MarketingHeader } from "@/components/marketing-header";
import { MarketingFooter } from "@/components/marketing-footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Features — BrandMate AI",
  description:
    "Plan campaigns, generate content and manage every asset with BrandMate AI. Content Studio, Planner & Scheduler, Media Library, Brand Kit and integrations — start for free and upgrade when you need more credits.",
  alternates: { canonical: "/features" },
  openGraph: {
    title: "BrandMate AI — Features",
    description:
      "AI platform built to plan, create and scale marketing: Content Studio, Planner, Media Library, Brand Kit, integrations.",
    url: "/features",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BrandMate AI — Features",
    description:
      "Create content, plan campaigns and store every asset — all in one workspace. Start free.",
  },
};

export default function FeaturesPage() {
  return (
    <>
      <MarketingHeader current="features" />
      <main className="pb-24">
        <section
          className="container py-16 text-center md:py-24"
          data-testid="features-hero"
        >
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            The AI marketing workspace built to plan, create and scale
          </h1>
          <p className="mt-4 mx-auto max-w-2xl text-muted-foreground">
            Plan campaigns, generate copy, visuals and video, schedule posts, and keep every asset in one place — BrandMate AI
            unites strategy, production, and execution in a single workspace. Start for free and only pay when you need more credits.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/login">Log in for free</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/pricing">See pricing &amp; credits</Link>
            </Button>
          </div>
        </section>

        <section className="container py-12" data-testid="features-content-studio">
          <h2 className="text-2xl font-semibold md:text-3xl">AI Content Studio</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Create SEO-ready blog posts, ad copy, social captions, newsletters, visuals and short video clips — in just a few
            minutes. BrandMate AI learns your Brand Kit so every asset feels on-brand and consistent across channels.
          </p>
          <ul className="mt-6 grid gap-3 text-sm text-muted-foreground md:grid-cols-2 lg:grid-cols-3">
            <li>SEO-ready drafts for blog and website pages</li>
            <li>Copy for ads, social posts and email campaigns</li>
            <li>Auto-generated variations and A/B test suggestions</li>
            <li>Image and short-form video generation</li>
            <li>One-click localization for new markets</li>
            <li>Save reusable prompts and templates for recurring campaigns</li>
          </ul>
        </section>

        <section className="container py-12" data-testid="features-planner">
          <h2 className="text-2xl font-semibold md:text-3xl">Planner &amp; Scheduler</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Plan campaigns and schedule content from a single drag-and-drop calendar. Generate content, adapt it to each
            channel and ship on time — without jumping between tools.
          </p>
          <ul className="mt-6 grid gap-3 text-sm text-muted-foreground md:grid-cols-2 lg:grid-cols-3">
            <li>Smart calendar with cross-channel overview</li>
            <li>Auto-draft suggestions and variations per channel</li>
            <li>Simple drag-and-drop scheduling and rescheduling</li>
            <li>Clear view of what’s planned, in review and published</li>
          </ul>
        </section>

        <section className="container py-12" data-testid="features-media-library">
          <h2 className="text-2xl font-semibold md:text-3xl">Media Library</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Keep every asset organized and ready to reuse. Versions, comments and presets for each network live in one place,
            so your team never starts from a blank page.
          </p>
          <ul className="mt-6 grid gap-3 text-sm text-muted-foreground md:grid-cols-2 lg:grid-cols-3">
            <li>File versioning and full edit history</li>
            <li>Presets for dimensions (IG, FB, LinkedIn, X, …)</li>
            <li>Organize assets by brand, campaign or channel</li>
            <li>Quickly remix top-performing creatives for new campaigns</li>
          </ul>
        </section>

        <section className="container py-12" data-testid="features-brand-kit">
          <h2 className="text-2xl font-semibold md:text-3xl">Brand Kit</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Teach the AI your brand once — and keep every piece of content consistent. BrandMate AI applies your guidelines
            to copy, visuals and layouts so your team moves faster without losing identity.
          </p>
          <ul className="mt-6 grid gap-3 text-sm text-muted-foreground md:grid-cols-2 lg:grid-cols-3">
            <li>Logo, color palette, typography and brand voice guide</li>
            <li>Guardrails that prevent off-brand messaging</li>
            <li>Consistent tone of voice across all channels</li>
            <li>Visual style presets for recognizable on-brand creatives</li>
          </ul>
        </section>

        <section className="container py-12" data-testid="features-integrations">
          <h2 className="text-2xl font-semibold md:text-3xl">Integrations</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Connect the tools you already use and ship campaigns faster. BrandMate AI fits into your stack instead of replacing
            it.
          </p>
          <ul className="mt-6 grid gap-3 text-sm text-muted-foreground md:grid-cols-2 lg:grid-cols-3">
            <li>SendGrid for email sending and newsletters</li>
            <li>LinkedIn publishing for company pages</li>
            <li className="opacity-80">
              Meta, TikTok, GA4 — <span className="italic">coming soon</span>
            </li>
          </ul>
        </section>

        <section className="container py-12" data-testid="features-collaboration">
          <h2 className="text-2xl font-semibold md:text-3xl">Collaboration</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Shared workspaces, comments and a simple approval flow. Everything your team needs to move from draft to “publish”
            without endless email threads.
          </p>
          <ul className="mt-6 grid gap-3 text-sm text-muted-foreground md:grid-cols-2 lg:grid-cols-3">
            <li>Team workspaces and basic approvals</li>
            <li>Role-based access to brands and workspaces</li>
            <li>Centralized history of assets and campaigns</li>
          </ul>
        </section>

        <section
          className="container py-16 text-center md:py-24"
          data-testid="features-cta"
        >
          <h2 className="text-3xl font-bold">Launch in minutes. Pay only when you outgrow free credits.</h2>
          <p className="mt-3 mx-auto max-w-2xl text-muted-foreground">
            Create your account, try every tool, and upgrade only when you need more BMK credits. No long-term contracts, no
            setup calls — just a focused AI marketing workspace ready to go.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/login">Log in for free</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/pricing">See pricing &amp; credits</Link>
            </Button>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
