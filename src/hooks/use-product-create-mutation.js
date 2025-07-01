import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/queryKeys";
import { createProduct } from "@/lib/api/products-api";
import { fetchCategories } from "@/lib/api/categories-api";

/**
 * Custom hook for product creation with optimistic updates
 * @param {Function} [onProductCreated] - Optional callback when product is created
 * @returns {Object} Product creation utilities and state
 */
export function useProductCreateMutation(onProductCreated) {
  const queryClient = useQueryClient();

  // Fetch categories
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: queryKeys.list("categories"),
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onMutate: async (newProductData) => {
      // Cancel ongoing queries to prevent overwriting optimistic update
      await queryClient.cancelQueries({
        queryKey: queryKeys.session("products"),
      });
      await queryClient.cancelQueries({ queryKey: queryKeys.list("products") });

      // Snapshot the previous session data
      const previousSessionProducts = queryClient.getQueryData(
        queryKeys.session("products")
      );

      // Create optimistic product with temporary data
      const optimisticTimestamp = Date.now();
      const selectedCategory = categories.find(
        (cat) => cat.id === newProductData.categoryId
      );

      const optimisticProduct = {
        id: `optimistic-${optimisticTimestamp}`,
        name: newProductData.name,
        description: newProductData.description || "",
        sku: newProductData.sku || "",
        sellingPrice: parseFloat(newProductData.sellingPrice),
        purchasePrice: newProductData.purchasePrice
          ? parseFloat(newProductData.purchasePrice)
          : null,
        stock: newProductData.stock ? parseInt(newProductData.stock) : 0,
        reorderPoint: newProductData.reorderPoint
          ? parseInt(newProductData.reorderPoint)
          : 0,
        unit: newProductData.unit,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        category: selectedCategory || null,
        supplier: null,
        _count: {},
        _optimisticTimestamp: optimisticTimestamp,
      };

      // Optimistically update the session cache
      queryClient.setQueryData(queryKeys.session("products"), (old) => {
        const currentProducts = old || [];
        return [optimisticProduct, ...currentProducts];
      });

      return { previousSessionProducts, optimisticTimestamp };
    },
    onError: (error, newProductData, context) => {
      toast.error(`Failed to create product: ${error.message}`);
      if (context?.previousSessionProducts !== undefined) {
        queryClient.setQueryData(
          queryKeys.session("products"),
          context.previousSessionProducts
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list("products") });
    },
    onSuccess: (response, formData, context) => {
      toast.success("Product created successfully!");

      // Replace optimistic product with real server data
      queryClient.setQueryData(queryKeys.session("products"), (old) => {
        const currentProducts = old || [];
        const updatedProducts = currentProducts.map((product) => {
          if (product._optimisticTimestamp === context.optimisticTimestamp) {
            return response.data;
          }
          return product;
        });
        return updatedProducts;
      });

      if (onProductCreated) {
        onProductCreated(response.data);
      }
    },
  });

  return {
    categories,
    isLoadingCategories,
    createProductMutation,
  };
}
