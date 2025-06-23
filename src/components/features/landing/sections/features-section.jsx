// src/components/features/landing/sections/features-section.jsx
import FeatureCard from "@/components/features/landing/feature-card";
import {
  Package,
  TrendingUp,
  Users,
  Shield,
  Zap,
  BarChart3,
} from "lucide-react";

/**
 * Features section component for landing page
 * Adapts content based on authentication status
 * @param {{ session: import('next-auth').Session | null }} props
 */
export default function FeaturesSection({ session }) {
  const isAuthenticated = !!session?.user;

  return (
    <section id="features" className="py-20 px-4">
      <div className="container max-w-screen-xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">
            {isAuthenticated
              ? "Your Business Management Tools"
              : "Everything You Need to Manage Your Business"}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {isAuthenticated
              ? "Access all the powerful features to streamline your retail operations and grow your business."
              : "From inventory tracking to financial reporting, our platform provides all the tools you need to run your retail business efficiently."}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<Package className="h-6 w-6 text-primary" />}
            title="Smart Inventory Tracking"
            description={
              isAuthenticated
                ? "Monitor your current stock levels, set reorder points, and get alerts for low inventory items."
                : "Real-time stock monitoring with automatic alerts for low inventory. Track purchases, sales, and adjustments seamlessly."
            }
          />
          <FeatureCard
            icon={<TrendingUp className="h-6 w-6 text-primary" />}
            title="Sales Processing"
            description={
              isAuthenticated
                ? "Use our lightning-fast POS system to process cash and credit sales with keyboard-optimized workflow."
                : "Lightning-fast POS system optimized for keyboard workflow. Handle cash and credit sales with ease."
            }
          />
          <FeatureCard
            icon={<BarChart3 className="h-6 w-6 text-primary" />}
            title="Financial Reports"
            description={
              isAuthenticated
                ? "View comprehensive reports on your sales performance, profit margins, and business growth trends."
                : "Comprehensive reporting on sales, profits, and business performance. Make data-driven decisions."
            }
          />
          <FeatureCard
            icon={<Users className="h-6 w-6 text-primary" />}
            title="Customer Management"
            description={
              isAuthenticated
                ? "Manage your customer accounts, track credit balances, and view detailed purchase histories."
                : "Track customer accounts, credit balances, and purchase history. Build stronger relationships."
            }
          />
          <FeatureCard
            icon={<Shield className="h-6 w-6 text-primary" />}
            title="Secure & Reliable"
            description={
              isAuthenticated
                ? "Your business data is protected with enterprise-grade security and automatic backups."
                : "Enterprise-grade security with Google OAuth authentication. Your data is safe and accessible."
            }
          />
          <FeatureCard
            icon={<Zap className="h-6 w-6 text-primary" />}
            title="Lightning Fast"
            description={
              isAuthenticated
                ? "Optimized performance means less waiting and more time focusing on your customers and sales."
                : "Optimized for speed and efficiency. Spend less time on admin work and more time growing your business."
            }
          />
        </div>
      </div>
    </section>
  );
}
