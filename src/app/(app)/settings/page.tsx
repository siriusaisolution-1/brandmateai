// src/app/(app)/settings/page.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Facebook, Linkedin } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, useFirestoreDocData } from 'reactfire';
import { FacebookAuthProvider, linkWithPopup } from 'firebase/auth';
import { doc } from 'firebase/firestore';

type ConnectionStatus = 'disconnected' | 'connected' | 'loading';

export default function SettingsPage() {
  const { toast } = useToast();
  const auth = useAuth();
  const user = auth.currentUser;

  const firestore = useFirestore();

  // ✅ Hook se POZIVA UVEK (bez uslovnog grananja)
  // Ako nema user-a, koristimo placeholder UID (nepostojeći dokument => data undefined).
  const uid = user?.uid ?? '__no_user__';
  const integrationRef = useMemo(
    () => doc(firestore, 'users', uid, 'integrations', 'facebook.com'),
    [firestore, uid]
  );
  const { status: docStatus, data: integrationData } = useFirestoreDocData(integrationRef);

  const [facebookStatus, setFacebookStatus] = useState<ConnectionStatus>('loading');

  useEffect(() => {
    if (!user) {
      setFacebookStatus('disconnected');
      return;
    }
    if (docStatus === 'loading') {
      setFacebookStatus('loading');
      return;
    }
    // Ako je dokument prisutan -> connected, u suprotnom disconnected
    setFacebookStatus(integrationData ? 'connected' : 'disconnected');
  }, [docStatus, integrationData, user]);

  const handleConnectFacebook = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to connect an account.',
      });
      return;
    }
    setFacebookStatus('loading');

    try {
      const provider = new FacebookAuthProvider();
      provider.addScope(
        'public_profile,email,pages_show_list,pages_read_engagement,pages_manage_posts'
      );

      await linkWithPopup(user, provider);
      // beforeSignIn cloud funkcija će sačuvati tokene
      setFacebookStatus('connected');
      toast({ title: 'Facebook account connected successfully!' });
    } catch (error: unknown) {
      // tip-safe log
      // eslint-disable-next-line no-console
      console.error('Facebook connection failed:', error);
      setFacebookStatus('disconnected');

      const code = (error as { code?: string })?.code;
      if (code === 'auth/popup-closed-by-user') {
        toast({
          variant: 'default',
          title: 'Connection cancelled',
          description: 'You closed the connection window.',
        });
      } else if (code === 'auth/credential-already-in-use') {
        toast({
          variant: 'destructive',
          title: 'Account Already Linked',
          description: 'This Facebook account is already linked to another user.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Connection failed',
          description: 'An unknown error occurred. Please try again.',
        });
      }
    }
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="mb-4 text-2xl font-bold text-copy-primary">Settings</h1>

      <Card className="max-w-2xl border-gray-700 bg-surface">
        <CardHeader>
          <CardTitle>Social Media Integrations</CardTitle>
          <CardDescription>
            Connect your accounts to enable automatic posting directly from your Content Calendar.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Facebook Integration */}
          <div className="flex items-center justify-between rounded-lg border border-gray-600 p-4">
            <div className="flex items-center gap-4">
              <Facebook className="h-8 w-8 text-[#1877F2]" />
              <div>
                <h3 className="font-bold">Facebook & Instagram</h3>
                <p className="text-sm text-copy-secondary">Connect your Meta account.</p>
              </div>
            </div>

            <Button
              onClick={handleConnectFacebook}
              disabled={!user || facebookStatus !== 'disconnected'}
              className={facebookStatus === 'connected' ? 'bg-success hover:bg-success/90' : ''}
            >
              {facebookStatus === 'disconnected' && 'Connect'}
              {facebookStatus === 'loading' && 'Loading...'}
              {facebookStatus === 'connected' && 'Connected'}
            </Button>
          </div>

          {/* LinkedIn Integration */}
          <div className="flex items-center justify-between rounded-lg border border-gray-600 p-4">
            <div className="flex items-center gap-4">
              <Linkedin className="h-8 w-8 text-[#0A66C2]" />
              <div>
                <h3 className="font-bold">LinkedIn</h3>
                <p className="text-sm text-copy-secondary">
                  Connect your LinkedIn profile or company page.
                </p>
              </div>
            </div>
            <Button disabled>Connect (Coming Soon)</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}