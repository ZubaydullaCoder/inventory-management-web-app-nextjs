// /src/components/features/products/product-creation-form.jsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { queryKeys } from "@/lib/queryKeys";

/**
 * Product form validation schema
 */
const ProductFormSchema = z.object({
  name: z.string().min(1, "Product name is required").max(255),
  description: z.string().optional(),
  sku: z.string().optional(),
  sellingPrice: z.string().min(1, "Selling price is required"),
  purchasePrice: z.string().optional(),
  stock: z.string().optional(),
  reorderPoint: z.string().optional(),
  categoryId: z.string().optional(),
  supplierId: z.string().optional(),
});

/**
 * Product creation form data
 * @typedef {Object} ProductFormData
 * @property {string} name - Product name
 * @property {string} [description] - Product description
 * @property {string} [sku] - Product SKU
 * @property {string} sellingPrice - Product selling price (as string for form)
 * @property {string} [purchasePrice] - Product purchase price (as string for form)
 * @property {string} [stock] - Initial stock quantity (as string for form)
 * @property {string} [reorderPoint] - Reorder point threshold (as string for form)
 * @property {string} [categoryId] - Category ID (optional)
 * @property {string} [supplierId] - Supplier ID (optional)
 */

/**
 * Creates a new product via API
 * @param {ProductFormData} formData - Form data to submit
 * @returns {Promise<Object>} API response
 */
async function createProduct(formData) {
  // Convert string numbers to actual numbers for API
  const apiData = {
    ...formData,
    sellingPrice: parseFloat(formData.sellingPrice),
    purchasePrice: formData.purchasePrice
      ? parseFloat(formData.purchasePrice)
      : undefined,
    stock: formData.stock ? parseInt(formData.stock) : undefined,
    reorderPoint: formData.reorderPoint
      ? parseInt(formData.reorderPoint)
      : undefined,
  };

  const response = await fetch("/api/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(apiData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create product");
  }

  return await response.json();
}

/**
 * Product creation form component with optimistic updates
 * Handles form submission and validation for creating new products
 * @param {Object} props - Component props
 * @param {Function} [props.onProductCreated] - Optional callback when product is successfully created
 * @returns {JSX.Element} Product creation form
 */
export default function ProductCreationForm({ onProductCreated }) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      name: "",
      description: "",
      sku: "",
      sellingPrice: "",
      purchasePrice: "",
      stock: "0",
      reorderPoint: "0",
    },
  });

  // Mutation with optimistic updates following Guide 2 pattern
  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onMutate: async (newProductData) => {
      // 1. Cancel ongoing queries to prevent overwriting optimistic update
      await queryClient.cancelQueries({
        queryKey: queryKeys.session("products"),
      });
      await queryClient.cancelQueries({ queryKey: queryKeys.list("products") });

      // 2. Snapshot the previous session data
      const previousSessionProducts = queryClient.getQueryData(
        queryKeys.session("products")
      );

      // 3. Create optimistic product with temporary data (store timestamp for identification)
      const optimisticTimestamp = Date.now();
      const optimisticProduct = {
        id: `optimistic-${optimisticTimestamp}`, // Temporary ID with timestamp
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        category: null,
        supplier: null,
        _count: {
          /* default structure */
        },
        // Store timestamp for later identification
        _optimisticTimestamp: optimisticTimestamp,
      };

      // 4. Optimistically update the session cache
      queryClient.setQueryData(queryKeys.session("products"), (old) => {
        const currentProducts = old || [];
        return [optimisticProduct, ...currentProducts];
      });

      // 5. Return context with snapshot and timestamp for potential rollback
      return { previousSessionProducts, optimisticTimestamp };
    },
    onError: (error, newProductData, context) => {
      // 6. Rollback on error
      toast.error(`Failed to create product: ${error.message}`);
      if (context?.previousSessionProducts !== undefined) {
        queryClient.setQueryData(
          queryKeys.session("products"),
          context.previousSessionProducts
        );
      }
    },
    onSettled: () => {
      // 7. Invalidate the main products list to ensure eventual consistency
      //    DO NOT invalidate the session list, as it's client-managed.
      queryClient.invalidateQueries({ queryKey: queryKeys.list("products") });
    },
    onSuccess: (response, formData, context) => {
      // 8. Handle success
      toast.success("Product created successfully!");

      // Replace ONLY the specific optimistic product with real server data
      queryClient.setQueryData(queryKeys.session("products"), (old) => {
        const currentProducts = old || [];

        // Find and replace the specific optimistic product by timestamp
        const updatedProducts = currentProducts.map((product) => {
          // Check if this is the optimistic product we just created
          if (product._optimisticTimestamp === context.optimisticTimestamp) {
            // Replace with real server data (use response.data directly)
            return response.data;
          }
          return product;
        });

        return updatedProducts;
      });

      // Call optional callback
      if (onProductCreated) {
        onProductCreated(response.data);
      }
    },
  });

  /**
   * Handles form submission
   * @param {ProductFormData} data - Form data
   */
  const onSubmit = (data) => {
    createProductMutation.mutate(data);

    // Clear form and focus first input immediately for quick continuation
    reset();
    setTimeout(() => {
      const firstInput = document.querySelector('input[name="name"]');
      if (firstInput) firstInput.focus();
    }, 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Product</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter product name"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              {...register("description")}
              placeholder="Product description (optional)"
            />
          </div>

          {/* SKU */}
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              {...register("sku")}
              placeholder="Product SKU (optional)"
            />
          </div>

          {/* Price Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sellingPrice">Selling Price *</Label>
              <Input
                id="sellingPrice"
                type="number"
                step="0.01"
                {...register("sellingPrice")}
                placeholder="0.00"
                className={errors.sellingPrice ? "border-red-500" : ""}
              />
              {errors.sellingPrice && (
                <p className="text-sm text-red-500">
                  {errors.sellingPrice.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Purchase Price</Label>
              <Input
                id="purchasePrice"
                type="number"
                step="0.01"
                {...register("purchasePrice")}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Stock Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Initial Stock</Label>
              <Input
                id="stock"
                type="number"
                {...register("stock")}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reorderPoint">Reorder Point</Label>
              <Input
                id="reorderPoint"
                type="number"
                {...register("reorderPoint")}
                placeholder="0"
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={createProductMutation.isPending}
            className="w-full"
          >
            {createProductMutation.isPending
              ? "Saving..."
              : "Save and Add Another"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
