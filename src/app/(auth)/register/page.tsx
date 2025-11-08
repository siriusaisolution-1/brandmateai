'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { auth, functions } from '@/lib/firebase'
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'
import { httpsCallable } from 'firebase/functions'
import { Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SocialAuthButtons } from '@/components/auth/social-auth-buttons'

// This now points to our refactored backend function
const completeRegistration = httpsCallable(functions, 'completeRegistration');

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Create the user in Firebase Auth.
      // This will trigger the `onUserCreated` function on the backend,
      // which creates the Firestore document and sets the initial 'free' plan claim.
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. Call our new callable function to finalize the registration
      // by providing the display name.
      await completeRegistration({ displayName: fullName });

      // 3. Send a verification email.
      await sendEmailVerification(userCredential.user);

      setIsSuccess(true);
      
    } catch (error: unknown) {
        console.error("Registration failed:", error);
      if (typeof error === 'object' && error && 'code' in error) {
        const code = String((error as { code: unknown }).code);
        if (code === 'auth/email-already-in-use') {
          setError("This email address is already in use.");
        } else if (code === 'auth/weak-password') {
          setError("Password should be at least 6 characters long.");
        } else {
          setError("An unexpected error occurred. Please try again.");
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isSuccess) {
    return (
        <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-sm bg-surface text-center">
            <CardHeader>
                <div className="mx-auto mb-4 w-fit rounded-full bg-success/10 p-3">
                    <Sparkles className="h-8 w-8 text-success" />
                </div>
                <CardTitle>Registration Successful!</CardTitle>
                <CardDescription>
                    We’ve sent a verification link to <strong>{email}</strong>. Please check your inbox to activate your account.
                </CardDescription>
            </CardHeader>
            <CardFooter>
                 <Button asChild className="w-full bg-primary hover:bg-primary/90">
                    <Link href="/login">Back to Login</Link>
                </Button>
            </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-surface border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create Your Free Account</CardTitle>
          <CardDescription className="text-copy-secondary">
            All users start on a free plan. You can upgrade anytime.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <SocialAuthButtons disabled={isLoading} />
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden>
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-surface px-2 text-xs uppercase tracking-wide text-muted-foreground">
                Or create your account
              </span>
            </div>
          </div>
          <form onSubmit={handleRegister} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} required disabled={isLoading} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={isLoading} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required disabled={isLoading}/>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required disabled={isLoading}/>
                </div>
            </div>
            
            {error && (
                <Alert variant="destructive" className="bg-error/20 border-error text-white">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Button type="submit" className="w-full mt-2 bg-primary hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
