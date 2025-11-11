import type { Metadata } from "next";

import Link from "next/link";

import { MarketingHeader } from "@/components/marketing-header";
import { MarketingFooter } from "@/components/marketing-footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Features — BrandMate AI",
  description:
    "Planiraj kampanje, generiši sadržaj i upravljaj assetima uz BrandMate AI. AI Content Studio, Planner & Scheduler, Media Library, Brand Kit i integracije — počni besplatno, plati tek kada zatreba više kredita.",
  alternates: { canonical: "/features" },
  openGraph: {
    title: "BrandMate AI — Features",
    description:
      "AI platforma za planiranje, kreiranje i skaliranje marketinga: Content Studio, Planner, Media Library, Brand Kit, integracije.",
    url: "/features",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BrandMate AI — Features",
    description:
      "Kreiraj sadržaj, planiraj objave i čuvaj assete — sve na jednom mestu. Start free.",
  },
};

export default function FeaturesPage() {
  return (
    <>
      <MarketingHeader current="features" />
      <main className="pb-24">
        <section
          className="container py-16 text-center md:py-24"
          data-testid="features-hero"
        >
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            The AI marketing workspace built to plan, create and scale
          </h1>
          <p className="mt-4 mx-auto max-w-2xl text-muted-foreground">
            Planiraj kampanje, generiši copy, vizuale i video, zakazuj objave i čuvaj sve assete —
            BrandMate AI spaja strategiju, produkciju i operativu u jednu platformu.
            Počni besplatno, plati samo kada ti zatreba više kredita.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/login">Log in for free</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/pricing">See pricing &amp; credits</Link>
            </Button>
          </div>
        </section>

        <section className="container py-12" data-testid="features-content-studio">
          <h2 className="text-2xl font-semibold md:text-3xl">AI Content Studio</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Kreiraj SEO-blog postove, oglase, captione i newslettere, ali i vizuale i kratke video klipove —
            za nekoliko minuta. BrandKit čuva ton i stil brenda, pa je svaka isporuka dosledna.
          </p>
          <ul className="mt-6 grid gap-3 text-sm text-muted-foreground md:grid-cols-2 lg:grid-cols-3">
            <li>SEO-spremni draftovi za blog i web</li>
            <li>Copy za oglase, social i email</li>
            <li>Auto-varijacije i A/B predlozi</li>
            <li>Generisanje slika i kratkih videa</li>
            <li>Jedan klik za lokalizaciju tržišta</li>
            <li>Čuvanje šablona i prompta</li>
          </ul>
        </section>

        <section className="container py-12" data-testid="features-planner">
          <h2 className="text-2xl font-semibold md:text-3xl">Planner &amp; Scheduler</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Drag-and-drop kalendar za planiranje kampanja i objava. Generiši sadržaj,
            prilagodi kanalu i zakaži u optimalnim terminima — sve na jednom mestu.
          </p>
          <ul className="mt-6 grid gap-3 text-sm text-muted-foreground md:grid-cols-2 lg:grid-cols-3">
            <li>Pametni kalendar sa pregledom po kanalima</li>
            <li>Auto-draft i varijacije za svaki kanal</li>
            <li>Jednostavno zakazivanje i re-schedule</li>
          </ul>
        </section>

        <section className="container py-12" data-testid="features-media-library">
          <h2 className="text-2xl font-semibold md:text-3xl">Media Library</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Svi asseti na jednom mestu: verzije, komentari i brzi presetovi za svaku mrežu.
            Pronađi, remiksuj i ponovo iskoristi najbolje isporuke u sekundama.
          </p>
          <ul className="mt-6 grid gap-3 text-sm text-muted-foreground md:grid-cols-2 lg:grid-cols-3">
            <li>Verzionisanje datoteka i istorija izmena</li>
            <li>Presetovi za dimenzije (IG, FB, LI, X…)</li>
            <li>Organizacija po brendu/kampanji</li>
          </ul>
        </section>

        <section className="container py-12" data-testid="features-brand-kit">
          <h2 className="text-2xl font-semibold md:text-3xl">Brand Kit</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Nauči AI tvoj brend jednom — i dobijaš konzistentan ton glasa, vizuelni stil i smernice
            koje se primenjuju na sav generisani sadržaj.
          </p>
          <ul className="mt-6 grid gap-3 text-sm text-muted-foreground md:grid-cols-2 lg:grid-cols-3">
            <li>Logo, paleta boja, tipografija i voice guide</li>
            <li>Guardrails koji sprečavaju “off-brand” isporuke</li>
            <li>LoRA fine-tuning za prepoznatljiv vizuelni stil</li>
          </ul>
        </section>

        <section className="container py-12" data-testid="features-integrations">
          <h2 className="text-2xl font-semibold md:text-3xl">Integrations</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Poveži alate koje već koristiš i ubrzaj isporuku.
          </p>
          <ul className="mt-6 grid gap-3 text-sm text-muted-foreground md:grid-cols-2 lg:grid-cols-3">
            <li>SendGrid (email slanje/newsletter)</li>
            <li>LinkedIn (objave)</li>
            <li className="opacity-80">
              Meta, TikTok, GA4 — <span className="italic">coming soon</span>
            </li>
          </ul>
        </section>

        <section className="container py-12" data-testid="features-collaboration">
          <h2 className="text-2xl font-semibold md:text-3xl">Collaboration</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Deljeni radni prostori, komentarisanje i osnove approval toka.
            Sve što je timu potrebno da brže dođe do “publish”.
          </p>
          <ul className="mt-6 grid gap-3 text-sm text-muted-foreground md:grid-cols-2 lg:grid-cols-3">
            <li>Team workspaces &amp; osnovni approvals</li>
            <li>Role-based pristup brendovima</li>
            <li>Centralizovana istorija isporuka</li>
          </ul>
        </section>

        <section
          className="container py-16 text-center md:py-24"
          data-testid="features-cta"
        >
          <h2 className="text-3xl font-bold">Launch in minutes. Pay only when you outgrow free credits.</h2>
          <p className="mt-3 mx-auto max-w-2xl text-muted-foreground">
            Napravi nalog, isprobaj sve alate i nadogradi plan tek kada ti zatreba više BMK kredita.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/login">Log in for free</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/pricing">See pricing &amp; credits</Link>
            </Button>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
