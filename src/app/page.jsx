// src/app/page.jsx
import { auth } from "@/auth";
import AppHeader from "@/components/features/landing/app-header";
import AppFooter from "@/components/features/landing/app-footer";
import HeroSection from "@/components/features/landing/sections/hero-section";
import FeaturesSection from "@/components/features/landing/sections/features-section";
import PricingSection from "@/components/features/landing/sections/pricing-section";
import QuickActionsSection from "@/components/features/landing/sections/quick-actions-section";
import CtaSection from "@/components/features/landing/sections/cta-section";

/**
 * Landing page showcasing the Retail Inventory & Finance Manager
 * Server Component that orchestrates the marketing page layout
 * Adapts content based on authentication status
 */
export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />

      <main className="flex-1">
        <HeroSection session={session} />
        <FeaturesSection session={session} />
        <PricingSection session={session} />
        <QuickActionsSection session={session} />
        <CtaSection session={session} />
      </main>

      <AppFooter />
    </div>
  );
}
