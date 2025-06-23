// src/components/features/landing/sections/quick-actions-section.jsx
import Link from "next/link";
import { Package, TrendingUp, Users, BarChart3 } from "lucide-react";

/**
 * Quick actions section component for landing page
 * Only renders for authenticated users
 * @param {{ session: import('next-auth').Session | null }} props
 */
export default function QuickActionsSection({ session }) {
  const isAuthenticated = !!session?.user;

  // Don't render for unauthenticated users
  if (!isAuthenticated) {
    return null;
  }

  return (
    <section className="py-20 px-4 bg-muted/50">
      <div className="container max-w-screen-xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Quick Actions</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Jump straight into your most common tasks and keep your business
            running smoothly.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto">
          <Link href="/dashboard/sales" className="group">
            <div className="bg-background rounded-lg p-6 shadow-sm border hover:shadow-md transition-all group-hover:border-primary/50">
              <TrendingUp className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Process Sale</h3>
              <p className="text-sm text-muted-foreground">
                Start selling with our fast POS system
              </p>
            </div>
          </Link>

          <Link href="/dashboard/inventory/receive-stock" className="group">
            <div className="bg-background rounded-lg p-6 shadow-sm border hover:shadow-md transition-all group-hover:border-primary/50">
              <Package className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Receive Stock</h3>
              <p className="text-sm text-muted-foreground">
                Add new inventory to your stock
              </p>
            </div>
          </Link>

          <Link href="/dashboard/inventory/products" className="group">
            <div className="bg-background rounded-lg p-6 shadow-sm border hover:shadow-md transition-all group-hover:border-primary/50">
              <BarChart3 className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">View Products</h3>
              <p className="text-sm text-muted-foreground">
                Manage your product catalog
              </p>
            </div>
          </Link>

          <Link href="/dashboard/reports" className="group">
            <div className="bg-background rounded-lg p-6 shadow-sm border hover:shadow-md transition-all group-hover:border-primary/50">
              <Users className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">View Reports</h3>
              <p className="text-sm text-muted-foreground">
                Analyze your business performance
              </p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
