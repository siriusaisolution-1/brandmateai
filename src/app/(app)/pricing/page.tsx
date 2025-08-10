// src/app/(app)/pricing/page.tsx
import Link from "next/link";
import { Check, Crown, Rocket, Building2 } from "lucide-react";
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
  features: string[];
  ctaLabel: string;
  highlight?: boolean; // visual accent on Pro
}

const PLANS: Plan[] = [
  {
    id: "solo",
    name: "Solo",
    priceUsd: 99,
    bmk: 1000,
    tagline: "Everything you need to get started.",
    bestFor: "Solo creators and small projects",
    features: [
      "≈ 15–20 videos / month",
      "≈ 100+ photos & edits",
      "~25 SEO blog posts",
      "Access to all AI tools",
    ],
    ctaLabel: "Get Started",
  },
  {
    id: "pro",
    name: "Pro",
    priceUsd: 297,
    bmk: 3000,
    tagline: "The best balance of power and value.",
    bestFor: "Growing teams and SMB",
    features: [
      "≈ 45–60 videos / month",
      "≈ 300+ photos & edits",
      "~75 SEO blog posts",
      "Includes 2 brand LoRA trainings",
    ],
    ctaLabel: "Choose Pro",
    highlight: true,
  },
  {
    id: "agency",
    name: "Agency",
    priceUsd: 889,
    bmk: 9000,
    tagline: "Scale without limits.",
    bestFor: "Agencies and larger teams",
    features: [
      "≈ 150–200 videos / month",
      "≈ 900+ photos & edits",
      "Unlimited text content",
      "Includes 10 brand LoRA trainings",
    ],
    ctaLabel: "Go Agency",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceUsd: null,
    bmk: "Custom",
    tagline: "Security, SLA and bespoke integrations.",
    bestFor: "Enterprises and large organizations",
    features: [
      "Custom BMK quotas",
      "Dedicated Customer Success",
      "Advanced security & SSO",
      "Priority SLA, private models",
    ],
    ctaLabel: "Contact Sales",
  },
];

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

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero */}
      <div className="mx-auto mb-12 max-w-3xl text-center">
        <h1 id="pricing-v3-marker" className="text-4xl font-bold tracking-tight">
          Choose your plan — scale your content
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Transparent pricing. “BMK” are credits for AI text, image and video — use them however you like.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          1 BMK ≈ $0.10 (indicative)
        </p>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={`flex flex-col ${
              plan.highlight ? "border-primary ring-2 ring-primary/40" : ""
            }`}
          >
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
                <div className="text-xs text-muted-foreground">
                  Best for: {plan.bestFor}
                </div>
              </div>

              <ul className="space-y-2">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="mr-2 mt-0.5 h-4 w-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              {plan.id === "enterprise" ? (
                <Button asChild variant="secondary" className="w-full">
                  <Link href="/contact">Contact Sales</Link>
                </Button>
              ) : (
                <Button asChild className="w-full">
                  <Link href={`/signup?plan=${plan.id}`}>{plan.ctaLabel}</Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Included in all plans */}
      <section className="mx-auto mt-16 max-w-4xl">
        <h2 className="text-2xl font-semibold">Included in all plans</h2>
        <ul className="mt-4 grid grid-cols-1 gap-3 text-sm text-muted-foreground md:grid-cols-2">
          <li className="flex items-start">
            <Check className="mr-2 mt-0.5 h-4 w-4 text-green-500" />
            Brand Kit (logo, palette, brand voice)
          </li>
          <li className="flex items-start">
            <Check className="mr-2 mt-0.5 h-4 w-4 text-green-500" />
            Media Library with versioning
          </li>
          <li className="flex items-start">
            <Check className="mr-2 mt-0.5 h-4 w-4 text-green-500" />
            AI Audits & Social Plan generator
          </li>
          <li className="flex items-start">
            <Check className="mr-2 mt-0.5 h-4 w-4 text-green-500" />
            Email newsletter builder (MJML)
          </li>
          <li className="flex items-start">
            <Check className="mr-2 mt-0.5 h-4 w-4 text-green-500" />
            Basic content moderation
          </li>
          <li className="flex items-start">
            <Check className="mr-2 mt-0.5 h-4 w-4 text-green-500" />
            Email support
          </li>
        </ul>
      </section>

      {/* FAQ */}
      <section className="mx-auto mt-16 max-w-3xl">
        <h2 className="text-2xl font-semibold">FAQ</h2>
        <div className="mt-6 space-y-6 text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">How do BMK credits work?</p>
            <p className="mt-1">
              BMK are credits used for AI generation (text, images, video). Each operation consumes a predefined number of credits.
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
              <Link href="/contact" className="underline">
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
    </div>
  );
}
