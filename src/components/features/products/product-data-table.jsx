// /src/components/features/products/product-data-table.jsx
"use client";

import { useQuery } from "@tanstack/react-query";
import DataTable from "@/components/ui/data-table";
import EmptyState from "@/components/ui/empty-state";
import { createProductColumns } from "@/components/features/products/product-columns";
import { Package } from "lucide-react";

/**
 * Fetches the list of products from the API.
 * @returns {Promise<Array<Object>>}
 */
async function fetchProducts() {
  const response = await fetch("/api/products");
  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }
  const data = await response.json();
  // The API returns a paginated structure, we need the products array
  return data.data.products;
}

/**
 * Client component to render the products data table.
 * It uses TanStack Query to manage and update the product list.
 * @param {{ initialProducts: Array<Object> }} props
 * @returns {JSX.Element}
 */
export default function ProductDataTable({ initialProducts }) {
  const {
    data: products,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    initialData: initialProducts,
    staleTime: 1000 * 60 * 5, // Keep initial data fresh for 5 mins
  });

  const columns = createProductColumns();

  if (isLoading && !initialProducts) {
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
