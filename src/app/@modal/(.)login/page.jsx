// src/app/@modal/(.)login/page.jsx
"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import GoogleSignInButton from "@/components/features/auth/google-signin-button";

/**
 * Authentication modal component using intercepting routes
 * Triggered when users navigate to /login from the landing page
 */
export default function AuthModal() {
  const router = useRouter();

  /**
   * Handle modal close - navigate back to previous page
   */
  const handleClose = () => {
    router.back();
  };

  return (
    <Dialog open onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Welcome</DialogTitle>
          <DialogDescription className="text-center">
            Sign in to access your retail management dashboard
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-6 py-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Start your 14-day free trial today
            </p>
            <p className="text-xs text-muted-foreground">
              No credit card required
            </p>
          </div>

          <GoogleSignInButton />

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              By signing in, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
