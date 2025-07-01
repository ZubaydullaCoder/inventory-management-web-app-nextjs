// /src/hooks/use-category-create-mutation.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/queryKeys";
import { createCategory } from "@/lib/api/categories-api";

/**
 * Custom hook for category creation with optimistic updates
 * @param {Function} [onCategoryCreated] - Optional callback when category is created
 * @returns {Object} Category creation utilities and state
 */
export function useCategoryCreateMutation(onCategoryCreated) {
  const queryClient = useQueryClient();

  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onMutate: async (newCategoryData) => {
      // Cancel ongoing queries to prevent overwriting optimistic update
      await queryClient.cancelQueries({
        queryKey: queryKeys.session("categories"),
      });
      await queryClient.cancelQueries({
        queryKey: queryKeys.list("categories"),
      });

      // Snapshot the previous session data
      const previousSessionCategories = queryClient.getQueryData(
        queryKeys.session("categories")
      );

      // Create optimistic category with temporary data
      const optimisticTimestamp = Date.now();

      const optimisticCategory = {
        id: `optimistic-${optimisticTimestamp}`,
        name: newCategoryData.name,
        description: newCategoryData.description || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _count: { products: 0 },
        _optimisticTimestamp: optimisticTimestamp,
      };

      // Optimistically update the session cache
      queryClient.setQueryData(queryKeys.session("categories"), (old) => {
        const currentCategories = old || [];
        return [optimisticCategory, ...currentCategories];
      });

      return { previousSessionCategories, optimisticTimestamp };
    },
    onError: (error, newCategoryData, context) => {
      toast.error(`Failed to create category: ${error.message}`);
      if (context?.previousSessionCategories !== undefined) {
        queryClient.setQueryData(
          queryKeys.session("categories"),
          context.previousSessionCategories
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list("categories") });
    },
    onSuccess: (response, formData, context) => {
      toast.success("Category created successfully!");

      // Replace optimistic category with real server data
      queryClient.setQueryData(queryKeys.session("categories"), (old) => {
        const currentCategories = old || [];
        const updatedCategories = currentCategories.map((category) => {
          if (category._optimisticTimestamp === context.optimisticTimestamp) {
            return response.data;
          }
          return category;
        });
        return updatedCategories;
      });

      if (onCategoryCreated) {
        onCategoryCreated(response.data);
      }
    },
  });

  return {
    createCategoryMutation,
  };
}
