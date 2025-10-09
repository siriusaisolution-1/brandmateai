import "@/app/globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";

export const metadata = {
  title: "BrandMate AI",
  description: "Your AI Marketing Co-pilot",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased")} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
