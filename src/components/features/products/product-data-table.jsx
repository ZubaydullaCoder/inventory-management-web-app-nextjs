// /src/components/features/products/product-data-table.jsx
"use client";

import DataTable from "@/components/ui/data-table";
import EmptyState from "@/components/ui/empty-state";
import { createProductColumns } from "@/components/features/products/product-columns";
import { Package } from "lucide-react";

/**
 * Client component to render the products data table.
 * Handles column creation and passes data to the generic DataTable.
 * @param {{ products: Array<Object> }} props
 * @returns {JSX.Element}
 */
export default function ProductDataTable({ products }) {
  const columns = createProductColumns();

  if (products.length === 0) {
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
