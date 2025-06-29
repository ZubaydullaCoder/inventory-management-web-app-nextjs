// /src/components/features/products/product-creation-form.jsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { queryKeys } from "@/lib/queryKeys";
import { useDebouncedNameValidation } from "@/hooks/use-debounced-name-validation";
import {
  ProductFormSchema,
  SELLING_UNITS,
} from "@/lib/schemas/product-schemas";

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
 * @property {string} unit - Product selling unit
 * @property {string} [categoryId] - Category ID (optional)
 * @property {string} [supplierId] - Supplier ID (optional)
 */

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
    // Don't send empty categoryId
    categoryId:
      formData.categoryId === "uncategorized" ? undefined : formData.categoryId,
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
    watch,
    setValue,
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
      unit: "piece",
      categoryId: "uncategorized",
    },
  });

  // Watch the name field for validation
  const watchedName = watch("name");

  // Debounced name validation
  const {
    isChecking: isCheckingName,
    isUnique,
    error: nameValidationError,
    hasChecked,
  } = useDebouncedNameValidation(watchedName);

  // Fetch categories
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: queryKeys.list("categories"),
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mutation with optimistic updates
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

      // 3. Create optimistic product with temporary data
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

      // 4. Optimistically update the session cache
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

  /**
   * Handles form submission
   * @param {ProductFormData} data - Form data (already trimmed by Zod schema)
   */
  const onSubmit = (data) => {
    // Check name uniqueness before submitting
    // Note: data.name is already trimmed by Zod schema
    if (!isUnique && hasChecked && data.name.length > 0) {
      toast.error("Please use a unique product name");
      return;
    }

    createProductMutation.mutate(data);

    // Clear form and focus first input for quick continuation
    reset();
    setTimeout(() => {
      const firstInput = document.querySelector('input[name="name"]');
      if (firstInput) firstInput.focus();
    }, 100);
  };

  /**
   * Renders name validation indicator
   */
  const renderNameValidation = () => {
    if (!watchedName || watchedName.trim().length === 0) return null;

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
              className={
                errors.name || (!isUnique && hasChecked) ? "border-red-500" : ""
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
              defaultValue="uncategorized"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
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

          {/* Selling Unit */}
          <div className="space-y-2">
            <Label htmlFor="unit">Selling Unit *</Label>
            <Select
              onValueChange={(value) => setValue("unit", value)}
              defaultValue="piece"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select selling unit" />
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
            disabled={
              createProductMutation.isPending ||
              isCheckingName ||
              (!isUnique && hasChecked && watchedName.trim().length > 0)
            }
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
