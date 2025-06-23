// src/components/features/landing/sections/cta-section.jsx
import Link from "next/link";
import PrimaryButton from "@/components/ui/primary-button";

/**
 * Call-to-action section component for landing page
 * Adapts content based on authentication status
 * @param {{ session: import('next-auth').Session | null }} props
 */
export default function CtaSection({ session }) {
  const isAuthenticated = !!session?.user;

  return (
    <section className="py-20 px-4">
      <div className="container max-w-screen-xl mx-auto">
        <div className="bg-primary rounded-2xl p-8 md:p-12 text-center text-primary-foreground">
          {isAuthenticated ? (
            // Authenticated user CTA
            <>
              <h2 className="text-3xl font-bold mb-4">
                Ready to Upgrade Your Plan?
              </h2>
              <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
                Unlock advanced features and remove limits with our paid plans.
                Continue growing your business with additional users, products,
                and premium support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard/settings/subscription">
                  <PrimaryButton
                    size="lg"
                    className="text-lg px-8 py-3 bg-background text-foreground hover:bg-background/90"
                  >
                    View Plans
                  </PrimaryButton>
                </Link>
              </div>
              <p className="text-sm text-primary-foreground/80 mt-4">
                Upgrade anytime • Cancel anytime • 30-day money-back guarantee
              </p>
            </>
          ) : (
            // Unauthenticated user CTA
            <>
              <h2 className="text-3xl font-bold mb-4">
                Ready to Transform Your Business?
              </h2>
              <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
                Join hundreds of retailers who have streamlined their operations
                with our platform. Start your free trial today and see the
                difference.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/login">
                  <PrimaryButton
                    size="lg"
                    className="text-lg px-8 py-3 bg-background text-foreground hover:bg-background/90"
                  >
                    Start Free Trial
                  </PrimaryButton>
                </Link>
              </div>
              <p className="text-sm text-primary-foreground/80 mt-4">
                No setup fees • Cancel anytime • 14-day money-back guarantee
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
