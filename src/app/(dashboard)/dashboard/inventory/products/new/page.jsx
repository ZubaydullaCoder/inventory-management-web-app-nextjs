// /src/app/(dashboard)/dashboard/inventory/products/new/page.jsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ProductCreationCockpit from "@/components/features/products/product-creation-cockpit";

/**
 * Product creation "Cockpit" page
 * Server Component that orchestrates the product creation workflow
 * @returns {Promise<JSX.Element>} Product creation page
 */
export default async function ProductCreationCockpitPage() {
  // Re-verify authentication (Defense in Depth)
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add Products</h1>
        <p className="text-gray-600 mt-1">
          Quickly add multiple products to your inventory. Use the form to
          create products one by one.
        </p>
      </div>

      {/* Product Creation Cockpit */}
      <ProductCreationCockpit />
    </div>
  );
}
