// src/components/beta-banner.tsx
import Link from "next/link";

export function BetaBanner() {
  return (
    <div className="flex flex-col gap-2 border-b border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100 md:flex-row md:items-center md:justify-between">
      <span className="font-medium">BrandMate v3 – Closed Beta.</span>
      <span className="text-amber-200/90">
        Expect occasional changes and please send feedback. Learn more in our
        <Link href="/faq" className="ml-1 underline hover:text-white">
          FAQ
        </Link>
        .
      </span>
    </div>
  );
}
