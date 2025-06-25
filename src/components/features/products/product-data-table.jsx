// /src/components/features/products/product-data-table.jsx
"use client";

import { useQuery } from "@tanstack/react-query";
import DataTable from "@/components/ui/data-table";
import EmptyState from "@/components/ui/empty-state";
import { createProductColumns } from "@/components/features/products/product-columns";
import { Package } from "lucide-react";
import { queryKeys } from "@/lib/queryKeys";

/**
 * Fetches the list of products from the API.
 * @returns {Promise<Object>} The full paginated data object
 */
async function fetchProducts() {
  // Match the server-side fetch limit to ensure consistency on refetch
  const response = await fetch("/api/products?limit=100");
  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }
  const data = await response.json();
  // Return the entire paginated data object
  return data.data;
}

/**
 * Client component to render the products data table.
 * It uses TanStack Query to manage and update the product list.
 * @param {{ initialProductsData: Object }} props
 * @returns {JSX.Element}
 */
export default function ProductDataTable({ initialProductsData }) {
  const {
    data: productsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.list("products"),
    queryFn: fetchProducts,
    initialData: initialProductsData,
    staleTime: 1000 * 60 * 5, // Keep initial data fresh for 5 mins
  });

  // Extract the products array for the table, defaulting to an empty array
  const products = productsData?.products || [];
  const columns = createProductColumns();

  if (isLoading && !initialProductsData) {
    return <div>Loading table...</div>;
  }

  if (isError) {
    return (
      <div className="text-red-500">
        Error loading products. Please try refreshing.
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No products yet"
        description="Start building your product catalog by adding your first product. You can add pricing, stock levels, and organize by categories."
        actionLabel="Add First Product"
        actionHref="/dashboard/inventory/products/new"
      />
    );
  }

  return (
    <DataTable
      columns={columns}
      data={products}
      filterKey="name"
      filterPlaceholder="Search products..."
    />
  );
}
