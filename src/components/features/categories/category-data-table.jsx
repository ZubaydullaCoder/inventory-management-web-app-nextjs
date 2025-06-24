// /src/components/features/categories/category-data-table.jsx
"use client";

import DataTable from "@/components/ui/data-table";
import EmptyState from "@/components/ui/empty-state";
import { createCategoryColumns } from "@/components/features/categories/category-columns";
import { Tags } from "lucide-react";

/**
 * Client component to render the categories data table.
 * It handles column creation and passes data to the generic DataTable.
 * @param {{ categories: Array<Object> }} props - Component props
 * @returns {JSX.Element}
 */
export default function CategoryDataTable({ categories }) {
  const columns = createCategoryColumns();

  if (categories.length === 0) {
    return (
      <EmptyState
        icon={Tags}
        title="No categories yet"
        description="Start organizing your products by creating categories. Categories help you group similar items together for better inventory management."
        actionLabel="Add First Category"
        actionHref="/dashboard/inventory/categories/new"
      />
    );
  }

  return (
    <DataTable
      columns={columns}
      data={categories}
      filterKey="name"
      filterPlaceholder="Search categories..."
    />
  );
}
