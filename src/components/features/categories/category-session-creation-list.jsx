// /src/components/features/categories/category-session-creation-list.jsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, FolderOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { queryKeys } from "@/lib/queryKeys";
import CategoryDeleteDialog from "./category-delete-dialog";

/**
 * Deletes a category via API
 * @param {string} categoryId - Category ID to delete
 * @returns {Promise<Object>} Delete response
 */
async function deleteCategory(categoryId) {
  const response = await fetch(`/api/categories/${categoryId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete category");
  }

  return await response.json();
}

/**
 * Category list item component for session creation list
 * @param {Object} props - Component props
 * @param {Object} props.category - Category data
 * @param {Function} props.onEdit - Edit callback function
 * @param {Function} props.onDelete - Delete callback function
 * @returns {JSX.Element} Category list item
 */
function CategoryListItem({ category, onEdit, onDelete }) {
  const isOptimistic = category.id.toString().startsWith("optimistic-");
  const isUpdating = !!category.isUpdating;

  return (
    <div
      className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
        isOptimistic || isUpdating
          ? "bg-blue-50 border-blue-200 animate-pulse"
          : "bg-gray-50 hover:bg-gray-100"
      }`}
    >
      <div className="flex-1">
        <h4
          className={`font-medium ${
            isOptimistic || isUpdating ? "text-blue-900" : "text-gray-900"
          }`}
        >
          {category.name}
          {(isOptimistic || isUpdating) && (
            <span className="text-xs ml-2 text-blue-600">(saving...)</span>
          )}
        </h4>
        {category.description && (
          <p className="text-sm text-gray-500 mt-1 truncate">
            {category.description}
          </p>
        )}
        <div className="text-xs text-gray-400 mt-1">
          {category._count?.products || 0} products
        </div>
      </div>

      <div className="flex items-center space-x-2 ml-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(category)}
          disabled={isOptimistic || isUpdating}
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(category)}
          disabled={isOptimistic || isUpdating}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

/**
 * Session creation list component using TanStack Query
 * Displays categories created in the current session from the query cache
 * @param {Object} props - Component props
 * @param {Function} props.onEditCategory - Edit category callback
 * @returns {JSX.Element} Session creation list
 */
export default function CategorySessionCreationList({ onEditCategory }) {
  const queryClient = useQueryClient();
  const [deletingCategory, setDeletingCategory] = useState(null);

  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.session("categories"),
    queryFn: () => {
      return [];
    },
    staleTime: Infinity,
    initialData: [],
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onMutate: async (categoryId) => {
      await queryClient.cancelQueries();
      const previousSessionCategories = queryClient.getQueryData(
        queryKeys.session("categories")
      );
      const previousCategoriesData = queryClient.getQueryData(
        queryKeys.list("categories")
      );

      // Remove from session list
      queryClient.setQueryData(queryKeys.session("categories"), (old) => {
        if (!old) return [];
        return old.filter((c) => c.id !== categoryId);
      });

      // Remove from main categories list
      queryClient.setQueryData(queryKeys.list("categories"), (oldData) => {
        if (!oldData) return oldData;
        return oldData.filter((c) => c.id !== categoryId);
      });

      return { previousSessionCategories, previousCategoriesData };
    },
    onError: (err, categoryId, context) => {
      toast.error(err.message || "Failed to delete category");
      if (context?.previousSessionCategories) {
        queryClient.setQueryData(
          queryKeys.session("categories"),
          context.previousSessionCategories
        );
      }
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

  const handleDelete = () => {
    if (deletingCategory) {
      // Check if it's an optimistic category (not yet saved to server)
      if (deletingCategory.id.toString().startsWith("optimistic-")) {
        // Just remove from session cache for optimistic categories
        queryClient.setQueryData(queryKeys.session("categories"), (old) => {
          if (!old) return [];
          return old.filter((c) => c.id !== deletingCategory.id);
        });
        toast.success("Category removed from session!");
        setDeletingCategory(null);
      } else {
        // Delete from server for real categories
        deleteMutation.mutate(deletingCategory.id);
      }
    }
  };

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FolderOpen className="w-5 h-5 mr-2" />
            Categories Added This Session
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({categories.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FolderOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No categories added yet</p>
              <p className="text-xs mt-1">
                Categories you create will appear here instantly
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {categories.map((category) => (
                <CategoryListItem
                  key={category.id}
                  category={category}
                  onEdit={onEditCategory}
                  onDelete={setDeletingCategory}
                />
              ))}
            </div>
          )}

          {categories.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <Button className="w-full" asChild>
                <a href="/dashboard/inventory/categories">
                  Save and Finish ({categories.length} categories)
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <CategoryDeleteDialog
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDelete}
        categoryName={deletingCategory?.name || ""}
        isPending={deleteMutation.isPending}
      />
    </>
  );
}
