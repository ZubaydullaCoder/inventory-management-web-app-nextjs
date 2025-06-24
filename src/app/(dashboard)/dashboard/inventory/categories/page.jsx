// /src/app/(dashboard)/dashboard/inventory/categories/page.jsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getCategoriesByUser } from "@/lib/services/category-service";
import PageHeader from "@/components/ui/page-header";
import CategoryDataTable from "@/components/features/categories/category-data-table";

/**
 * Categories list page - main category management view
 * Server Component that fetches categories and displays them in a data table
 * @returns {Promise<JSX.Element>} Categories list page
 */
export default async function CategoriesPage() {
  // Re-verify authentication (Defense in Depth)
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch categories directly via service layer (Hybrid SSR pattern)
  const categoriesData = await getCategoriesByUser(session.user.id, {
    page: 1,
    limit: 100, // Get all categories for now, pagination can be added later
  });

  const { categories } = categoriesData;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Organize your products into categories for better inventory management and easier navigation."
        actionLabel="Add New Category"
        actionHref="/dashboard/inventory/categories/new"
      />
      <CategoryDataTable categories={categories} />
    </div>
  );
}
