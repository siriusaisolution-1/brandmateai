import type { Metadata } from "next";
import Link from "next/link";

import { MarketingFooter } from "@/components/marketing-footer";
import { MarketingHeader } from "@/components/marketing-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Legal — BrandMate AI",
  description: "Legal overview for BrandMate AI closed beta.",
  alternates: { canonical: "/legal" },
};

export default function LegalIndexPage() {
  return (
    <>
      <MarketingHeader current="legal" />
      <main className="pb-16">
        <section className="container py-16 md:py-24">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Legal Center</h1>
          <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
            Ovo je pregled pravnih dokumenata za closed beta. Detaljni uslovi i politika
            privatnosti će biti ažurirani pre šireg lansiranja. Za sva pitanja pišite na
            legal@brandmate.ai.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Terms of Service</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Pregled osnovnih pravila korišćenja i ograničenja tokom zatvorene bete.
              </p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/legal/terms">View terms</Link>
              </Button>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Privacy Policy</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Kako rukujemo podacima, fajlovima i telemetrijom dok razvijamo BrandMate
                v3.
              </p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/legal/privacy">View privacy</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
