"use client";

import Link from "next/link";
import { Bot, Calendar, BarChart } from "lucide-react";

import { MarketingHeader } from "@/components/marketing-header";
import { ProofSection } from "@/components/proof-section";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function HomePageClient() {
  return (
    <>
      <MarketingHeader />

      <main>
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center text-center px-4">
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat [mask-image:linear-gradient(to_bottom,white_50%,transparent_100%)]" />

          <div className="z-20 relative space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
              The AI marketing workspace built to plan, create and scale
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
              Plan campaigns, generate copy, visuals and short videos, schedule posts, and keep every asset in one place. BrandMate AI brings strategy, production and operations into a single workspace.
            </p>
            <div className="text-sm text-muted-foreground">
              Start free and pay only when you need more BMK credits.
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/login">Log in for free</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#features">Explore features</Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link href="/pricing">See pricing</Link>
              </Button>
            </div>
          </div>
        </section>

        <ProofSection />

        {/* Feature Showcase Section */}
        <section id="features" className="container py-16 md:py-24 space-y-16">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold">
              An Entire Marketing Team in One Platform
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
              Stop jumping between docs, chat, design tools and schedulers. BrandMate AI centralizes strategy, content creation and delivery into one intelligent workflow.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-muted/20 border-none">
              <CardHeader>
                <Bot className="w-8 h-8 text-primary mb-2" />
                <CardTitle>AI Content Studio</CardTitle>
                <CardDescription>
                  Generate SEO-ready blog drafts, high-converting ad copy, social captions and email newsletters in minutes — all aligned with your Brand Kit.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-muted/20 border-none">
              <CardHeader>
                <Calendar className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Planner & Scheduler</CardTitle>
                <CardDescription>
                  Plan campaigns on a drag-and-drop calendar, adapt content for each channel, and schedule posts at the best times.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-muted/20 border-none">
              <CardHeader>
                <BarChart className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Media Library & Brand Kit</CardTitle>
                <CardDescription>
                  Store every asset, version and preset in one place. Teach BrandMate AI your logo, colors and tone of voice so each new asset feels on-brand from day one.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        <section className="container py-16 md:py-24">
          <div className="max-w-4xl mx-auto space-y-6 text-center">
            <p className="text-xs font-semibold tracking-[0.3em] text-primary">AI CONTENT STUDIO</p>
            <h3 className="text-3xl md:text-4xl font-bold">Create high-performing content in minutes</h3>
            <p className="text-muted-foreground">
              Go from idea to ready-to-edit draft with AI that understands your brand, audience and goals. BrandMate AI helps you ship more campaigns without burning out your team.
            </p>
            <ul className="grid gap-4 text-left md:grid-cols-2">
              <li className="rounded-lg border border-border/50 bg-muted/10 p-4 text-sm">
                SEO-optimized drafts for blogs, landing pages and product pages
              </li>
              <li className="rounded-lg border border-border/50 bg-muted/10 p-4 text-sm">
                Ad copy and social posts for LinkedIn, Instagram, Facebook and X
              </li>
              <li className="rounded-lg border border-border/50 bg-muted/10 p-4 text-sm">
                Newsletter and lifecycle emails that match your tone of voice
              </li>
              <li className="rounded-lg border border-border/50 bg-muted/10 p-4 text-sm">
                Automatic variations for A/B testing and campaign refreshes
              </li>
              <li className="rounded-lg border border-border/50 bg-muted/10 p-4 text-sm">
                Image and short-form video generation with on-brand prompts
              </li>
              <li className="rounded-lg border border-border/50 bg-muted/10 p-4 text-sm">
                Saved prompts and templates for recurring campaigns
              </li>
            </ul>
          </div>
        </section>

        <section className="container py-16 md:py-24">
          <div className="max-w-4xl mx-auto space-y-6 text-center">
            <p className="text-xs font-semibold tracking-[0.3em] text-primary">PLANNER &amp; SCHEDULER</p>
            <h3 className="text-3xl md:text-4xl font-bold">Plan once, publish everywhere</h3>
            <p className="text-muted-foreground">
              See your entire marketing calendar in one view. Drag, drop, adjust and let BrandMate AI handle channel-specific copy and timing.
            </p>
            <ul className="grid gap-4 text-left md:grid-cols-2">
              <li className="rounded-lg border border-border/50 bg-muted/10 p-4 text-sm">
                Drag-and-drop calendar with daily, weekly and monthly views
              </li>
              <li className="rounded-lg border border-border/50 bg-muted/10 p-4 text-sm">
                Channel-specific variations for social, blog and email
              </li>
              <li className="rounded-lg border border-border/50 bg-muted/10 p-4 text-sm">
                Quick rescheduling when campaigns or priorities change
              </li>
              <li className="rounded-lg border border-border/50 bg-muted/10 p-4 text-sm">
                Optional reminders so nothing slips through the cracks
              </li>
            </ul>
          </div>
        </section>

        <section className="container py-16 md:py-24">
          <div className="max-w-4xl mx-auto space-y-6 text-center">
            <p className="text-xs font-semibold tracking-[0.3em] text-primary">MEDIA LIBRARY</p>
            <h3 className="text-3xl md:text-4xl font-bold">All your assets, always ready to reuse</h3>
            <p className="text-muted-foreground">
              Stop hunting through folders and old chats. BrandMate AI keeps every approved asset, version and preset at your fingertips.
            </p>
            <ul className="grid gap-4 text-left md:grid-cols-2">
              <li className="rounded-lg border border-border/50 bg-muted/10 p-4 text-sm">
                Centralized library for images, videos, copy blocks and templates
              </li>
              <li className="rounded-lg border border-border/50 bg-muted/10 p-4 text-sm">
                Version history to track feedback and approvals
              </li>
              <li className="rounded-lg border border-border/50 bg-muted/10 p-4 text-sm">
                Presets for dimensions across major platforms (IG, FB, LinkedIn, X, etc.)
              </li>
              <li className="rounded-lg border border-border/50 bg-muted/10 p-4 text-sm">
                Search that understands campaign names, formats and goals
              </li>
            </ul>
          </div>
        </section>

        <section className="container py-16 md:py-24">
          <div className="max-w-4xl mx-auto space-y-6 text-center">
            <p className="text-xs font-semibold tracking-[0.3em] text-primary">BRAND KIT</p>
            <h3 className="text-3xl md:text-4xl font-bold">Teach the AI your brand once</h3>
            <p className="text-muted-foreground">
              Upload your logo, color palette, typography and brand voice so every new asset feels like it came from your in-house team.
            </p>
            <ul className="grid gap-4 text-left md:grid-cols-2">
              <li className="rounded-lg border border-border/50 bg-muted/10 p-4 text-sm">
                Logo, color palette, typography and messaging guidelines
              </li>
              <li className="rounded-lg border border-border/50 bg-muted/10 p-4 text-sm">
                Tone-of-voice guardrails to prevent off-brand copy
              </li>
              <li className="rounded-lg border border-border/50 bg-muted/10 p-4 text-sm">
                Visual style guidance for images and short-form videos
              </li>
              <li className="rounded-lg border border-border/50 bg-muted/10 p-4 text-sm">
                Reusable prompts and blueprints for specific campaign types
              </li>
            </ul>
          </div>
        </section>

        <section className="container py-16 md:py-24">
          <div className="max-w-4xl mx-auto space-y-6 text-center">
            <p className="text-xs font-semibold tracking-[0.3em] text-primary">COLLABORATION</p>
            <h3 className="text-3xl md:text-4xl font-bold">Keep your team and clients on the same page</h3>
            <p className="text-muted-foreground">
              Share workspaces with teammates and clients, collect feedback in one place and move from draft to 'go live' faster.
            </p>
            <ul className="grid gap-4 text-left md:grid-cols-2">
              <li className="rounded-lg border border-border/50 bg-muted/10 p-4 text-sm">
                Shared workspaces for internal teams and agencies
              </li>
              <li className="rounded-lg border border-border/50 bg-muted/10 p-4 text-sm">
                Commenting on drafts, assets and campaigns
              </li>
              <li className="rounded-lg border border-border/50 bg-muted/10 p-4 text-sm">
                Lightweight approval flows to keep stakeholders aligned
              </li>
              <li className="rounded-lg border border-border/50 bg-muted/10 p-4 text-sm">
                Role-based access to brands and workspaces
              </li>
            </ul>
          </div>
        </section>

        <section className="container py-16 md:py-24">
          <div className="max-w-5xl mx-auto space-y-6 text-center">
            <p className="text-xs font-semibold tracking-[0.3em] text-primary">INTEGRATIONS</p>
            <h3 className="text-3xl md:text-4xl font-bold">Connect the tools you already use</h3>
            <p className="text-muted-foreground">
              Plug BrandMate AI into your existing marketing stack to draft, approve and send campaigns faster.
            </p>
            <div className="grid gap-6 md:grid-cols-2 text-left">
              <div className="rounded-xl border border-border/50 bg-muted/10 p-6 space-y-4">
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/80">Available now</div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>SendGrid – send newsletters and campaigns</li>
                  <li>LinkedIn – publish posts directly or export content</li>
                </ul>
              </div>
              <div className="rounded-xl border border-border/50 bg-muted/10 p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-primary/80">
                  <span>Coming soon</span>
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">Coming soon</span>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Meta (Facebook &amp; Instagram)</li>
                  <li>TikTok</li>
                  <li>Google Analytics 4 (GA4)</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="container text-center py-16 md:py-24">
          <h2 className="text-3xl md:text-4xl font-bold">Launch in minutes. Pay only when you outgrow free credits.</h2>
          <p className="mt-4 max-w-xl mx-auto text-muted-foreground">
            Create your workspace, invite collaborators and start shipping campaigns with AI assistance from day one. Upgrade your plan only when you need more BMK credits.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/login">Start now — log in for free</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/pricing">See pricing &amp; credits</Link>
            </Button>
          </div>
        </section>
      </main>
    </>
  );
}
