// /src/app/(dashboard)/dashboard/inventory/categories/[id]/edit/page.jsx
import { redirect } from "next/navigation";

/**
 * Fallback page for direct access to edit URLs
 * Redirects users back to the main categories page
 * @returns {never} This component always redirects
 */
export default function EditCategoryFallback() {
  redirect("/dashboard/inventory/categories");
}
