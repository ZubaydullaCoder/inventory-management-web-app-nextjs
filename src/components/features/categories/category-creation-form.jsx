// /src/components/features/categories/category-creation-form.jsx
"use client";

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
 * Category form validation schema
 */
const CategoryFormSchema = z.object({
  name: z.string().min(1, "Category name is required").max(255),
  description: z.string().optional(),
});

/**
 * Category creation form data
 * @typedef {Object} CategoryFormData
 * @property {string} name - Category name
 * @property {string} [description] - Category description
 */

/**
 * Creates a new category via API
 * @param {CategoryFormData} formData - Form data to submit
 * @returns {Promise<Object>} API response
 */
async function createCategory(formData) {
  const response = await fetch("/api/categories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create category");
  }

  return await response.json();
}

/**
 * Category creation form component
 * Handles form submission and validation for creating new categories
 * @param {Object} props - Component props
 * @param {Function} props.onCategoryCreated - Callback when category is successfully created
 * @returns {JSX.Element} Category creation form
 */
export default function CategoryCreationForm({ onCategoryCreated }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(CategoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Mutation for creating categories
  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: (response) => {
      toast.success("Category created successfully!");
      reset(); // Clear form
      onCategoryCreated(response.data); // Update parent state

      // Focus first input for quick continuation
      setTimeout(() => {
        const firstInput = document.querySelector('input[name="name"]');
        if (firstInput) firstInput.focus();
      }, 100);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create category");
    },
  });

  /**
   * Handles form submission
   * @param {CategoryFormData} data - Form data
   */
  const onSubmit = (data) => {
    createCategoryMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Category</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Category Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Category Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter category name"
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
              placeholder="Category description (optional)"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={createCategoryMutation.isPending}
            className="w-full"
          >
            {createCategoryMutation.isPending
              ? "Saving..."
              : "Save and Add Another"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
