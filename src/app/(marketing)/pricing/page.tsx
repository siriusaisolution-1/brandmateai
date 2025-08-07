// src/app/(marketing)/pricing/page.tsx
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { MarketingHeader } from "@/components/marketing-header";
import { MarketingFooter } from "@/components/marketing-footer";

export const dynamic = 'force-dynamic'; // Dev-only to bypass caching
export const revalidate = 0;

// Data should come from a central config file
const plans = [
  { id: 'solo', name: 'Solo', priceUsd: 99, bmk: 1000, description: 'For individuals and small projects.', features: ["Approx. 15-20 Videos", "Approx. 100+ Photos & Edits", "~25 Blog Posts", "Full access to all AI tools"], cta: 'Get Started with Solo' },
  { id: 'pro', name: 'Pro', priceUsd: 297, bmk: 3000, description: 'For growing teams and businesses.', features: ["Approx. 45-60 Videos", "Approx. 300+ Photos & Edits", "~75 Blog Posts", "Includes 2 LoRA Model Trainings"], cta: 'Choose Pro Plan' },
  { id: 'agency', name: 'Agency', priceUsd: 889, bmk: 9000, description: 'For agencies and large teams.', features: ["Approx. 150-200 Videos", "Approx. 900+ Photos & Edits", "Unlimited Text Content", "Includes 10 LoRA Model Trainings"], cta: 'Go Agency' },
];

export default function PricingPage() {
  return (
    <>
      <MarketingHeader />
      <main className="container mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 id="pricing-v2-marker" className="text-4xl font-bold tracking-tight">Pricing · BrandMate 2.0 (V2 - LATEST)</h1>
          <p className="mt-4 text-lg text-muted-foreground">This is the correct, updated pricing page.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => (
            <Card key={plan.id} className={`flex flex-col ${plan.id === 'pro' ? 'border-primary ring-2 ring-primary' : ''}`}>
              <CardHeader><CardTitle className="text-2xl">{plan.name}</CardTitle><CardDescription>{plan.description}</CardDescription></CardHeader>
              <CardContent className="flex-grow space-y-6">
                <div className="text-4xl font-bold">${plan.priceUsd}<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                <div><p className="font-semibold">{plan.bmk.toLocaleString()} BMK Credits</p></div>
                <ul className="space-y-3">{plan.features.map((feature, index) => (<li key={index} className="flex items-start"><Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" /> <span className="text-sm text-muted-foreground">{feature}</span></li>))}</ul>
              </CardContent>
              <CardFooter><Button className="w-full">{plan.cta}</Button></CardFooter>
            </Card>
          ))}
        </div>
      </main>
      <MarketingFooter />
    </>
  );
}
