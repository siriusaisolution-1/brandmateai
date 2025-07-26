import { Megaphone } from "lucide-react";
import Link from "next/link";

export function MarketingFooter() {
    return (
        <footer className="border-t border-border/40 py-8">
            <div className="container grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                    <h3 className="font-bold mb-2">Product</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><Link href="#features">Features</Link></li>
                        <li><Link href="#pricing">Pricing</Link></li>
                        <li><a href="#">Book a Demo</a></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-bold mb-2">Integrations</h3>
                     <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>Meta (FB & IG)</li>
                        <li>LinkedIn</li>
                        <li>TikTok</li>
                        <li>SendGrid</li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-bold mb-2">Company</h3>
                     <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><a href="#">About Us</a></li>
                        <li><a href="#">Blog</a></li>
                        <li><a href="#">Contact</a></li>
                    </ul>
                </div>
                 <div>
                    <h3 className="font-bold mb-2">Legal</h3>
                     <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><a href="#">Terms of Service</a></li>
                        <li><a href="#">Privacy Policy</a></li>
                    </ul>
                </div>
            </div>
            <div className="container mt-8 text-center text-sm text-muted-foreground">
                <p>© {new Date().getFullYear()} BrandMate AI. All rights reserved.</p>
            </div>
        </footer>
    );
}
