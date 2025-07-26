'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BrandSelector } from '@/components/brand-selector';
import { MediaLibraryPicker } from '@/components/media-library-picker';
import { run, GenkitError } from '@genkit-ai/flow';
import { generateNewsletterFlow } from '@/ai/flows/generate-newsletter';
import { sendNewsletterFlow } from '@/ai/flows/manage-calendar'; // Import the new flow
import { Copy, Download, Smartphone, Send, AlertTriangle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

export default function GenerateNewsletterPage() {
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [topic, setTopic] = useState('');
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // State for the sending form
  const [subject, setSubject] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [recipients, setRecipients] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleGenerate = async () => {
    // ... (existing generation logic, unchanged)
    if (!selectedBrandId || !topic) {
      setError('Please select a brand and enter a topic.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setHtmlContent(null);

    try {
      const response = await run(generateNewsletterFlow, {
        brandId: selectedBrandId,
        topic,
        selectedAssetIds,
      });
      setHtmlContent(response.html);
      setSubject(topic); // Pre-fill subject with topic
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof GenkitError ? e.message : 'An unexpected error occurred.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
   const handleSend = async () => {
    if (!htmlContent || !selectedBrandId || !subject || !fromEmail || !recipients) {
        toast({ variant: "destructive", title: "Missing information", description: "Please fill in all fields to send the newsletter." });
        return;
    }
    setIsSending(true);
    try {
        await run(sendNewsletterFlow, {
            brandId: selectedBrandId,
            subject,
            htmlContent,
            recipients,
            fromEmail,
        });
        toast({ title: "Newsletter sent successfully!", description: "Your email has been queued for sending." });
    } catch (error) {
        console.error("Failed to send newsletter:", error);
        toast({ variant: "destructive", title: "Sending Failed", description: "Could not send the newsletter. Please check your SendGrid configuration and try again." });
    } finally {
        setIsSending(false);
    }
  };

  const handleCopy = () => { /* ... */ };
  const handleDownload = () => { /* ... */ };
  // ... (handleCopy and handleDownload are unchanged)

  return (
    <div className="p-4 md:p-8 grid md:grid-cols-2 gap-8 items-start">
      <div className="space-y-8">
        <Card className="bg-surface border-gray-700">
            <CardHeader>
                <CardTitle>AI Newsletter Generator</CardTitle>
                <CardDescription>Design and write a professional, on-brand newsletter in seconds.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            {/* ... form for generation is unchanged ... */}
            <div className="space-y-2">
                <Label>1. Select Your Brand</Label>
                <BrandSelector onBrandSelected={(id) => setSelectedBrandId(id)} disabled={isLoading || isSending} />
            </div>
            {selectedBrandId && (
                <>
                <div className="space-y-2">
                    <Label>2. What is the newsletter about?</Label>
                    <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., Our top 3 products this week..." disabled={isLoading || isSending} />
                </div>
                <div className="space-y-2">
                    <Label>3. Select images (optional)</Label>
                    <MediaLibraryPicker brandId={selectedBrandId} onSelectionChange={setSelectedAssetIds} />
                </div>
                </>
            )}
            {error && <p className="text-sm text-error flex items-center gap-2"><AlertTriangle size={16}/> {error}</p>}
            <Button onClick={handleGenerate} disabled={isLoading || isSending || !selectedBrandId || !topic} className="w-full bg-primary hover:bg-primary/90">
                {isLoading ? 'Designing...' : 'Generate Newsletter'}
            </Button>
            </CardContent>
        </Card>
        
        {htmlContent && (
            <Card className="bg-surface border-gray-700">
                <CardHeader>
                    <CardTitle>Send Newsletter</CardTitle>
                    <CardDescription>Enter the details below to send this newsletter to your audience.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Subject</Label>
                        <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Your email subject line" disabled={isSending} />
                    </div>
                    <div className="space-y-2">
                        <Label>From Email</Label>
                        <Input value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} placeholder="A verified email in SendGrid" disabled={isSending} />
                    </div>
                     <div className="space-y-2">
                        <Label>Recipients</Label>
                        <Textarea value={recipients} onChange={(e) => setRecipients(e.target.value)} placeholder="Paste a comma-separated list of emails" disabled={isSending} />
                    </div>
                    <Button onClick={handleSend} disabled={isSending || isLoading} className="w-full bg-success hover:bg-success/90">
                        <Send className="w-4 h-4 mr-2" />
                        {isSending ? 'Sending...' : 'Send Newsletter'}
                    </Button>
                </CardContent>
            </Card>
        )}
      </div>

      <div className="flex flex-col gap-4 sticky top-8">
         {/* ... (Preview section is unchanged) ... */}
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-copy-primary">Preview</h2>
            {htmlContent && (
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopy}><Copy className="w-4 h-4 mr-2" /> Copy HTML</Button>
                    <Button variant="outline" size="sm" onClick={handleDownload}><Download className="w-4 h-4 mr-2" /> Download</Button>
                </div>
            )}
        </div>
        <div className="bg-white rounded-lg p-2 shadow-lg w-full max-w-lg mx-auto">
            <div className="w-full h-[70vh] rounded">
                {isLoading && <div className="w-full h-full bg-gray-200 animate-pulse rounded-md" />}
                {htmlContent && <iframe srcDoc={htmlContent} className="w-full h-full border-0 rounded" />}
                {!isLoading && !htmlContent && (
                    <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center text-center text-gray-500">
                        <div>
                            <Smartphone className="w-10 h-10 mb-2 mx-auto" />
                            <p>Your newsletter preview will appear here.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
