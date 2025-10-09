'use client';

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Megaphone, Calendar, BarChart, PlusCircle, Building } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/brands', label: 'Brand Studio', icon: Building },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
    { href: '/analytics', label: 'Analytics', icon: BarChart },
];

const NavLink = ({ href, label, icon: Icon }: { href: string, label: string, icon: React.ElementType }) => {
    const pathname = usePathname();
    const isActive = pathname.startsWith(href);

    return (
        <Link href={href}>
            <span className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                isActive && "bg-muted text-primary"
            )}>
                <Icon className="h-4 w-4" />
                {label}
            </span>
        </Link>
    );
};


export function AppSidebar() {
    return (
        <div className="hidden border-r bg-muted/40 md:block">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <Megaphone className="h-6 w-6 text-primary" />
                        <span className="">BrandMate AI</span>
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
                        {navItems.map(item => <NavLink key={item.href} {...item} />)}
                    </nav>
                </div>
            </div>
        </div>
    );
}
