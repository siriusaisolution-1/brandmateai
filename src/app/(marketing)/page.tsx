import { Button } from "@/components/ui/button";
import { MarketingHeader } from "@/components/marketing-header";
import { MarketingFooter } from "@/components/marketing-footer";
import { SocialProofBar } from "@/components/social-proof-bar"; // <-- Import
import { CheckCircle2, Bot, Calendar, BarChart } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function HomePage() {
  return (
    <>
      <MarketingHeader />
      
      <main>
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center text-center px-4">
          {/* ... (Hero section unchanged) ... */}
        </section>

        <SocialProofBar />

        {/* Feature Showcase Section */}
        <section id="features" className="container py-16 md:py-24 space-y-16">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold">An Entire Marketing Team in One Platform</h2>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">Stop switching between tabs. BrandMate AI brings strategy, content creation, and analytics into a single, intelligent workflow.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-muted/20 border-none">
                <CardHeader>
                    <Bot className="w-8 h-8 text-primary mb-2" />
                    <CardTitle>AI Content Engine</CardTitle>
                    <CardDescription>Generate SEO-optimized blogs, stunning visuals, and engaging social posts in seconds.</CardDescription>
                </CardHeader>
            </Card>
             <Card className="bg-muted/20 border-none">
                <CardHeader>
                    <Calendar className="w-8 h-8 text-primary mb-2" />
                    <CardTitle>Intelligent Automation</CardTitle>
                    <CardDescription>Plan your content with a drag-and-drop calendar and let the AI auto-post for you.</CardDescription>
                </CardHeader>
            </Card>
             <Card className="bg-muted/20 border-none">
                <CardHeader>
                    <BarChart className="w-8 h-8 text-primary mb-2" />
                    <CardTitle>Strategic Insights</CardTitle>
                    <CardDescription>Monitor competitors, track trends, and get AI-powered insights to improve your performance.</CardDescription>
                </CardHeader>
            </Card>
          </div>
        </section>

        {/* Final CTA and Footer */}
        {/* ... (unchanged) ... */}
      </main>
      
      <MarketingFooter />
    </>
  );
}
