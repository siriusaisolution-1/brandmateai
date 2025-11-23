'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Search } from 'lucide-react';
import { useUser } from 'reactfire';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BrandSelector } from '@/components/brand-selector';

import { useToast } from '@/hooks/use-toast';
import { firestore } from '@/lib/firebase';
import { buildFeedbackPayload } from '@/lib/feedback';
import { reportClientError } from '@/lib/observability/sentry-client';

const betaMode =
  (process.env.NEXT_PUBLIC_BETA_MODE ?? '').toLowerCase() === 'true';

export function AppTopbar() {
  const router = useRouter();
  const { data: user } = useUser();
  const pathname = usePathname();
  const { toast } = useToast();

  // Feedback modal state (only used in beta, but safe to keep)
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const defaultContext = useMemo(
    () => (pathname ? `route:${pathname}` : 'app-shell'),
    [pathname],
  );
  const [context, setContext] = useState(defaultContext);
  const [message, setMessage] = useState('');
  const [brandId, setBrandId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!feedbackOpen) {
      setContext(defaultContext);
    }
  }, [defaultContext, feedbackOpen]);

  const greeting = user
    ? `Hi, ${user.displayName ?? user.uid}`
    : 'Not signed in';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Please sign in',
        description: 'Feedback can only be sent by authenticated beta users.',
      });
      return;
    }

    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      toast({
        variant: 'destructive',
        title: 'Message required',
        description: 'Let us know what is working, confusing or broken.',
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = buildFeedbackPayload({
        userId: user.uid,
        brandId: brandId.trim() || null,
        context: context.trim() || defaultContext,
        message: trimmedMessage,
      });

      await addDoc(collection(firestore, 'betaFeedback'), {
        ...payload,
        createdAt: serverTimestamp(),
      });

      toast({
        title: 'Feedback sent',
        description: 'Thank you! Your note helps us improve the closed beta.',
      });

      setMessage('');
      setBrandId('');
      setFeedbackOpen(false);
    } catch (error) {
      reportClientError(error, {
        screen: 'app-topbar',
        action: 'submit-beta-feedback',
      });
      toast({
        variant: 'destructive',
        title: 'Unable to send feedback',
        description: 'Please try again in a moment.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
        <div className="flex w-full flex-1 flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
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
                onFocus={(e) => e.target.blur()}
              />
            </div>
          </form>

          <div className="w-full max-w-xs">
            <BrandSelector
              onBrandSelected={(selectedBrandId) =>
                router.push(`/brands/${selectedBrandId}/home`)
              }
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {betaMode && (
            <>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                Beta
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFeedbackOpen(true)}
                disabled={!user}
              >
                Send feedback
              </Button>
            </>
          )}

          <span className="text-sm">{greeting}</span>
        </div>
      </header>

      {betaMode && (
        <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send feedback</DialogTitle>
              <DialogDescription>
                Tell us what is working, confusing or broken. Your note goes
                straight to the founding team.
              </DialogDescription>
            </DialogHeader>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="beta-feedback-message">Message</Label>
                <Textarea
                  id="beta-feedback-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Share specific observations, steps to reproduce a bug, or wish-list items."
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="beta-feedback-context">Context</Label>
                <Input
                  id="beta-feedback-context"
                  value={context}
                  onChange={(event) => setContext(event.target.value)}
                  placeholder="Where were you in the app? e.g. route:/dashboard"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="beta-feedback-brand">Brand ID (optional)</Label>
                <Input
                  id="beta-feedback-brand"
                  value={brandId}
                  onChange={(event) => setBrandId(event.target.value)}
                  placeholder="Paste a brand ID if the issue is brand-specific"
                />
              </div>

              <DialogFooter>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Sending…' : 'Submit feedback'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

export default AppTopbar;