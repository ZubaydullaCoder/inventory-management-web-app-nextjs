// /src/components/features/products/product-edit-modal.jsx
"use client";

import { useState, useEffect } from "react";
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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { queryKeys } from "@/lib/queryKeys";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useDebouncedNameValidation } from "@/lib/hooks/use-debounced-name-validation";

/**
 * Common selling units for products
 */
const SELLING_UNITS = [
  { value: "piece", label: "Piece" },
  { value: "kg", label: "Kilogram (kg)" },
  { value: "g", label: "Gram (g)" },
  { value: "l", label: "Liter (l)" },
  { value: "ml", label: "Milliliter (ml)" },
  { value: "m", label: "Meter (m)" },
  { value: "cm", label: "Centimeter (cm)" },
  { value: "pack", label: "Pack" },
  { value: "box", label: "Box" },
];

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
  unit: z.string().min(1, "Selling unit is required"),
  categoryId: z.string().optional(),
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
 * Fetches categories from API
 * @returns {Promise<Array>} Array of categories
 */
async function fetchCategories() {
  const response = await fetch("/api/categories");
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
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
    // Don't send empty categoryId
    categoryId:
      productData.categoryId === "uncategorized"
        ? undefined
        : productData.categoryId,
  };

  const response = await fetch(`/api/products/${productId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(apiData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update product");
  }

  return await response.json();
}

/**
 * Deletes a product via API
 * @param {string} productId - Product ID to delete
 * @returns {Promise<Object>} Delete response
 */
async function deleteProduct(productId) {
  const response = await fetch(`/api/products/${productId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete product");
  }

  return await response.json();
}

/**
 * Reusable modal for editing a product.
 * @param {Object} props
 * @param {string} props.productId - The ID of the product to edit
 * @param {boolean} props.isOpen - Controls if the modal is open
 * @param {Function} props.onClose - Callback to close the modal
 */
export default function ProductEditModal({ productId, isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: queryKeys.detail("products", productId),
    queryFn: () => fetchProduct(productId),
    enabled: !!productId && isOpen,
  });

  // Fetch categories
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: queryKeys.list("categories"),
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(EditProductSchema),
    defaultValues: {
      name: "",
      description: "",
      sku: "",
      sellingPrice: "",
      purchasePrice: "",
      stock: "0",
      reorderPoint: "0",
      unit: "piece",
      categoryId: "uncategorized",
    },
  });

  // Watch the name field for validation
  const watchedName = watch("name");

  // Debounced name validation (exclude current product)
  const {
    isChecking: isCheckingName,
    isUnique,
    error: nameValidationError,
    hasChecked,
  } = useDebouncedNameValidation(watchedName, productId);

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
        unit: SELLING_UNITS.some((u) => u.value === product.unit)
          ? product.unit
          : "piece",
        categoryId: product.categoryId || "uncategorized",
      });
    } else {
      reset();
    }
  }, [product, reset]);

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
      // onClose is now called optimistically in onSubmit
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

  const onSubmit = (data) => {
    // Check name uniqueness if name has changed
    if (product && data.name !== product.name && !isUnique && hasChecked) {
      toast.error("Please use a unique product name");
      return;
    }

    onClose(); // Optimistically close the modal immediately
    updateMutation.mutate(data);
  };

  const handleDelete = () => {
    setShowDeleteDialog(false);
    deleteMutation.mutate();
  };

  /**
   * Renders name validation indicator
   */
  const renderNameValidation = () => {
    if (!watchedName || watchedName.trim().length === 0) return null;
    if (product && watchedName === product.name) return null; // No need to validate unchanged name

    if (isCheckingName) {
      return (
        <div className="flex items-center text-sm text-blue-600">
          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          Checking availability...
        </div>
      );
    }

    if (nameValidationError) {
      return (
        <div className="flex items-center text-sm text-red-600">
          <XCircle className="w-4 h-4 mr-1" />
          Error checking name
        </div>
      );
    }

    if (hasChecked && isUnique) {
      return (
        <div className="flex items-center text-sm text-green-600">
          <CheckCircle className="w-4 h-4 mr-1" />
          Name is available
        </div>
      );
    }

    if (hasChecked && !isUnique) {
      return (
        <div className="flex items-center text-sm text-red-600">
          <XCircle className="w-4 h-4 mr-1" />A product with this name already
          exists
        </div>
      );
    }

    return null;
  };

  // Derived state for button logic clarity
  const hasNameChanged = product && watchedName !== product.name;
  const isNameInvalid = hasNameChanged && !isUnique && hasChecked;
  const isNameBeingChecked = hasNameChanged && isCheckingName;

  if (isLoading && isOpen) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <VisuallyHidden asChild>
            <DialogTitle>Loading</DialogTitle>
          </VisuallyHidden>
          <div className="p-8 text-center">Loading...</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the details for this product.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                {...register("name")}
                className={
                  errors.name ||
                  (!isUnique &&
                    hasChecked &&
                    product &&
                    watchedName !== product.name)
                    ? "border-red-500"
                    : ""
                }
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
              {renderNameValidation()}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <Select
                onValueChange={(value) => setValue("categoryId", value)}
                value={watch("categoryId") || "uncategorized"}
                defaultValue={watch("categoryId") || "uncategorized"}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uncategorized">Uncategorized</SelectItem>
                  {isLoadingCategories ? (
                    <SelectItem disabled value="loading">
                      Loading categories...
                    </SelectItem>
                  ) : (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
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

            {/* Selling Unit */}
            <div className="space-y-2">
              <Label htmlFor="unit">Selling Unit *</Label>
              <Select
                onValueChange={(value) => setValue("unit", value)}
                value={watch("unit") || "piece"}
                defaultValue={watch("unit") || "piece"}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SELLING_UNITS.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={updateMutation.isPending || deleteMutation.isPending}
              >
                Delete
              </Button>
              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    updateMutation.isPending ||
                    deleteMutation.isPending ||
                    isNameBeingChecked ||
                    isNameInvalid
                  }
                >
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{product?.name}"? This action
              cannot be undone. If this product has transaction history, the
              deletion will be blocked.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
