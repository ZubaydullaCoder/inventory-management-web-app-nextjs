// /src/components/features/products/product-creation-form.jsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
 * Product creation form component
 * Handles form submission and validation for creating new products
 * @param {Object} props - Component props
 * @param {Function} props.onProductCreated - Callback when product is successfully created
 * @returns {JSX.Element} Product creation form
 */
export default function ProductCreationForm({ onProductCreated }) {
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

  // Mutation for creating products
  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: (response) => {
      toast.success("Product created successfully!");
      reset(); // Clear form
      onProductCreated(response.data); // Update parent state

      // Focus first input for quick continuation
      setTimeout(() => {
        const firstInput = document.querySelector('input[name="name"]');
        if (firstInput) firstInput.focus();
      }, 100);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create product");
    },
  });

  /**
   * Handles form submission
   * @param {ProductFormData} data - Form data
   */
  const onSubmit = (data) => {
    createProductMutation.mutate(data);
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
