// src/components/features/landing/sections/pricing-section.jsx
import PricingCard from "@/components/features/landing/pricing-card";

/**
 * Pricing section component for landing page
 * Only renders for unauthenticated users
 * @param {{ session: import('next-auth').Session | null }} props
 */
export default function PricingSection({ session }) {
  const isAuthenticated = !!session?.user;

  // Don't render for authenticated users
  if (isAuthenticated) {
    return null;
  }

  return (
    <section id="pricing" className="py-20 px-4 bg-muted/50">
      <div className="container max-w-screen-xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start with our free trial, then choose the plan that best fits your
            business needs. All plans include core inventory and sales features.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 max-w-5xl mx-auto">
          <PricingCard
            title="Basic"
            price="$29"
            description="Perfect for small shops just getting started"
            features={[
              "Up to 500 products",
              "1 user account",
              "Basic reporting",
              "Email support",
              "Mobile responsive",
            ]}
            buttonText="Start Free Trial"
            buttonHref="/login"
          />
          <PricingCard
            title="Standard"
            price="$59"
            description="Ideal for growing businesses with multiple staff"
            features={[
              "Up to 2,000 products",
              "Up to 3 users",
              "Advanced reporting",
              "Priority support",
              "Data export",
              "Customer management",
            ]}
            isPopular={true}
            buttonText="Start Free Trial"
            buttonHref="/login"
          />
          <PricingCard
            title="Premium"
            price="$99"
            description="For established retailers with complex needs"
            features={[
              "Unlimited products",
              "Unlimited users",
              "Custom reports",
              "Phone & email support",
              "API access",
              "Multi-location support",
              "Advanced analytics",
            ]}
            buttonText="Start Free Trial"
            buttonHref="/login"
          />
        </div>
      </div>
    </section>
  );
}
