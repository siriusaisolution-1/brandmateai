// SINGLE SOURCE OF TRUTH: PRICING PAGE
// Ne uvoditi nove PLANS ili pricing stranice izvan ove komponente.
// Marketing ruta i App ruta uvoze ovu komponentu sa variant="marketing" | "app".
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Building2, Crown, Rocket } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import { getPlanConfig } from "@/lib/billing/plans";

const ENTERPRISE_CONTACT_URL =
  process.env.NEXT_PUBLIC_ENTERPRISE_CONTACT_URL ?? "mailto:sales@brandmate.ai";

type BillingCycle = "monthly" | "yearly";

interface DisplayPlan {
  id: "starter" | "pro" | "agency";
  name: string;
  monthlyPlanId: string;
  yearlyPlanId: string;
  bestFor: string;
  monthlyPrice: number;
  yearlyPrice: number;
  brandLimit: number;
  videos: number;
  images: number;
  highlight?: boolean;
  tagline: string;
  ctaHref: string;
}

const BASE_PLAN_DEFS: DisplayPlan[] = [
  {
    id: "starter",
    name: "Starter",
    monthlyPlanId: "starter",
    yearlyPlanId: "starter_yearly",
    monthlyPrice: getPlanConfig("starter").monthlyPriceUsd ?? 0,
    yearlyPrice: getPlanConfig("starter_yearly").yearlyPriceUsd ?? 0,
    brandLimit: getPlanConfig("starter").baseBrandLimit,
    videos: getPlanConfig("starter").includedVideoPerMonth,
    images: getPlanConfig("starter").includedImagePerMonth,
    bestFor: "Solo founders and creators",
    tagline: "Kickstart AI content with an included brand kit.",
    ctaHref: "/register?plan=starter",
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPlanId: "pro",
    yearlyPlanId: "pro_yearly",
    monthlyPrice: getPlanConfig("pro").monthlyPriceUsd ?? 0,
    yearlyPrice: getPlanConfig("pro_yearly").yearlyPriceUsd ?? 0,
    brandLimit: getPlanConfig("pro").baseBrandLimit,
    videos: getPlanConfig("pro").includedVideoPerMonth,
    images: getPlanConfig("pro").includedImagePerMonth,
    bestFor: "Growing teams & SMB marketing",
    tagline: "More headroom for campaigns across multiple brands.",
    highlight: true,
    ctaHref: "/register?plan=pro",
  },
  {
    id: "agency",
    name: "Agency",
    monthlyPlanId: "agency",
    yearlyPlanId: "agency_yearly",
    monthlyPrice: getPlanConfig("agency").monthlyPriceUsd ?? 0,
    yearlyPrice: getPlanConfig("agency_yearly").yearlyPriceUsd ?? 0,
    brandLimit: getPlanConfig("agency").baseBrandLimit,
    videos: getPlanConfig("agency").includedVideoPerMonth,
    images: getPlanConfig("agency").includedImagePerMonth,
    bestFor: "Agencies running many brands",
    tagline: "Multi-brand management with premium quotas.",
    ctaHref: "/register?plan=agency",
  },
];

function PlanIcon({ id }: { id: DisplayPlan["id"] }) {
  switch (id) {
    case "starter":
      return <Rocket className="h-4 w-4" />;
    case "pro":
      return <Crown className="h-4 w-4" />;
    case "agency":
      return <Building2 className="h-4 w-4" />;
    default:
      return <Building2 className="h-4 w-4" />;
  }
}

interface PricingPageProps {
  variant?: "marketing" | "app";
}

export default function PricingPage({ variant = "marketing" }: PricingPageProps) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  const plans = useMemo(() => BASE_PLAN_DEFS, []);

  const billingLabel = billingCycle === "monthly" ? "Monthly" : "Yearly";
  const ctaSuffix = billingCycle === "monthly" ? "month" : "year";

  return (
    <div className="bg-background">
      {variant === "marketing" && <MarketingHeader />}

      <section className="container pb-16 pt-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="text-primary font-semibold">Pricing</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            Choose your plan — scale your content
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Transparent, usage-aware plans with monthly or yearly billing. Yearly plans include 2 months free.
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <span className={`text-sm ${billingCycle === "monthly" ? "font-semibold" : "text-muted-foreground"}`}>
              Monthly
            </span>
            <Switch
              aria-label="Toggle billing cycle"
              checked={billingCycle === "yearly"}
              onCheckedChange={(checked) => setBillingCycle(checked ? "yearly" : "monthly")}
            />
            <span className={`text-sm ${billingCycle === "yearly" ? "font-semibold" : "text-muted-foreground"}`}>
              Yearly (2 months free)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3" data-testid="plans-grid">
          {plans.map((plan) => {
            const price = billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
            const planIdForCta = billingCycle === "monthly" ? plan.monthlyPlanId : plan.yearlyPlanId;

            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col ${
                  plan.highlight ? "border-primary ring-2 ring-primary/40 overflow-visible" : "overflow-hidden"
                }`}
              >
                {plan.highlight && (
                  <span
                    className="absolute -top-2 right-3 z-10 rounded-full bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground shadow"
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
                      ${price}
                      <span className="ml-1 text-sm font-normal text-muted-foreground">
                        /{billingCycle === "monthly" ? "month" : "year"}
                      </span>
                    </div>
                    {billingCycle === "yearly" && (
                      <div className="text-xs text-green-600">2 months free</div>
                    )}
                    <div className="text-sm text-muted-foreground">Up to {plan.brandLimit} brands included</div>
                    <div className="text-xs text-muted-foreground">Best for: {plan.bestFor}</div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
                      Included output per month
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 text-primary" />
                        <span>{plan.videos} videos</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 text-primary" />
                        <span>{plan.images} images</span>
                      </li>
                    </ul>
                  </div>

                  {plan.id === "agency" && (
                    <div className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground" data-testid="agency-extra-note">
                      +30 USD / month per extra brand (includes +20 videos & +100 images)
                    </div>
                  )}
                </CardContent>

                <CardFooter>
                  <Button asChild className="w-full" variant={plan.highlight ? "default" : "secondary"}>
                    <Link href={`/register?plan=${planIdForCta}`}>
                      {billingLabel} · Start for ${price}/{ctaSuffix}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}

          <Card className="flex flex-col justify-between border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Building2 className="h-4 w-4" /> Enterprise
              </CardTitle>
              <CardDescription>Security, SLA and bespoke integrations.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Custom BMK quotas, SSO/SCIM, dedicated support and private deployments.
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" variant="secondary">
                <Link href={ENTERPRISE_CONTACT_URL}>Contact Sales</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

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
      </section>
    </div>
  );
}
