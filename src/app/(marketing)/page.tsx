import { Button } from "@/components/ui/button";
import { MarketingHeader } from "@/components/marketing-header";
import { MarketingFooter } from "@/components/marketing-footer";
import { SocialProofBar } from "@/components/social-proof-bar";
import { Bot, Calendar, BarChart } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function HomePage() {
  return (
    <>
      <MarketingHeader />
      
      <main>
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center text-center px-4">
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10"></div>
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat [mask-image:linear-gradient(to_bottom,white_50%,transparent_100%)]"></div>
          
          <div className="z-20 relative space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
              Your AI Marketing <br /> Co-pilot
            </h1>
            <p className="max-w-xl mx-auto text-lg text-muted-foreground">
              BrandMate AI helps you create, schedule, and analyze your marketing
              campaigns with the power of generative AI.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/register">Get Started for Free</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#features">Explore Features</Link>
              </Button>
            </div>
             <div className="text-sm text-muted-foreground">
              14-day free trial. No credit card required.
            </div>
          </div>
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

        {/* Final CTA Section */}
        <section className="container text-center py-16 md:py-24">
           <h2 className="text-3xl md:text-4xl font-bold">Ready to Supercharge Your Marketing?</h2>
           <p className="mt-4 max-w-lg mx-auto text-muted-foreground">Start your free trial today and see how BrandMate AI can transform your workflow.</p>
            <div className="mt-8">
              <Button asChild size="lg">
                <Link href="/register">Sign Up Now</Link>
              </Button>
            </div>
        </section>
      </main>
      
      <MarketingFooter />
    </>
  );
}