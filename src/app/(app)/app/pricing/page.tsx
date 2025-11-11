// Pricing je jedini izvor istine u src/components/pricing/pricing-page.tsx.
// Ne uvoditi PLANS ili zasebne pricing komponente u ovoj ruti.
import type { ReactElement } from "react";
import PricingPage from "@/components/pricing/pricing-page";

export default function AppPricingRoute(): ReactElement {
  return <PricingPage />;
}
