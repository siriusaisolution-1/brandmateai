"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

export function HomePageClient() {
  return (
    <div className="bg-[#0d0d12] text-zinc-100">
      <main className="relative mx-auto max-w-7xl px-6 pb-24 sm:px-8 lg:px-12">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-[#1a1a28] via-transparent to-transparent opacity-80" />

        {/* NAVIGATION */}
        <section
          id="navigation"
          className="relative z-10 py-8"
          aria-label="Primary navigation"
        >
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.6 }}
          >
            <nav className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur md:flex-row md:items-center md:justify-between">
              <div className="flex items-center justify-between gap-6">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/90 text-[#0d0d12] font-bold">
                    BM
                  </span>
                  <span>BrandMate AI</span>
                </Link>
                <div className="flex items-center gap-2 md:hidden">
                  <Button asChild variant="secondary" size="sm">
                    <Link href="/login">Log in</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/register">Start for free</Link>
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-300">
                <a href="#why" className="transition hover:text-white">
                  Why BrandMate AI
                </a>
                <a href="#how" className="transition hover:text-white">
                  How It Works
                </a>
                <a href="#studio" className="transition hover:text-white">
                  AI Content Studio
                </a>
                <a href="#planner" className="transition hover:text-white">
                  Planner &amp; Scheduler
                </a>
                <a href="#library" className="transition hover:text-white">
                  Media Library &amp; Brand Kit
                </a>
                <a href="#collaboration" className="transition hover:text-white">
                  Collaboration
                </a>
                <a href="#pricing" className="transition hover:text-white">
                  Pricing Preview
                </a>
              </div>
              <div className="hidden items-center gap-3 md:flex">
                <Button
                  asChild
                  variant="secondary"
                  className="bg-white/10 text-zinc-100 hover:bg-white/20"
                >
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Start for free</Link>
                </Button>
              </div>
            </nav>
          </motion.div>
        </section>

        {/* HERO */}
        <section id="hero" className="relative z-10 py-24 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="mx-auto flex max-w-3xl flex-col gap-8">
              <div className="inline-flex items-center justify-center gap-2 self-center rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm text-zinc-300">
                <span
                  className="h-2 w-2 rounded-full bg-emerald-400"
                  aria-hidden
                />
                AI marketing copilot for scaling brands
              </div>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Launch campaigns that feel handcrafted, powered by BrandMate AI
              </h1>
              <p className="text-lg text-zinc-300">
                Orchestrate strategy, production and publishing in one unified
                workspace. BrandMate AI turns messy marketing workflows into
                repeatable systems with AI that understands your brand voice.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/register">Create your free workspace</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="bg-white/10 text-zinc-100 hover:bg-white/20"
                >
                  <Link href="#video">Watch product tour</Link>
                </Button>
              </div>
              <p className="text-sm text-zinc-400">
                No credit card required • Unlimited collaborators on the free
                plan
              </p>
            </div>
          </motion.div>
        </section>

        {/* WHY */}
        <section id="why" className="relative z-10 py-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[1.3fr_1fr]">
              <div className="space-y-6">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400/80">
                  Why BrandMate AI
                </p>
                <h2 className="text-3xl font-semibold text-white sm:text-4xl">
                  Replace the patchwork of docs, decks and chat threads
                </h2>
                <p className="text-zinc-300">
                  Marketing teams lose hours every week recreating briefs,
                  rewriting copy and chasing approvals. BrandMate AI centralises
                  your playbooks, assets and schedules so ideas move from spark
                  to shipped campaign without friction.
                </p>
              </div>
              <div className="grid gap-4 text-sm text-zinc-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <h3 className="text-lg font-semibold text-white">
                    Strategic clarity
                  </h3>
                  <p>
                    Brief every initiative with reusable templates and AI
                    insights that keep teams aligned around outcomes, not tasks.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <h3 className="text-lg font-semibold text-white">
                    Creative firepower
                  </h3>
                  <p>
                    Generate long-form, short-form and multimedia content that
                    mirrors your brand voice and visual identity.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <h3 className="text-lg font-semibold text-white">
                    Operational momentum
                  </h3>
                  <p>
                    Automate handoffs, scheduling and reporting so your team
                    spends time crafting stories, not managing spreadsheets.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* VIDEO DEMO */}
        <section
          id="video"
          className="relative z-10 py-24"
          aria-labelledby="video-demo-heading"
        >
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="mx-auto max-w-5xl space-y-10 text-center">
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400/80">
                  Video Demo
                </p>
                <h2
                  id="video-demo-heading"
                  className="text-3xl font-semibold text-white sm:text-4xl"
                >
                  See BrandMate AI in action
                </h2>
                <p className="text-zinc-300">
                  Walk through the end-to-end workflow — from ideation and
                  AI-assisted creation to scheduling and campaign performance
                  tracking.
                </p>
              </div>
              <div className="aspect-video w-full rounded-3xl border border-dashed border-emerald-400/60 bg-white/5 backdrop-blur flex items-center justify-center text-sm text-zinc-400">
                Video demo placeholder
              </div>
            </div>
          </motion.div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="relative z-10 py-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="mx-auto max-w-5xl space-y-12 text-center">
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400/80">
                  How It Works
                </p>
                <h2 className="text-3xl font-semibold text-white sm:text-4xl">
                  From brief to publish in four guided steps
                </h2>
                <p className="text-zinc-300">
                  BrandMate AI orchestrates each milestone so nothing falls
                  through the cracks — even when campaigns span channels, teams
                  and stakeholders.
                </p>
              </div>
              <div className="grid gap-6 text-left sm:grid-cols-2">
                {[
                  "Import your goals and brand inputs in seconds.",
                  "Generate strategic briefs and creative concepts with guided AI prompts.",
                  "Collaborate on assets, feedback and approvals in one shared canvas.",
                  "Schedule and publish across every channel while tracking results in real time.",
                ].map((step, index) => (
                  <div
                    key={step}
                    className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6"
                  >
                    <span className="absolute -left-3 -top-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-lg font-semibold text-[#0d0d12]">
                      {index + 1}
                    </span>
                    <p className="pl-12 text-zinc-200">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* AI CONTENT STUDIO */}
        <section id="studio" className="relative z-10 py-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="mx-auto max-w-5xl space-y-10 text-center">
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400/80">
                  AI Content Studio
                </p>
                <h2 className="text-3xl font-semibold text-white sm:text-4xl">
                  Create once, tailor everywhere
                </h2>
                <p className="text-zinc-300">
                  Craft blogs, ads, social stories and email journeys with AI
                  copilots tuned to your brand tone and buyer personas.
                </p>
              </div>
              <div className="grid gap-6 text-left sm:grid-cols-2">
                {[
                  "SEO-ready blog outlines, drafts and pull-quotes in one click.",
                  "Paid campaign copy optimised for ROAS with instant channel variants.",
                  "Short-form video scripts with suggested visuals and captions.",
                  "Email nurture sequences built from your best-performing campaigns.",
                  "Image generation and editing that respects your brand guidelines.",
                  "Reusable prompt templates and brand-safe guardrails for every teammate.",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-zinc-200"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* PLANNER & SCHEDULER */}
        <section id="planner" className="relative z-10 py-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="mx-auto max-w-5xl space-y-10 text-center">
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400/80">
                  Planner &amp; Scheduler
                </p>
                <h2 className="text-3xl font-semibold text-white sm:text-4xl">
                  Stay ahead of every launch
                </h2>
                <p className="text-zinc-300">
                  Visualise your content plan, adapt instantly to new priorities
                  and let automations handle handoffs and reminders.
                </p>
              </div>
              <div className="grid gap-6 text-left sm:grid-cols-2">
                {[
                  "Drag-and-drop calendar with daily, weekly and campaign views.",
                  "Predictive send-times and auto-adjusted cadences by channel.",
                  "One-click rescheduling that updates briefs, assets and approvals.",
                  "Smart reminders so stakeholders review and approve on time.",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-zinc-200"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* MEDIA LIBRARY & BRAND KIT */}
        <section id="library" className="relative z-10 py-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="mx-auto max-w-5xl space-y-10 text-center">
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400/80">
                  Media Library &amp; Brand Kit
                </p>
                <h2 className="text-3xl font-semibold text-white sm:text-4xl">
                  Every asset, instantly on-brand
                </h2>
                <p className="text-zinc-300">
                  Store, search and reuse approved creative with brand rules
                  enforced automatically across teams and regions.
                </p>
              </div>
              <div className="grid gap-6 text-left sm:grid-cols-2">
                {[
                  "Centralised asset hub with AI-powered semantic search.",
                  "Version history and feedback timelines for every deliverable.",
                  "Brand guardrails covering tone, colour, typography and logos.",
                  "Export-ready presets for paid, organic and offline placements.",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-zinc-200"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* COLLABORATION */}
        <section id="collaboration" className="relative z-10 py-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="mx-auto max-w-5xl space-y-10 text-center">
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400/80">
                  Collaboration
                </p>
                <h2 className="text-3xl font-semibold text-white sm:text-4xl">
                  Keep every stakeholder in sync
                </h2>
                <p className="text-zinc-300">
                  Manage permissions, feedback and approvals without chasing
                  Slack messages or scattered docs.
                </p>
              </div>
              <div className="grid gap-6 text-left sm:grid-cols-2">
                {[
                  "Shared workspaces for in-house teams, agencies and clients.",
                  "Threaded feedback directly on assets with AI summarised actions.",
                  "Lightweight approvals with time-stamped decision trails.",
                  "Role-based access across brands, regions and campaign types.",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-zinc-200"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* INTEGRATIONS */}
        <section id="integrations" className="relative z-10 py-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="mx-auto max-w-5xl space-y-10 text-center">
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400/80">
                  Integrations
                </p>
                <h2 className="text-3xl font-semibold text-white sm:text-4xl">
                  Connect BrandMate AI to your stack
                </h2>
                <p className="text-zinc-300">
                  Ship faster by syncing data and automations with the tools
                  your team already relies on.
                </p>
              </div>
              <div className="grid gap-6 text-left sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <h3 className="text-lg font-semibold text-white">
                    Live integrations
                  </h3>
                  <ul className="mt-4 space-y-3 text-sm text-zinc-300">
                    <li>LinkedIn, Instagram and X publishing</li>
                    <li>SendGrid campaigns &amp; transactional email</li>
                    <li>Notion &amp; Google Drive brief syncing</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                    Coming soon
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">
                      Roadmap
                    </span>
                  </h3>
                  <ul className="mt-4 space-y-3 text-sm text-zinc-300">
                    <li>Meta Ads Manager &amp; TikTok Ads</li>
                    <li>HubSpot CRM and automation triggers</li>
                    <li>GA4 &amp; Looker Studio performance sync</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* INTERNAL BENCHMARKS */}
        <section id="benchmarks" className="relative z-10 py-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="mx-auto max-w-5xl space-y-10 text-center">
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400/80">
                  Internal Benchmarks
                </p>
                <h2 className="text-3xl font-semibold text-white sm:text-4xl">
                  Proof that BrandMate AI elevates performance
                </h2>
                <p className="text-zinc-300">
                  Teams running on BrandMate AI unlock creative capacity while
                  improving campaign results across the board.
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { stat: "58%", label: "Faster campaign turnaround" },
                  {
                    stat: "3.2x",
                    label: "Increase in multi-channel content shipped",
                  },
                  {
                    stat: "42%",
                    label: "Higher engagement on AI-optimised assets",
                  },
                  {
                    stat: "95%",
                    label: "Of teams report clearer collaboration",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/10 bg-white/5 p-6"
                  >
                    <p className="text-3xl font-semibold text-white">
                      {item.stat}
                    </p>
                    <p className="mt-2 text-sm text-zinc-300">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* PRICING PREVIEW */}
        <section id="pricing" className="relative z-10 py-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="mx-auto max-w-5xl space-y-12 text-center">
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400/80">
                  Pricing Preview
                </p>
                <h2 className="text-3xl font-semibold text-white sm:text-4xl">
                  Choose a plan that scales with your team
                </h2>
                <p className="text-zinc-300">
                  Start free, unlock more automation with Growth, or go all-in
                  with Enterprise. Switch plans anytime.
                </p>
              </div>
              <div className="grid gap-6 text-left sm:grid-cols-2 lg:grid-cols-3">
                {([
                  {
                    name: "Starter",
                    price: "$0",
                    descriptor: "per month",
                    features: [
                      "2 active brands",
                      "300 BMK credits",
                      "Unlimited collaborators",
                    ],
                  },
                  {
                    name: "Growth",
                    price: "$149",
                    descriptor: "per month",
                    features: [
                      "10 active brands",
                      "5,000 BMK credits",
                      "Advanced automations",
                    ],
                    highlighted: true as const,
                  },
                  {
                    name: "Enterprise",
                    price: "Custom",
                    descriptor: "annual agreements",
                    features: [
                      "Unlimited brands",
                      "Dedicated success partner",
                      "SOC 2 Type II compliance",
                    ],
                  },
                ] as {
                  name: string;
                  price: string;
                  descriptor: string;
                  features: string[];
                  highlighted?: boolean;
                }[]).map((plan) => (
                  <div
                    key={plan.name}
                    className={`rounded-2xl border ${
                      plan.highlighted
                        ? "border-emerald-400/60 bg-emerald-500/10"
                        : "border-white/10 bg-white/5"
                    } p-6`}
                  >
                    <h3 className="text-lg font-semibold text-white">
                      {plan.name}
                    </h3>
                    <p className="mt-4 flex items-baseline gap-2 text-3xl font-semibold text-white">
                      {plan.price}
                      <span className="text-sm font-normal text-zinc-400">
                        {plan.descriptor}
                      </span>
                    </p>
                    <ul className="mt-6 space-y-3 text-sm text-zinc-200">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <span
                            className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                            aria-hidden
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      asChild
                      className="mt-8 w-full"
                      variant={plan.highlighted ? "default" : "secondary"}
                    >
                      <Link
                        href={
                          plan.name === "Enterprise" ? "/contact" : "/register"
                        }
                      >
                        {plan.name === "Enterprise"
                          ? "Talk to sales"
                          : "Start for free"}
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* FAQ */}
        <section
          id="faq"
          className="relative z-10 py-24"
          aria-labelledby="faq-heading"
        >
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="mx-auto max-w-4xl space-y-10">
              <div className="text-center space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400/80">
                  FAQ
                </p>
                <h2
                  id="faq-heading"
                  className="text-3xl font-semibold text-white sm:text-4xl"
                >
                  Answers before you dive in
                </h2>
                <p className="text-zinc-300">
                  Everything you need to know about getting started with
                  BrandMate AI.
                </p>
              </div>
              <dl className="space-y-6">
                {[
                  {
                    question: "Do I need a credit card to sign up?",
                    answer:
                      "No. Your free workspace includes generous BMK credits so you can explore content creation, planning and collaboration without adding payment details.",
                  },
                  {
                    question: "What counts as a BMK credit?",
                    answer:
                      "BMK credits power AI generations across copy, images and video. Credits refresh monthly and unused credits roll for 30 days on paid plans.",
                  },
                  {
                    question: "Can agencies manage multiple clients?",
                    answer:
                      "Absolutely. Create dedicated workspaces per client with brand kits, permissions and reporting segmented for each relationship.",
                  },
                  {
                    question: "Is BrandMate AI secure?",
                    answer:
                      "We use enterprise-grade encryption, offer SSO/SAML, and comply with GDPR. Enterprise plans include SOC 2 Type II reports on request.",
                  },
                ].map((item) => (
                  <div
                    key={item.question}
                    className="rounded-2xl border border-white/10 bg-white/5 p-6"
                  >
                    <dt className="text-lg font-semibold text-white">
                      {item.question}
                    </dt>
                    <dd className="mt-2 text-sm text-zinc-300">
                      {item.answer}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </motion.div>
        </section>

        {/* FINAL CTA */}
        <section
          id="final-cta"
          className="relative z-10 py-24 text-center"
        >
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="mx-auto flex max-w-3xl flex-col gap-8">
              <h2 className="text-3xl font-semibold text-white sm:text-4xl">
                Bring your next campaign to life in BrandMate AI
              </h2>
              <p className="text-lg text-zinc-300">
                Spin up a workspace, import your brand kit and start shipping
                channel-perfect content with AI that feels like an extension of
                your team.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/register">Start for free</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="bg-white/10 text-zinc-100 hover:bg-white/20"
                >
                  <Link href="/pricing">Review plans &amp; credits</Link>
                </Button>
              </div>
              <p className="text-sm text-zinc-400">
                Join marketing teams at startups, scale-ups and agencies
                delivering better campaigns in less time.
              </p>
            </div>
          </motion.div>
        </section>

        {/* FOOTER */}
        <section id="footer" className="relative z-10 py-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <footer className="mx-auto flex max-w-6xl flex-col gap-12 rounded-2xl border border-white/10 bg-white/5 p-8">
              <div className="flex flex-col justify-between gap-8 lg:flex-row">
                <div className="space-y-4">
                  <Link
                    href="/"
                    className="flex items-center gap-2 text-lg font-semibold text-white"
                  >
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/90 text-[#0d0d12] font-bold">
                      BM
                    </span>
                    BrandMate AI
                  </Link>
                  <p className="max-w-sm text-sm text-zinc-300">
                    The AI marketing workspace for teams who want to ideate,
                    produce and launch high-performing campaigns without the
                    chaos.
                  </p>
                </div>
                <div className="grid flex-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-3 text-sm">
                    <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
                      Product
                    </h3>
                    <ul className="space-y-2 text-zinc-300">
                      <li>
                        <a
                          className="transition hover:text-white"
                          href="#why"
                        >
                          Overview
                        </a>
                      </li>
                      <li>
                        <a
                          className="transition hover:text-white"
                          href="#studio"
                        >
                          Content Studio
                        </a>
                      </li>
                      <li>
                        <a
                          className="transition hover:text-white"
                          href="#planner"
                        >
                          Planner &amp; Scheduler
                        </a>
                      </li>
                      <li>
                        <a
                          className="transition hover:text-white"
                          href="#integrations"
                        >
                          Integrations
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3 text-sm">
                    <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
                      Resources
                    </h3>
                    <ul className="space-y-2 text-zinc-300">
                      <li>
                        <Link
                          className="transition hover:text-white"
                          href="/pricing"
                        >
                          Pricing
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="transition hover:text-white"
                          href="/blog"
                        >
                          Blog
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="transition hover:text-white"
                          href="/webinars"
                        >
                          Webinars
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="transition hover:text-white"
                          href="/support"
                        >
                          Support
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3 text-sm">
                    <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
                      Company
                    </h3>
                    <ul className="space-y-2 text-zinc-300">
                      <li>
                        <Link
                          className="transition hover:text-white"
                          href="/about"
                        >
                          About
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="transition hover:text-white"
                          href="/careers"
                        >
                          Careers
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="transition hover:text-white"
                          href="/contact"
                        >
                          Contact
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3 text-sm">
                    <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
                      Legal
                    </h3>
                    <ul className="space-y-2 text-zinc-300">
                      <li>
                        <Link
                          className="transition hover:text-white"
                          href="/legal/privacy"
                        >
                          Privacy
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="transition hover:text-white"
                          href="/legal/terms"
                        >
                          Terms
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="transition hover:text-white"
                          href="/legal/security"
                        >
                          Security
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  © {new Date().getFullYear()} BrandMate AI. All rights
                  reserved.
                </p>
                <div className="flex items-center gap-4">
                  <Link
                    className="transition hover:text-white"
                    href="/status"
                  >
                    Status
                  </Link>
                  <Link
                    className="transition hover:text-white"
                    href="/partners"
                  >
                    Partners
                  </Link>
                  <Link
                    className="transition hover:text-white"
                    href="/newsletter"
                  >
                    Join newsletter
                  </Link>
                </div>
              </div>
            </footer>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
