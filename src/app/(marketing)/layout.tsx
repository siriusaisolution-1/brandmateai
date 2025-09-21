// Layout for marketing pages (homepage, pricing, etc.)
// This layout does not include the app sidebar or topbar.

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* We can add a dedicated marketing header and footer here later */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
