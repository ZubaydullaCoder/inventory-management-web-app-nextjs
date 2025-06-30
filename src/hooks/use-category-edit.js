// /src/hooks/use-category-edit.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/queryKeys";

/**
 * Fetches a single category by ID
 * @param {string} categoryId - Category ID to fetch
 * @returns {Promise<Object>} Category data
 */
async function fetchCategory(categoryId) {
  const response = await fetch(`/api/categories/${categoryId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch category");
  }
  const data = await response.json();
  return data.data;
}

/**
 * Updates a category via API
 * @param {string} categoryId - Category ID to update
 * @param {Object} categoryData - Category data to update
 * @returns {Promise<Object>} Updated category
 */
async function updateCategory(categoryId, categoryData) {
  const response = await fetch(`/api/categories/${categoryId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(categoryData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update category");
  }

  return await response.json();
}

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
 * Custom hook for category editing functionality
 * @param {string} categoryId - Category ID to edit
 * @param {boolean} isOpen - Whether the modal is open
 * @param {Function} onClose - Callback to close the modal
 * @returns {Object} Category edit utilities and state
 */
export function useCategoryEdit(categoryId, isOpen, onClose) {
  const queryClient = useQueryClient();

  const { data: category, isLoading } = useQuery({
    queryKey: queryKeys.detail("categories", categoryId),
    queryFn: () => fetchCategory(categoryId),
    enabled: !!categoryId && isOpen,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => updateCategory(categoryId, data),
    onMutate: async (newData) => {
      await queryClient.cancelQueries();
      const previousCategoriesData = queryClient.getQueryData(
        queryKeys.list("categories")
      );
      const previousSessionCategories = queryClient.getQueryData(
        queryKeys.session("categories")
      );

      // Optimistically update the main categories list
      queryClient.setQueryData(queryKeys.list("categories"), (oldData) => {
        if (!oldData) return [];
        return oldData.map((c) =>
          c.id === categoryId
            ? {
                ...c,
                ...newData,
              }
            : c
        );
      });

      // Optimistically update the session categories list with an 'isUpdating' flag
      queryClient.setQueryData(queryKeys.session("categories"), (old) => {
        if (!old) return [];
        return old.map((c) =>
          c.id === categoryId
            ? {
                ...c,
                ...newData,
                isUpdating: true,
              }
            : c
        );
      });

      return { previousCategoriesData, previousSessionCategories };
    },
    onError: (err, newData, context) => {
      toast.error("Failed to update category. Restoring previous state.");
      if (context?.previousCategoriesData) {
        queryClient.setQueryData(
          queryKeys.list("categories"),
          context.previousCategoriesData
        );
      }
      if (context?.previousSessionCategories) {
        queryClient.setQueryData(
          queryKeys.session("categories"),
          context.previousSessionCategories
        );
      }
    },
    onSettled: (data, error, variables, context) => {
      // Invalidate server-facing queries to refetch for eventual consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.list("categories") });
      queryClient.invalidateQueries({
        queryKey: queryKeys.detail("categories", categoryId),
      });

      // On success, update the session item with final data from the server response
      // and remove the 'isUpdating' flag.
      if (data?.data) {
        const finalCategory = data.data;

        // Update the session list cache
        queryClient.setQueryData(queryKeys.session("categories"), (old) => {
          if (!old) return [];
          return old.map((c) => (c.id === categoryId ? finalCategory : c));
        });

        // Proactively update the detail query's cache with the fresh data
        queryClient.setQueryData(
          queryKeys.detail("categories", categoryId),
          finalCategory
        );
      } else if (error) {
        // On error, just remove the flag from the rolled-back item
        queryClient.setQueryData(queryKeys.session("categories"), (old) => {
          if (!old) return [];
          return old.map((c) => {
            if (c.id === categoryId) {
              const { isUpdating, ...rest } = c;
              return rest;
            }
            return c;
          });
        });
      }
    },
    onSuccess: () => {
      toast.success("Category updated successfully!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteCategory(categoryId),
    onMutate: async () => {
      await queryClient.cancelQueries();
      const previousCategoriesData = queryClient.getQueryData(
        queryKeys.list("categories")
      );
      const previousSessionCategories = queryClient.getQueryData(
        queryKeys.session("categories")
      );

      // Optimistically remove from main categories list
      queryClient.setQueryData(queryKeys.list("categories"), (oldData) => {
        if (!oldData) return [];
        return oldData.filter((c) => c.id !== categoryId);
      });

      // Optimistically remove from session list
      queryClient.setQueryData(queryKeys.session("categories"), (old) => {
        if (!old) return [];
        return old.filter((c) => c.id !== categoryId);
      });

      return { previousCategoriesData, previousSessionCategories };
    },
    onError: (err, variables, context) => {
      toast.error(err.message || "Failed to delete category");
      if (context?.previousCategoriesData) {
        queryClient.setQueryData(
          queryKeys.list("categories"),
          context.previousCategoriesData
        );
      }
      if (context?.previousSessionCategories) {
        queryClient.setQueryData(
          queryKeys.session("categories"),
          context.previousSessionCategories
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list("categories") });
      queryClient.invalidateQueries({
        queryKey: queryKeys.detail("categories", categoryId),
      });
    },
    onSuccess: () => {
      toast.success("Category deleted successfully!");
      onClose();
    },
  });

  const handleUpdate = (data) => {
    onClose(); // Optimistically close the modal immediately
    updateMutation.mutate(data);
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  return {
    category,
    isLoading,
    updateMutation,
    deleteMutation,
    handleUpdate,
    handleDelete,
  };
}
