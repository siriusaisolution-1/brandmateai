'use client';

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useUser } from "reactfire";

export function AppTopbar() {
  const { data: user } = useUser(); // može biti undefined dok se učitava

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      <div className="w-full flex-1">
        <form>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="global-search"
              name="global-search"
              aria-label="Search brands or actions"
              type="search"
              placeholder="Search brands or actions... (⌘+K)"
              className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
              readOnly
              onFocus={(e) => e.target.blur()} // stvarno pretraživanje ide preko Command Palette
            />
          </div>
        </form>
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <span className="text-sm">Hi, {user.displayName ?? user.uid}</span>
        ) : (
          <span className="text-sm text-muted-foreground">Not signed in</span>
        )}
      </div>
    </header>
  );
}