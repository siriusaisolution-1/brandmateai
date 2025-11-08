"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Chrome, Facebook, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { signInWithGoogle, signInWithFacebook } from "@/lib/firebase";
import { cn } from "@/lib/utils";

interface SocialAuthButtonsProps {
  className?: string;
  disabled?: boolean;
  redirectPath?: string;
}

type Provider = "google" | "facebook";

type FirebaseErrorLike = {
  code?: unknown;
  message?: unknown;
};

function resolveErrorMessage(
  provider: Provider,
  error: unknown,
): { title: string; description: string } {
  const baseTitle =
    provider === "google" ? "Google sign-in failed" : "Facebook sign-in failed";

  if (error && typeof error === "object") {
    const { code, message } = error as FirebaseErrorLike;
    const codeString = typeof code === "string" ? code : undefined;

    switch (codeString) {
      case "auth/popup-closed-by-user":
        return {
          title: baseTitle,
          description:
            "The sign-in popup was closed before the process could complete.",
        };
      case "auth/cancelled-popup-request":
        return {
          title: baseTitle,
          description:
            "Another sign-in attempt was in progress. Please try again.",
        };
      case "auth/account-exists-with-different-credential":
        return {
          title: baseTitle,
          description:
            "An account already exists with the same email but different sign-in details.",
        };
      default: {
        const messageString =
          typeof message === "string" && message.trim().length > 0
            ? message
            : "Please try again.";
        return { title: baseTitle, description: messageString };
      }
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return { title: baseTitle, description: error.message };
  }

  return { title: baseTitle, description: "Please try again." };
}

export function SocialAuthButtons({
  className,
  disabled,
  redirectPath = "/dashboard",
}: SocialAuthButtonsProps) {
  const [activeProvider, setActiveProvider] = useState<Provider | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleSignIn = async (provider: Provider) => {
    if (disabled || activeProvider) {
      return;
    }

    setActiveProvider(provider);

    try {
      if (provider === "google") {
        await signInWithGoogle();
      } else {
        await signInWithFacebook();
      }

      router.push(redirectPath);
      router.refresh();
    } catch (error) {
      console.error(`${provider} sign-in failed`, error);
      const { title, description } = resolveErrorMessage(provider, error);
      toast({
        variant: "destructive",
        title,
        description,
      });
    } finally {
      setActiveProvider(null);
    }
  };

  const isGoogleLoading = activeProvider === "google";
  const isFacebookLoading = activeProvider === "facebook";

  return (
    <div className={cn("grid gap-2", className)}>
      <Button
        type="button"
        variant="outline"
        onClick={() => handleSignIn("google")}
        disabled={disabled || Boolean(activeProvider)}
        className="flex items-center gap-2"
      >
        {isGoogleLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Chrome className="h-4 w-4" aria-hidden />
        )}
        <span>{isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}</span>
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => handleSignIn("facebook")}
        disabled={disabled || Boolean(activeProvider)}
        className="flex items-center gap-2"
      >
        {isFacebookLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Facebook className="h-4 w-4" aria-hidden />
        )}
        <span>
          {isFacebookLoading ? "Connecting to Facebook..." : "Continue with Facebook"}
        </span>
      </Button>
    </div>
  );
}
