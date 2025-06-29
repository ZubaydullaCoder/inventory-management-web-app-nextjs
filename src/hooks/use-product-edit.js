// /src/hooks/use-product-edit.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/queryKeys";
import {
  fetchProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/api/products-api";
import { fetchCategories } from "@/lib/api/categories-api";

/**
 * Custom hook for product editing functionality
 * @param {string} productId - Product ID to edit
 * @param {boolean} isOpen - Whether the modal is open
 * @param {Function} onClose - Callback to close the modal
 * @returns {Object} Product edit utilities and state
 */
export function useProductEdit(productId, isOpen, onClose) {
  const queryClient = useQueryClient();

  const { data: product, isLoading } = useQuery({
    queryKey: queryKeys.detail("products", productId),
    queryFn: () => fetchProduct(productId),
    enabled: !!productId && isOpen,
  });

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: queryKeys.list("categories"),
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const updateMutation = useMutation({
    mutationFn: (data) => updateProduct(productId, data),
    onMutate: async (newData) => {
      await queryClient.cancelQueries();
      const previousProductsData = queryClient.getQueryData(
        queryKeys.list("products")
      );
      const previousSessionProducts = queryClient.getQueryData(
        queryKeys.session("products")
      );

      const numericData = {
        sellingPrice: parseFloat(newData.sellingPrice),
        purchasePrice: newData.purchasePrice
          ? parseFloat(newData.purchasePrice)
          : undefined,
        stock: newData.stock ? parseInt(newData.stock) : undefined,
        reorderPoint: newData.reorderPoint
          ? parseInt(newData.reorderPoint)
          : undefined,
      };

      // Get category data for optimistic update
      const selectedCategory = categories.find(
        (cat) => cat.id === newData.categoryId
      );

      // Optimistically update the main products list
      queryClient.setQueryData(queryKeys.list("products"), (oldData) => {
        if (!oldData || !oldData.products) return oldData;
        const updatedProducts = oldData.products.map((p) =>
          p.id === productId
            ? {
                ...p,
                ...newData,
                ...numericData,
                category: selectedCategory || null,
              }
            : p
        );
        return { ...oldData, products: updatedProducts };
      });

      // Optimistically update the session products list with an 'isUpdating' flag
      queryClient.setQueryData(queryKeys.session("products"), (old) => {
        if (!old) return [];
        return old.map((p) =>
          p.id === productId
            ? {
                ...p,
                ...newData,
                ...numericData,
                category: selectedCategory || null,
                isUpdating: true,
              }
            : p
        );
      });

      return { previousProductsData, previousSessionProducts };
    },
    onError: (err, newData, context) => {
      toast.error("Failed to update product. Restoring previous state.");
      if (context?.previousProductsData) {
        queryClient.setQueryData(
          queryKeys.list("products"),
          context.previousProductsData
        );
      }
      if (context?.previousSessionProducts) {
        queryClient.setQueryData(
          queryKeys.session("products"),
          context.previousSessionProducts
        );
      }
    },
    onSettled: (data, error, variables, context) => {
      // Invalidate server-facing queries to refetch for eventual consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.list("products") });
      queryClient.invalidateQueries({
        queryKey: queryKeys.detail("products", productId),
      });

      // On success, update the session item with final data from the server response
      // and remove the 'isUpdating' flag.
      if (data?.data) {
        const finalProduct = data.data;

        // Update the session list cache
        queryClient.setQueryData(queryKeys.session("products"), (old) => {
          if (!old) return [];
          return old.map((p) => (p.id === productId ? finalProduct : p));
        });

        // Proactively update the detail query's cache with the fresh data
        queryClient.setQueryData(
          queryKeys.detail("products", productId),
          finalProduct
        );
      } else if (error) {
        // On error, just remove the flag from the rolled-back item
        queryClient.setQueryData(queryKeys.session("products"), (old) => {
          if (!old) return [];
          return old.map((p) => {
            if (p.id === productId) {
              const { isUpdating, ...rest } = p;
              return rest;
            }
            return p;
          });
        });
      }
    },
    onSuccess: () => {
      toast.success("Product updated successfully!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteProduct(productId),
    onMutate: async () => {
      await queryClient.cancelQueries();
      const previousProductsData = queryClient.getQueryData(
        queryKeys.list("products")
      );
      const previousSessionProducts = queryClient.getQueryData(
        queryKeys.session("products")
      );

      // Optimistically remove from main products list
      queryClient.setQueryData(queryKeys.list("products"), (oldData) => {
        if (!oldData || !oldData.products) return oldData;
        const filteredProducts = oldData.products.filter(
          (p) => p.id !== productId
        );
        return { ...oldData, products: filteredProducts };
      });

      // Optimistically remove from session list
      queryClient.setQueryData(queryKeys.session("products"), (old) => {
        if (!old) return [];
        return old.filter((p) => p.id !== productId);
      });

      return { previousProductsData, previousSessionProducts };
    },
    onError: (err, variables, context) => {
      toast.error(err.message || "Failed to delete product");
      if (context?.previousProductsData) {
        queryClient.setQueryData(
          queryKeys.list("products"),
          context.previousProductsData
        );
      }
      if (context?.previousSessionProducts) {
        queryClient.setQueryData(
          queryKeys.session("products"),
          context.previousSessionProducts
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list("products") });
      queryClient.invalidateQueries({
        queryKey: queryKeys.detail("products", productId),
      });
    },
    onSuccess: () => {
      toast.success("Product deleted successfully!");
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
    product,
    categories,
    isLoading,
    isLoadingCategories,
    updateMutation,
    deleteMutation,
    handleUpdate,
    handleDelete,
  };
}
