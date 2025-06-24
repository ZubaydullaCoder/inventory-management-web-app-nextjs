// /src/app/(dashboard)/dashboard/inventory/products/page.jsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getProductsByUser } from "@/lib/services/product-service";
import PageHeader from "@/components/ui/page-header";
import ProductDataTable from "@/components/features/products/product-data-table";

/**
 * Products list page - main inventory view
 * Server Component that fetches products and displays them in a data table
 * @returns {Promise<JSX.Element>} Products list page
 */
export default async function ProductsPage() {
  // Re-verify authentication (Defense in Depth)
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch products directly via service layer (Hybrid SSR pattern)
  const productsData = await getProductsByUser(session.user.id, {
    page: 1,
    limit: 100, // Get all products for now, pagination can be added later
  });

  const { products } = productsData;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage your product inventory, pricing, and stock levels."
        actionLabel="Add New Product"
        actionHref="/dashboard/inventory/products/new"
      />
      <ProductDataTable products={products} />
    </div>
  );
}
