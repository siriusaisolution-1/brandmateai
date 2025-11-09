import PricingPage from "@/components/pricing/pricing-page";

export const metadata = {
  title: "Pricing – BrandMate AI",
  description:
    "Credits-based pricing for AI text, image, and video. Start free, pay only when you need more BMK.",
  alternates: { canonical: "/pricing" },
};

export default function MarketingPricingRoute() {
  return <PricingPage />;
}