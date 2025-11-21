import type { Metadata } from "next";
import Link from "next/link";

import { MarketingFooter } from "@/components/marketing-footer";
import { MarketingHeader } from "@/components/marketing-header";

export const metadata: Metadata = {
  title: "Terms of Service — BrandMate AI",
  description: "Preview of BrandMate AI terms during the closed beta period.",
  alternates: { canonical: "/legal/terms" },
};

export default function TermsPage() {
  return (
    <>
      <MarketingHeader current="legal" />
      <main className="pb-16">
        <section className="container py-16 md:py-24">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/80">Legal</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Terms of Service</h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            Ovaj dokument je pregled uslova korišćenja za closed beta verziju. Finalni
            uslovi biće dostupni pre javnog lansiranja. Do tada važi pravilo zdrave
            prakse: poštujte privatnost drugih, ne delite neovlašćene podatke i koristite
            BrandMate AI u skladu sa lokalnim zakonima.
          </p>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              • BrandMate AI je trenutno u beta fazi i može sadržati bugove. Prijavite ih
              timu preko podrške u aplikaciji.
            </p>
            <p>
              • Sadržaj koji generišete pripada vama; odgovorni ste za proveru pravne i
              etičke ispravnosti pre objave.
            </p>
            <p>
              • Tokom bete, zadržavamo pravo da prilagodimo limite korišćenja i dostupne
              funkcije radi stabilnosti platforme.
            </p>
          </div>
          <div className="mt-8 text-sm text-muted-foreground">
            Za sva pitanja pišite na <Link href="mailto:legal@brandmate.ai">legal@brandmate.ai</Link>.
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
