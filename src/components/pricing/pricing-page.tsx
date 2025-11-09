'use client';

import Link from "next/link";
import { Check, Crown, Rocket, Building2 } from "lucide-react";

import { MarketingHeader } from "@/components/marketing-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type PlanId = "solo" | "pro" | "agency" | "enterprise";

interface Plan {
  id: PlanId;
  name: string;
  priceUsd: number | null; // null = custom
  bmk: number | "Custom";
  tagline: string;
  bestFor: string;
  outputs: string[];
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  highlight?: boolean; // visual accent on Pro
}

const ENTERPRISE_CONTACT_URL =
  process.env.NEXT_PUBLIC_ENTERPRISE_CONTACT_URL ?? "mailto:sales@brandmate.ai";

const PLANS: Plan[] = [
  {
    id: "solo",
    name: "Solo",
    priceUsd: 99,
    bmk: 1000,
    tagline: "Everything you need to get started.",
    bestFor: "Solo creators and small projects",
    outputs: [
      "≈ 15–20 videos / mo",
      "100+ photos & edits",
      "~25 SEO blog posts",
    ],
    features: [
      "Access to all AI tools",
      "1 brand LoRA training",
      "Basic analytics and reporting",
    ],
    ctaLabel: "Get Started",
    ctaHref: "/register?plan=solo",
  },
  {
    id: "pro",
    name: "Pro",
    priceUsd: 297,
    bmk: 3000,
    tagline: "The best balance of power and value.",
    bestFor: "Growing teams and SMB",
    outputs: [
      "≈ 45–60 videos / mo",
      "300+ photos & edits",
      "~75 SEO blog posts",
    ],
    features: [
      "Includes 2 brand LoRA trainings",
      "Team workspaces & approvals",
      "Priority rendering",
    ],
    ctaLabel: "Choose Pro",
    ctaHref: "/register?plan=pro",
    highlight: true,
  },
  {
    id: "agency",
    name: "Agency",
    priceUsd: 889,
    bmk: 9000,
    tagline: "Scale without limits.",
    bestFor: "Agencies and larger teams",
    outputs: [
      "≈ 150–200 videos / mo",
      "900+ photos & edits",
      "Unlimited text content",
    ],
    features: [
      "Includes 10 brand LoRA trainings",
      "Multi-brand asset management",
      "Advanced analytics & API access",
    ],
    ctaLabel: "Go Agency",
    ctaHref: "/register?plan=agency",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceUsd: null,
    bmk: "Custom",
    tagline: "Security, SLA and bespoke integrations.",
    bestFor: "Enterprises and large organizations",
    outputs: [
      "Tailored BMK allowances",
      "Dedicated AI pipelines",
      "Private content deployments",
    ],
    features: [
      "Custom BMK quotas",
      "Dedicated Customer Success",
      "Advanced security & SSO",
      "Priority SLA, private models",
    ],
    ctaLabel: "Contact Sales",
    ctaHref: ENTERPRISE_CONTACT_URL,
  },
];

interface PricingPageProps {
  variant?: "marketing" | "app";
}

function PlanIcon({ id }: { id: PlanId }) {
  switch (id) {
    case "solo":
      return <Rocket className="h-4 w-4" />;
    case "pro":
      return <Crown className="h-4 w-4" />;
    case "agency":
      return <Building2 className="h-4 w-4" />;
    default:
      return <Building2 className="h-4 w-4" />;
  }
}

export default function PricingPage({ variant = "marketing" }: PricingPageProps) {
  return (
    <div className="bg-background">
      {variant === "marketing" && <MarketingHeader current="pricing" />}

      <main className="container mx-auto px-4 py-12">
        {/* Hero */}
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h1 id="pricing-v3-marker" className="text-4xl font-bold tracking-tight">
            Choose your plan — scale your content
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Credits-based pricing for AI text, image and video. Use BMK on any generator and scale when you need more.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">1 BMK ≈ $0.10 (indicative)</p>
        </div>

        {/* Plans */}
        <div
          className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-4"
          data-testid="plans-grid"
        >
          {PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={`relative flex flex-col overflow-hidden ${
                plan.highlight ? "border-primary ring-2 ring-primary/40" : ""
              }`}
            >
              {plan.highlight && (
                <span
                  className="absolute -top-3 right-3 rounded-full bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground shadow"
                  data-testid="plan-pro-badge"
                >
                  Most popular
                </span>
              )}

              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <PlanIcon id={plan.id} />
                  {plan.name}
                </CardTitle>
                <CardDescription>{plan.tagline}</CardDescription>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col gap-6">
                <div className="space-y-1">
                  <div className="text-4xl font-bold leading-none">
                    {plan.priceUsd !== null ? `$${plan.priceUsd}` : "Custom"}
                    {plan.priceUsd !== null && (
                      <span className="ml-1 text-sm font-normal text-muted-foreground">
                        /month
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {typeof plan.bmk === "number"
                      ? `${plan.bmk.toLocaleString()} BMK`
                      : "Custom BMK"}
                  </div>
                  <div className="text-xs text-muted-foreground">Best for: {plan.bestFor}</div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
                    What you can create
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {plan.outputs.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 text-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start">
                      <Check className="mr-2 mt-0.5 h-4 w-4 text-green-500" />
                      <span className="text-sm text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button asChild className="w-full" variant={plan.id === "enterprise" ? "secondary" : "default"}>
                  <Link href={plan.ctaHref}>{plan.ctaLabel}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Included belt */}
        <section
          id="included"
          data-testid="included-belt"
          className="mt-16 rounded-xl border border-border/60 bg-muted/30 p-6"
        >
          <h2 className="text-xl font-semibold">Included in all plans</h2>
          <ul className="mt-6 grid grid-cols-1 gap-4 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-3">
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 text-primary" />
              Brand Kit (logo, palette, voice)
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 text-primary" />
              AI Audits & Social Plan generator
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 text-primary" />
              Basic content moderation
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 text-primary" />
              Media Library w/ versioning
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 text-primary" />
              Email newsletter builder (MJML)
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 text-primary" />
              Email support
            </li>
          </ul>
        </section>

        {/* FAQ */}
        <section className="mx-auto mt-16 max-w-3xl" id="faq">
          <h2 className="text-2xl font-semibold">FAQ</h2>
          <div className="mt-6 space-y-6 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">How do BMK credits work?</p>
              <p className="mt-1">
                BMK are credits used for AI generation (text, images, video). Each operation consumes a predefined number of
                credits.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground">Can I switch plans later?</p>
              <p className="mt-1">
                Yes — you can upgrade/downgrade anytime. Remaining credits carry over.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground">Do you offer enterprise terms?</p>
              <p className="mt-1">
                We do. SSO, custom quotas, private models and SLA —{" "}
                <Link href={ENTERPRISE_CONTACT_URL} className="underline">
                  contact us
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        <p className="mx-auto mt-12 max-w-3xl text-center text-xs text-muted-foreground">
          Prices are indicative and subject to change. Taxes/VAT are not included and depend on your jurisdiction.
        </p>
      </main>
    </div>
  );
}
