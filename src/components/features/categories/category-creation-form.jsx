// /src/components/features/categories/category-creation-form.jsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCategoryCreateMutation } from "@/hooks/use-category-create-mutation";
import { useDebouncedCategoryNameValidation } from "@/hooks/use-debounced-category-name-validation";
import { CategoryFormSchema } from "@/lib/schemas/category-schemas";
import CategoryNameValidation from "./category-name-validation";

/**
 * Category creation form component with optimistic updates
 * Handles form submission and validation for creating new categories
 * @param {Object} props - Component props
 * @param {Function} [props.onCategoryCreated] - Optional callback when category is successfully created
 * @returns {JSX.Element} Category creation form
 */
export default function CategoryCreationForm({ onCategoryCreated }) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(CategoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const watchedName = watch("name");
  const nameValidation = useDebouncedCategoryNameValidation(watchedName);
  const { createCategoryMutation } =
    useCategoryCreateMutation(onCategoryCreated);

  /**
   * Handles form submission
   * @param {Object} data - Form data (already trimmed by Zod schema)
   */
  const onSubmit = (data) => {
    // Check name uniqueness before submitting
    if (
      !nameValidation.isUnique &&
      nameValidation.hasChecked &&
      data.name.length > 0
    ) {
      toast.error("Please use a unique category name");
      return;
    }

    createCategoryMutation.mutate(data);

    // Clear form and focus first input for quick continuation
    reset();
    setTimeout(() => {
      const firstInput = document.querySelector('input[name="name"]');
      if (firstInput) firstInput.focus();
    }, 100);
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
              className={
                errors.name ||
                (!nameValidation.isUnique &&
                  nameValidation.hasChecked &&
                  watchedName.trim().length > 0)
                  ? "border-red-500"
                  : ""
              }
              placeholder="Enter category name"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
            <CategoryNameValidation
              watchedName={watchedName}
              {...nameValidation}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              {...register("description")}
              placeholder="Category description (optional)"
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={
              createCategoryMutation.isPending ||
              nameValidation.isChecking ||
              (!nameValidation.isUnique &&
                nameValidation.hasChecked &&
                watchedName.trim().length > 0)
            }
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
