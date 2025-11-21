import type { Metadata } from "next";
import Link from "next/link";

import { MarketingFooter } from "@/components/marketing-footer";
import { MarketingHeader } from "@/components/marketing-header";

export const metadata: Metadata = {
  title: "Privacy Policy — BrandMate AI",
  description: "How BrandMate AI handles data during the closed beta.",
  alternates: { canonical: "/legal/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <MarketingHeader current="legal" />
      <main className="pb-16">
        <section className="container py-16 md:py-24">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/80">Legal</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Privacy Policy</h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            Ovo je skraćena verzija pravila privatnosti dok završavamo punu dokumentaciju
            za produkciju. BrandMate AI koristi Firebase za autentikaciju, skladištenje
            fajlova i audit logove; podaci se ne dele sa trećim stranama bez vašeg
            odobrenja.
          </p>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              • Koristimo podatke o brendu (boje, ton, ciljne publike) samo za
              personalizaciju generisanog sadržaja.
            </p>
            <p>
              • Uploadovani fajlovi ostaju u vašem Storage bucket-u uz kontrolu pristupa po
              korisniku i brendu.
            </p>
            <p>
              • Sentry se koristi za dijagnostiku grešaka; PII i mediji se ne šalju u
              logove, prikupljamo samo tehničke metapodatke.
            </p>
          </div>
          <div className="mt-8 text-sm text-muted-foreground">
            Za detaljna pitanja pišite na <Link href="mailto:privacy@brandmate.ai">privacy@brandmate.ai</Link>.
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
