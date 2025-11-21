import type { Metadata } from "next";
import Link from "next/link";

import { MarketingFooter } from "@/components/marketing-footer";
import { MarketingHeader } from "@/components/marketing-header";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    question: "Da li AI koristi moje fotke za treniranje?",
    answer:
      "Ne. Vaši fajlovi ostaju u vašem Firebase projektu i koriste se isključivo za generisanje sadržaja unutar vašeg naloga.",
  },
  {
    question: "Mogu li da otkažem kada hoću?",
    answer: "Da. Tokom zatvorene bete možete pauzirati ili otkazati u bilo kom trenutku iz Billing sekcije.",
  },
  {
    question: "Treba li mi tehničko znanje?",
    answer:
      "Ne. Master AI vodi vas kroz brief, predlaže strukturu kampanje i pomaže da odobrite vizuale, video i copy iz jedne konsole.",
  },
  {
    question: "Koliko sadržaja mesečno mogu da dobijem?",
    answer:
      "Planovi imaju jasne limite za video, slike i zahteve. Beta ograničava jedan video po zahtev i razuman broj slika kako bismo zaštitili troškove.",
  },
  {
    question: "Šta ako nemam brand kit spreman?",
    answer:
      "Imamo kratki onboarding da unesete osnovne boje, ton komunikacije i ciljne publike. Možete ga dopunjavati vremenom dok AI uči vaš stil.",
  },
  {
    question: "Da li mogu da radim sa više brendova?",
    answer:
      "Da. Možete kreirati više brendova, pratiti usage po brendu i koristiti zajedničku biblioteku šablona i kampanja.",
  },
  {
    question: "Kako se meri usage i potrošnja kredita?",
    answer:
      "Billing stranica prikazuje potrošene video/slika slotove i broj content requestova po mesecu, zajedno sa planom na kome se nalazite.",
  },
  {
    question: "Koliko je siguran sadržaj koji uploadujem?",
    answer:
      "Fajlovi ostaju u Firebase Storage-u uz pravila pristupa po korisniku. Takođe imamo Sentry za praćenje grešaka i ne čuvamo API ključeve klijenata u frontendu.",
  },
];

export const metadata: Metadata = {
  title: "FAQ — BrandMate AI",
  description: "Česta pitanja o BrandMate AI sadržajnom studiju i zatvorenoj beti.",
  alternates: { canonical: "/faq" },
};

export default function FAQPage() {
  return (
    <>
      <MarketingHeader current="faq" />
      <main className="pb-24">
        <section className="container py-16 md:py-24 text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Česta pitanja</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Sve što treba da znate o BrandMate AI tokom closed beta faze.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/register">Start free trial</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/pricing">Pogledaj planove</Link>
            </Button>
          </div>
        </section>

        <section className="container grid gap-6 md:grid-cols-2" aria-label="FAQ list">
          {faqs.map((item) => (
            <div key={item.question} className="rounded-xl border bg-card p-6 text-left shadow-sm">
              <h2 className="text-lg font-semibold">{item.question}</h2>
              <p className="mt-2 text-muted-foreground">{item.answer}</p>
            </div>
          ))}
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
