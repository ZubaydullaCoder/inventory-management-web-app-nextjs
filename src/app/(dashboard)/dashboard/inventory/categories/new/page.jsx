// /src/app/(dashboard)/dashboard/inventory/categories/new/page.jsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CategoryCreationCockpit from "@/components/features/categories/category-creation-cockpit";

/**
 * Category creation "Cockpit" page
 * Server Component that orchestrates the category creation workflow
 * @returns {Promise<JSX.Element>} Category creation page
 */
export default async function CategoryCreationCockpitPage() {
  // Re-verify authentication (Defense in Depth)
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add Categories</h1>
        <p className="text-gray-600 mt-1">
          Organize your products by creating categories. Group similar items
          together for better inventory management.
        </p>
      </div>

      {/* Category Creation Cockpit */}
      <CategoryCreationCockpit />
    </div>
  );
}
