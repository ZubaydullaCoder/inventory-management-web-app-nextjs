// src/components/features/auth/google-signin-button.jsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/**
 * Google OAuth sign-in button component
 * @param {{ className?: string }} props
 */
export default function GoogleSignInButton({ className }) {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handle Google OAuth sign-in process
   */
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);

      const result = await signIn("google", {
        callbackUrl: "/dashboard",
        redirect: true,
      });

      if (result?.error) {
        toast.error("Authentication failed. Please try again.");
      }
      // Success handling is managed by NextAuth callbacks
    } catch (error) {
      console.error("Sign-in error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      size="lg"
      className={`w-full ${className || ""}`}
    >
      {isLoading ? "Signing in..." : "Continue with Google"}
    </Button>
  );
}
