'use client';

import { TrendingUp, PiggyBank, ShieldCheck } from 'lucide-react';

export function ProofSection() {
  return (
    <section
      data-testid="proof-section"
      aria-labelledby="proof-heading"
      className="container py-10 md:py-14"
    >
      <div className="rounded-2xl bg-muted/20 border border-border/50 p-6 md:p-10 text-center">
        <h3 id="proof-heading" className="text-xl md:text-2xl font-semibold tracking-tight">
          Join <span className="text-primary font-bold">100+ creators and teams</span> scaling their marketing with AI
        </h3>
        <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
          Built for small teams that want big-brand results — without the agency overhead.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {/* Stat 1 */}
          <div className="group rounded-xl border border-border/50 bg-background/60 p-5 text-left">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-primary" aria-hidden="true" />
              <div>
                <div className="text-sm font-medium">2.5x faster content delivery</div>
                <div className="text-xs text-muted-foreground">Teams publish in hours, not days.</div>
              </div>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="group rounded-xl border border-border/50 bg-background/60 p-5 text-left">
            <div className="flex items-center gap-3">
              <PiggyBank className="h-5 w-5 text-primary" aria-hidden="true" />
              <div>
                <div className="text-sm font-medium">Up to 40% lower production costs</div>
                <div className="text-xs text-muted-foreground">Replace multiple tools with one AI-first workspace.</div>
              </div>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="group rounded-xl border border-border/50 bg-background/60 p-5 text-left">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
              <div>
                <div className="text-sm font-medium">100% brand consistency</div>
                <div className="text-xs text-muted-foreground">Every post follows your brand voice and visual rules.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Micro reassurance */}
        <p className="mt-6 text-xs text-muted-foreground">Start free and pay only when you need more BMK credits.</p>
      </div>
    </section>
  );
}
