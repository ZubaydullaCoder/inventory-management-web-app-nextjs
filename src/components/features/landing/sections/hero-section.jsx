// src/components/features/landing/sections/hero-section.jsx
import Link from "next/link";
import PrimaryButton from "@/components/ui/primary-button";

/**
 * Hero section component for landing page
 * Adapts content based on authentication status
 * @param {{ session: import('next-auth').Session | null }} props
 */
export default function HeroSection({ session }) {
  const isAuthenticated = !!session?.user;

  return (
    <section className="relative py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-background">
      <div className="container max-w-screen-xl mx-auto text-center">
        <div className="mx-auto max-w-3xl">
          {isAuthenticated ? (
            // Authenticated user content
            <>
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
                Welcome back,{" "}
                <span className="text-primary">
                  {session.user.name?.split(" ")[0] || "User"}
                </span>
                !
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Ready to manage your retail business? Access your dashboard to
                track inventory, process sales, and monitor your business
                performance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard">
                  <PrimaryButton size="lg" className="text-lg px-8 py-3">
                    Go to Dashboard
                  </PrimaryButton>
                </Link>
                <Link href="/dashboard/sales">
                  <PrimaryButton
                    variant="outline"
                    size="lg"
                    className="text-lg px-8 py-3"
                  >
                    Process Sales
                  </PrimaryButton>
                </Link>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Your trial expires in 14 days • Upgrade anytime
              </p>
            </>
          ) : (
            // Unauthenticated user content
            <>
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
                Modern Inventory Management for{" "}
                <span className="text-primary">Retail Success</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Transform your retail business with our comprehensive inventory
                and finance management solution. Built specifically for small to
                mid-sized shops in Uzbekistan.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/login">
                  <PrimaryButton size="lg" className="text-lg px-8 py-3">
                    Start Free Trial
                  </PrimaryButton>
                </Link>
                <Link href="/login">
                  <PrimaryButton
                    variant="outline"
                    size="lg"
                    className="text-lg px-8 py-3"
                  >
                    Login
                  </PrimaryButton>
                </Link>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                14-day free trial • No credit card required
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
