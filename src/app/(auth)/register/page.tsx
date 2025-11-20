'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'
import { httpsCallable } from 'firebase/functions'

import { SocialAuthButtons } from '@/components/auth/social-auth-buttons'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { auth, functions } from '@/lib/firebase'

// This now points to our refactored backend function
const completeRegistration = httpsCallable(functions, 'completeRegistration')

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsLoading(true)
    try {
      // 1. Create the user in Firebase Auth.
      // This will trigger the `onUserCreated` function on the backend,
      // which creates the Firestore document and sets the initial 'free' plan claim.
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      // 2. Call our new callable function to finalize the registration
      // by providing the display name.
      await completeRegistration({ displayName: fullName })

      // 3. Send a verification email.
      await sendEmailVerification(userCredential.user)

      router.push('/dashboard')
      router.refresh()
    } catch (error: unknown) {
      console.error('Registration failed:', error)
      if (typeof error === 'object' && error && 'code' in error) {
        const code = String((error as { code: unknown }).code)
        if (code === 'auth/email-already-in-use') {
          setError('This email address is already in use.')
        } else if (code === 'auth/weak-password') {
          setError('Password should be at least 6 characters long.')
        } else {
          setError('An unexpected error occurred. Please try again.')
        }
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-gray-700 bg-surface">
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
              <Input
                id="fullName"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="border-error bg-error/20 text-white">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="mt-2 w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-primary underline-offset-4 hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
