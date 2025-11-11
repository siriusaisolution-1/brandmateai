// Pricing je jedini izvor istine u src/components/pricing/pricing-page.tsx.
// Ne uvoditi PLANS ili zasebne pricing komponente u ovoj ruti.
import type { ReactElement } from "react";
import PricingPage from "@/components/pricing/pricing-page";

export const metadata = {
  title: "Pricing — BrandMate AI",
  description:
    "Credits-based pricing for AI text, image, and video. Start free, pay only when you need more BMK.",
  alternates: { canonical: "/pricing" },
};

export default function MarketingPricingRoute(): ReactElement {
  return <PricingPage />;
}
