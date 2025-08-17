'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Facebook, Linkedin, Bot } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useAuth, useFirestore, useFirestoreDocData } from 'reactfire';
import { FacebookAuthProvider, linkWithPopup, User } from 'firebase/auth';
import { doc } from 'firebase/firestore';

type ConnectionStatus = 'disconnected' | 'connected' | 'loading';

export default function SettingsPage() {
    const { toast } = useToast();
    const auth = useAuth();
    const user = auth.currentUser;

    // Check for existing integration data in Firestore
    const firestore = useFirestore();
    const integrationRef = user ? doc(firestore, 'users', user.uid, 'integrations', 'facebook.com') : null;
    const { status: docStatus, data: integrationData } = useFirestoreDocData(integrationRef);

    const [facebookStatus, setFacebookStatus] = useState<ConnectionStatus>('loading');

    useEffect(() => {
        if (docStatus === 'success') {
            setFacebookStatus(integrationData ? 'connected' : 'disconnected');
        } else if (docStatus === 'loading') {
            setFacebookStatus('loading');
        }
    }, [docStatus, integrationData]);


    const handleConnectFacebook = async () => {
        if (!user) {
            toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to connect an account." });
            return;
        }
        setFacebookStatus('loading');

        try {
            const provider = new FacebookAuthProvider();
            // Request permissions needed to post on behalf of the user
            provider.addScope('public_profile,email,pages_show_list,pages_read_engagement,pages_manage_posts');
            
            await linkWithPopup(user, provider);
            // The `beforeSignIn` cloud function will handle the token storage securely.
            setFacebookStatus('connected');
            toast({ title: "Facebook account connected successfully!" });

        } catch (error: any) {
            console.error('Facebook connection failed:', error);
            setFacebookStatus('disconnected');
            if (error.code === 'auth/popup-closed-by-user') {
                 toast({ variant: "default", title: "Connection cancelled", description: "You closed the connection window." });
            } else if (error.code === 'auth/credential-already-in-use') {
                 toast({ variant: "destructive", title: "Account Already Linked", description: "This Facebook account is already linked to another user." });
            }
            else {
                toast({ variant: "destructive", title: "Connection failed", description: "An unknown error occurred. Please try again." });
            }
        }
    };


    return (
        <div className="p-4 md:p-8">
            <h1 className="text-2xl font-bold text-copy-primary mb-4">Settings</h1>
            <Card className="max-w-2xl bg-surface border-gray-700">
                <CardHeader>
                    <CardTitle>Social Media Integrations</CardTitle>
                    <CardDescription>Connect your accounts to enable automatic posting directly from your Content Calendar.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Facebook Integration */}
                    <div className="flex items-center justify-between p-4 border border-gray-600 rounded-lg">
                        <div className="flex items-center gap-4">
                            <Facebook className="w-8 h-8 text-[#1877F2]" />
                            <div>
                                <h3 className="font-bold">Facebook & Instagram</h3>
                                <p className="text-sm text-copy-secondary">Connect your Meta account.</p>
                            </div>
                        </div>
                        <Button 
                            onClick={handleConnectFacebook} 
                            disabled={facebookStatus !== 'disconnected'}
                            className={facebookStatus === 'connected' ? 'bg-success hover:bg-success/90' : ''}
                        >
                            {facebookStatus === 'disconnected' && 'Connect'}
                            {facebookStatus === 'loading' && 'Loading...'}
                            {facebookStatus === 'connected' && 'Connected'}
                        </Button>
                    </div>

                     {/* LinkedIn Integration */}
                    <div className="flex items-center justify-between p-4 border border-gray-600 rounded-lg">
                         <div className="flex items-center gap-4">
                            <Linkedin className="w-8 h-8 text-[#0A66C2]" />
                            <div>
                                <h3 className="font-bold">LinkedIn</h3>
                                <p className="text-sm text-copy-secondary">Connect your LinkedIn profile or company page.</p>
                            </div>
                        </div>
                        <Button disabled>Connect (Coming Soon)</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
