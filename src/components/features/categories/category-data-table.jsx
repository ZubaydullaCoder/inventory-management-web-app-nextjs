// /src/components/features/categories/category-data-table.jsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import DataTable from "@/components/ui/data-table";
import EmptyState from "@/components/ui/empty-state";
import { createCategoryColumns } from "@/components/features/categories/category-columns";
import { FolderOpen } from "lucide-react";
import { queryKeys } from "@/lib/queryKeys";
import CategoryEditModal from "./category-edit-modal";
import CategoryDeleteDialog from "./category-delete-dialog";
import { fetchCategories, deleteCategory } from "@/lib/api/categories-api";

/**
 * Client component to render the categories data table.
 * It uses TanStack Query to manage and update the category list.
 * @param {{ initialCategoriesData: Array }} props
 * @returns {JSX.Element}
 */
export default function CategoryDataTable({ initialCategoriesData }) {
  const queryClient = useQueryClient();
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);

  const {
    data: categories = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.list("categories"),
    queryFn: fetchCategories,
    initialData: initialCategoriesData,
    staleTime: 1000 * 60 * 5,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onMutate: async (categoryId) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.list("categories"),
      });
      const previousCategoriesData = queryClient.getQueryData(
        queryKeys.list("categories")
      );

      queryClient.setQueryData(queryKeys.list("categories"), (oldData) => {
        if (!oldData) return [];
        return oldData.filter((c) => c.id !== categoryId);
      });

      return { previousCategoriesData };
    },
    onError: (err, categoryId, context) => {
      toast.error(err.message || "Failed to delete category");
      if (context?.previousCategoriesData) {
        queryClient.setQueryData(
          queryKeys.list("categories"),
          context.previousCategoriesData
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list("categories") });
      setDeletingCategory(null);
    },
    onSuccess: () => {
      toast.success("Category deleted successfully!");
    },
  });

  const columns = createCategoryColumns(setEditingCategoryId, (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    setDeletingCategory(category);
  });

  const handleDelete = () => {
    if (deletingCategory) {
      deleteMutation.mutate(deletingCategory.id);
    }
  };

  if (isLoading && !initialCategoriesData) {
    return <div>Loading table...</div>;
  }

  if (isError) {
    return (
      <div className="text-red-500">
        Error loading categories. Please try refreshing.
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="No categories yet"
        description="Start organizing your products by creating your first category. Categories help you manage and find products more efficiently."
        actionLabel="Add First Category"
        actionHref="/dashboard/inventory/categories/new"
      />
    );
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={categories}
        filterKey="name"
        filterPlaceholder="Search categories..."
      />
      {editingCategoryId && (
        <CategoryEditModal
          categoryId={editingCategoryId}
          isOpen={!!editingCategoryId}
          onClose={() => setEditingCategoryId(null)}
        />
      )}
      <CategoryDeleteDialog
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDelete}
        categoryName={deletingCategory?.name || ""}
        productCount={deletingCategory?._count?.products || 0}
        isPending={deleteMutation.isPending}
      />
    </>
  );
}
