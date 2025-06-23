// src/components/features/landing/app-header.jsx
import Link from "next/link";
import { auth } from "@/auth";
import PrimaryButton from "@/components/ui/primary-button";
import UserAvatar from "@/components/features/auth/user-avatar";

/**
 * Public-facing header component for landing page
 * Adapts UI based on authentication status
 */
export default async function AppHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-xl items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">
              IM
            </span>
          </div>
          <span className="hidden font-bold sm:inline-block">
            Inventory Manager
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex items-center space-x-6 text-sm font-medium">
          <Link
            href="#features"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Features
          </Link>
          <Link
            href="#pricing"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Pricing
          </Link>
        </nav>

        {/* CTA Buttons or User Avatar */}
        <div className="flex items-center space-x-2">
          {session?.user ? (
            // Authenticated user - show avatar with dropdown
            <UserAvatar user={session.user} />
          ) : (
            // Unauthenticated user - show login buttons
            <>
              <Link href="/login">
                <PrimaryButton variant="outline" size="sm">
                  Login
                </PrimaryButton>
              </Link>
              <Link href="/login">
                <PrimaryButton size="sm">Start Free Trial</PrimaryButton>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
