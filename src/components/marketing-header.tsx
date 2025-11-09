'use client';

import { Button } from "@/components/ui/button";
import { Megaphone } from "lucide-react";
import Link from "next/link";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Megaphone className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">BrandMate AI</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/features"
              className="text-muted-foreground transition-colors hover:text-foreground/80"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-muted-foreground transition-colors hover:text-foreground/80"
            >
              Pricing
            </Link>
            {/* Add Blog link later */}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Log in for free</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
