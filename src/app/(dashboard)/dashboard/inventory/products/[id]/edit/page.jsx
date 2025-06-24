// /src/app/(dashboard)/dashboard/inventory/products/[id]/edit/page.jsx
import { redirect } from "next/navigation";

/**
 * Fallback page for direct access to edit URLs
 * Redirects users back to the main products page
 * @returns {never} This component always redirects
 */
export default function EditProductFallback() {
  redirect("/dashboard/inventory/products");
}
