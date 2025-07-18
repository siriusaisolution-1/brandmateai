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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { auth, functions } from '@/lib/firebase' // We need to create this file
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth'
import { httpsCallable } from 'firebase/functions'
import { Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Alert, AlertDescription } from '@/components/ui/alert'

type SubscriptionPlan = 'free' | 'small-business' | 'small-agency' | 'enterprise';

const registerUserWithPlan = httpsCallable(functions, 'registeruserwithplan');

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [plan, setPlan] = useState<SubscriptionPlan>('free');
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(userCredential.user, { displayName: fullName });
      await registerUserWithPlan({ plan, displayName: fullName });
      await sendEmailVerification(userCredential.user);

      setIsSuccess(true);
      
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setError("This email address is already in use.");
      } else if (error.code === 'auth/weak-password') {
        setError("Password should be at least 6 characters long.");
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
                    We've sent a verification link to <strong>{email}</strong>. Please check your inbox to activate your account.
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
          <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
          <CardDescription className="text-copy-secondary">
            Choose your plan and start your journey with us.
          </CardDescription>
        </CardHeader>
        <CardContent>
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

             <div className="grid gap-2 pt-2">
                <Label>Choose Your Plan</Label>
                <RadioGroup defaultValue="free" value={plan} onValueChange={(v) => setPlan(v as SubscriptionPlan)} className="grid grid-cols-2 gap-4">
                    <Label htmlFor="free" className="flex flex-col items-center justify-between rounded-md border-2 border-gray-600 bg-background p-4 hover:bg-gray-800/80 cursor-pointer [&:has([data-state=checked])]:border-primary">Free</Label>
                    <RadioGroupItem value="free" id="free" className="sr-only" />
                    
                    <Label htmlFor="small-business" className="flex flex-col items-center justify-between rounded-md border-2 border-gray-600 bg-background p-4 hover:bg-gray-800/80 cursor-pointer [&:has([data-state=checked])]:border-primary">Small Business</Label>
                    <RadioGroupItem value="small-business" id="small-business" className="sr-only" />
                </RadioGroup>
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
