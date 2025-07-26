'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BrandSelector } from '@/components/brand-selector';
import { run, GenkitError } from '@genkit-ai/flow';
import { generateBlogPostFlow } from '@/ai/flows/generate-blog-post';
import { useToast } from "@/components/ui/use-toast";
import { Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

type BlogPost = {
    title: string;
    metaDescription: string;
    slug: string;
    body: string;
};

export default function GenerateBlogPage() {
    const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
    const [topic, setTopic] = useState('');
    const [keywords, setKeywords] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const handleGenerate = async () => {
        if (!selectedBrandId || !topic) {
            setError('Please select a brand and enter a topic.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setBlogPost(null);

        try {
            const keywordArray = keywords.split(',').map(k => k.trim()).filter(Boolean);
            const response = await run(generateBlogPostFlow, {
                brandId: selectedBrandId,
                topic,
                keywords: keywordArray,
            });
            setBlogPost(response);
        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof GenkitError ? e.message : 'An unexpected error occurred.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: `${field} copied to clipboard!` });
    };

    return (
        <div className="p-4 md:p-8 space-y-8">
            <Card className="max-w-3xl mx-auto bg-surface border-gray-700">
                <CardHeader>
                    <CardTitle>AI SEO Blog Post Generator</CardTitle>
                    <CardDescription>Generate a complete, SEO-optimized blog article in your brand's voice.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>1. Select Your Brand</Label>
                        <BrandSelector onBrandSelected={(id) => setSelectedBrandId(id)} disabled={isLoading} />
                    </div>
                    <div className="space-y-2">
                        <Label>2. What is the blog post about?</Label>
                        <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., The future of AI in marketing, 5 tips for better social media engagement..." disabled={isLoading} />
                    </div>
                    <div className="space-y-2">
                        <Label>3. Primary Keywords (comma-separated)</Label>
                        <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="e.g., AI marketing, content creation, SEO strategy" disabled={isLoading} />
                    </div>
                    {error && <p className="text-sm text-error">{error}</p>}
                    <Button onClick={handleGenerate} disabled={isLoading || !selectedBrandId || !topic} className="w-full bg-primary hover:bg-primary/90">
                        {isLoading ? 'Writing Your Article...' : 'Generate Blog Post'}
                    </Button>
                </CardContent>
            </Card>
            
            {isLoading && <div className="max-w-3xl mx-auto h-96 bg-gray-700 rounded-lg animate-pulse" />}

            {blogPost && (
                <Card className="max-w-3xl mx-auto bg-surface border-gray-700">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            {blogPost.title}
                            <Button variant="ghost" size="icon" onClick={() => handleCopy(blogPost.title, 'Title')}><Copy className="w-4 h-4" /></Button>
                        </CardTitle>
                        <CardDescription className="flex justify-between items-start gap-2">
                           {blogPost.metaDescription}
                           <Button variant="ghost" size="icon" onClick={() => handleCopy(blogPost.metaDescription, 'Meta Description')} className="shrink-0"><Copy className="w-4 h-4" /></Button>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-invert prose-headings:text-primary max-w-none">
                            <ReactMarkdown>{blogPost.body}</ReactMarkdown>
                        </div>
                    </CardContent>
                     <CardFooter>
                        <Button variant="secondary" onClick={() => handleCopy(blogPost.body, 'Article Body')} className="w-full">
                            <Copy className="w-4 h-4 mr-2" /> Copy Full Article Text
                        </Button>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
}
