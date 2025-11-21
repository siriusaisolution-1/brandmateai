'use client';

import type { ElementType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Calendar,
  CreditCard,
  Home,
  Images,
  ListChecks,
  Megaphone,
  MessageSquare,
  PlusCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = {
  key: string;
  label: string;
  icon: ElementType;
  getHref: (brandId?: string | null) => string;
  requiresBrand?: boolean;
  badge?: string;
};

const navItems: NavItem[] = [
  {
    key: "home",
    label: "Home / Overview",
    icon: Home,
    getHref: (brandId) => (brandId ? `/brands/${brandId}/home` : "/dashboard"),
  },
  {
    key: "chat",
    label: "Chat",
    icon: MessageSquare,
    requiresBrand: true,
    getHref: (brandId) => (brandId ? `/brands/${brandId}/chat` : "/dashboard"),
  },
  {
    key: "library",
    label: "Library",
    icon: Images,
    requiresBrand: true,
    getHref: (brandId) =>
      brandId ? `/brands/${brandId}/library` : "/media-library",
  },
  {
    key: "requests",
    label: "Requests",
    icon: ListChecks,
    requiresBrand: true,
    getHref: (brandId) =>
      brandId ? `/brands/${brandId}/requests` : "/dashboard",
  },
  {
    key: "calendar",
    label: "Calendar",
    icon: Calendar,
    requiresBrand: true,
    getHref: (brandId) =>
      brandId ? `/brands/${brandId}/calendar` : "/calendar",
  },
  {
    key: "analytics",
    label: "Analytics",
    icon: BarChart3,
    requiresBrand: true,
    badge: "beta",
    getHref: (brandId) => (brandId ? `/reports/${brandId}` : "/reports"),
  },
  {
    key: "billing",
    label: "Billing",
    icon: CreditCard,
    getHref: () => "/billing",
  },
];

function NavLink({
  item,
  activeBrandId,
}: {
  item: NavItem;
  activeBrandId?: string | null;
}) {
  const pathname = usePathname();
  const href = item.getHref(activeBrandId);
  const isDisabled = item.requiresBrand && !activeBrandId;
  const isActive = !isDisabled && pathname.startsWith(href);

  const content = (
    <span
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all",
        isActive && "bg-muted text-primary",
        isDisabled ? "cursor-not-allowed opacity-50" : "hover:text-primary",
      )}
    >
      <item.icon className="h-4 w-4" />
      <span className="flex items-center gap-1">
        {item.label}
        {item.badge && (
          <span className="text-[10px] uppercase text-muted-foreground">
            ({item.badge})
          </span>
        )}
      </span>
    </span>
  );

  if (isDisabled) {
    return (
      <span key={item.key} aria-disabled className="block">
        {content}
      </span>
    );
  }

  return (
    <Link key={item.key} href={href}>
      {content}
    </Link>
  );
}

function resolveBrandId(pathname: string): string | null {
  const brandMatch = pathname.match(/\/brands\/([^/]+)/);
  if (brandMatch?.[1]) return brandMatch[1];

  const altMatch = pathname.match(/\/(media-library|calendar|reports)\/([^/]+)/);
  return altMatch?.[2] ?? null;
}

export function AppSidebar() {
  const pathname = usePathname();
  const activeBrandId = resolveBrandId(pathname);

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Megaphone className="h-6 w-6 text-primary" />
            <span>BrandMate AI</span>
          </Link>
        </div>

        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <div className="mb-4">
              <Button className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New
              </Button>
            </div>

            {navItems.map((item) => (
              <NavLink
                key={item.key}
                item={item}
                activeBrandId={activeBrandId}
              />
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

export default AppSidebar;