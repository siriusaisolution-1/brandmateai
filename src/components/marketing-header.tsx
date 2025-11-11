"use client";

import { Button } from "@/components/ui/button";
import { Megaphone } from "lucide-react";
import Link from "next/link";

type MarketingHeaderCurrent = "features" | "pricing";

interface MarketingHeaderProps {
  current?: MarketingHeaderCurrent;
}

export function MarketingHeader({ current }: MarketingHeaderProps = {}) {
  const linkBaseClasses =
    "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground";

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      data-testid={current === "pricing" ? "pricing-header" : undefined}
    >
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Megaphone className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">BrandMate AI</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/features"
              className={linkBaseClasses}
              aria-current={current === "features" ? "page" : undefined}
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className={linkBaseClasses}
              aria-current={current === "pricing" ? "page" : undefined}
            >
              Pricing
            </Link>
            {/* Add Blog link later */}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Start Free Trial</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
