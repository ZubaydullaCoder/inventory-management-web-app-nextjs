// /src/app/(dashboard)/dashboard/inventory/products/@modal/(..)products/[id]/edit/page.jsx
"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { queryKeys } from "@/lib/queryKeys";

/**
 * Product edit form validation schema
 */
const EditProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(255),
  description: z.string().optional(),
  sku: z.string().optional(),
  sellingPrice: z.string().min(1, "Selling price is required"),
  purchasePrice: z.string().optional(),
  stock: z.string().optional(),
  reorderPoint: z.string().optional(),
});

/**
 * Fetches a single product by ID
 * @param {string} productId - Product ID to fetch
 * @returns {Promise<Object>} Product data
 */
async function fetchProduct(productId) {
  const response = await fetch(`/api/products/${productId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch product");
  }
  const data = await response.json();
  return data.data;
}

/**
 * Updates a product via API
 * @param {string} productId - Product ID to update
 * @param {Object} productData - Updated product data
 * @returns {Promise<Object>} Updated product data
 */
async function updateProduct(productId, productData) {
  // Convert string numbers to actual numbers for API
  const apiData = {
    ...productData,
    sellingPrice: parseFloat(productData.sellingPrice),
    purchasePrice: productData.purchasePrice
      ? parseFloat(productData.purchasePrice)
      : undefined,
    stock: productData.stock ? parseInt(productData.stock) : undefined,
    reorderPoint: productData.reorderPoint
      ? parseInt(productData.reorderPoint)
      : undefined,
  };

  const response = await fetch(`/api/products/${productId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(apiData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update product");
  }

  return await response.json();
}

/**
 * Product edit modal component (Intercepting Route)
 * Handles editing products in a modal overlay
 * @param {Object} props - Component props
 * @param {Object} props.params - Route parameters
 * @param {string} props.params.id - Product ID to edit
 * @returns {JSX.Element} Product edit modal
 */
export default function EditProductModal({ params }) {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const queryClient = useQueryClient();

  // Unwrap params Promise (Next.js App Router best practice)
  const { id: productId } = use(params);

  // Fetch product data
  const { data: product, isLoading } = useQuery({
    queryKey: queryKeys.detail("products", productId),
    queryFn: () => fetchProduct(productId),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(EditProductSchema),
  });

  // Reset form when product data is loaded
  useEffect(() => {
    if (product) {
      reset({
        name: product.name || "",
        description: product.description || "",
        sku: product.sku || "",
        sellingPrice: product.sellingPrice?.toString() || "",
        purchasePrice: product.purchasePrice?.toString() || "",
        stock: product.stock?.toString() || "0",
        reorderPoint: product.reorderPoint?.toString() || "0",
      });
    }
  }, [product, reset]);

  // Update mutation with optimistic updates
  const updateMutation = useMutation({
    mutationFn: (data) => updateProduct(productId, data),
    onMutate: async (newData) => {
      // 1. Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.list("products") });

      // 2. Snapshot the previous paginated data object
      const previousProductsData = queryClient.getQueryData(
        queryKeys.list("products")
      );

      // 3. Optimistically update the products array within the object
      queryClient.setQueryData(queryKeys.list("products"), (oldData) => {
        if (!oldData || !oldData.products) {
          return oldData; // Return as-is if data is not in the expected shape
        }

        const updatedProducts = oldData.products.map((p) =>
          p.id === productId
            ? {
                ...p,
                ...newData,
                sellingPrice: parseFloat(newData.sellingPrice),
                purchasePrice: newData.purchasePrice
                  ? parseFloat(newData.purchasePrice)
                  : p.purchasePrice,
                stock: newData.stock ? parseInt(newData.stock) : p.stock,
                reorderPoint: newData.reorderPoint
                  ? parseInt(newData.reorderPoint)
                  : p.reorderPoint,
              }
            : p
        );

        // Return the new object with the updated products array
        return {
          ...oldData,
          products: updatedProducts,
        };
      });

      // 4. Return a context object with the snapshotted value
      return { previousProductsData };
    },
    onError: (err, newData, context) => {
      // 5. Rollback on error
      toast.error("Failed to update product. Restoring previous state.");
      if (context?.previousProductsData) {
        queryClient.setQueryData(
          queryKeys.list("products"),
          context.previousProductsData
        );
      }
    },
    onSettled: () => {
      // 6. Invalidate and refetch to ensure eventual consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.list("products") });
      queryClient.invalidateQueries({
        queryKey: queryKeys.detail("products", productId),
      });
    },
    onSuccess: () => {
      toast.success("Product updated successfully!");
      handleClose();
    },
  });

  /**
   * Handles modal close
   */
  const handleClose = () => {
    setOpen(false);
    router.back();
  };

  /**
   * Handles form submission
   * @param {Object} data - Form data
   */
  const onSubmit = (data) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <VisuallyHidden asChild>
            <DialogTitle>Loading</DialogTitle>
          </VisuallyHidden>
          <div className="flex items-center justify-center p-8">
            <div className="text-sm text-muted-foreground">Loading...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!product) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <VisuallyHidden asChild>
            <DialogTitle>Error</DialogTitle>
          </VisuallyHidden>
          <div className="flex items-center justify-center p-8">
            <div className="text-sm text-red-500">Product not found</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              {...register("name")}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...register("description")} />
          </div>

          {/* SKU */}
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" {...register("sku")} />
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
              />
            </div>
          </div>

          {/* Stock Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input id="stock" type="number" {...register("stock")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reorderPoint">Reorder Point</Label>
              <Input
                id="reorderPoint"
                type="number"
                {...register("reorderPoint")}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
