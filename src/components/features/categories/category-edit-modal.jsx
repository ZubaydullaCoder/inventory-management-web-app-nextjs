// /src/components/features/categories/category-edit-modal.jsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useCategoryEdit } from "@/hooks/use-category-edit";
import { useDebouncedCategoryNameValidation } from "@/hooks/use-debounced-category-name-validation";
import { CategoryFormSchema } from "@/lib/schemas/category-schemas";
import { normalizeName } from "@/lib/utils";
import CategoryNameValidation from "./category-name-validation";
import CategoryDeleteDialog from "./category-delete-dialog";

/**
 * Reusable modal for editing a category.
 * @param {Object} props
 * @param {string} props.categoryId - The ID of the category to edit
 * @param {boolean} props.isOpen - Controls if the modal is open
 * @param {Function} props.onClose - Callback to close the modal
 */
export default function CategoryEditModal({ categoryId, isOpen, onClose }) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  // Custom dirty state for meaningful changes
  const [isFormActuallyDirty, setIsFormActuallyDirty] = useState(false);

  const {
    category,
    isLoading,
    updateMutation,
    deleteMutation,
    handleUpdate,
    handleDelete,
  } = useCategoryEdit(categoryId, isOpen, onClose);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(CategoryFormSchema),
  });

  // Watch the name field for validation
  const watchedName = watch("name");
  // Watch all form values for custom dirty check
  const watchedValues = watch();

  // Pass the original category name to the hook for initial-state-aware validation
  const nameValidation = useDebouncedCategoryNameValidation(
    watchedName,
    category?.name,
    categoryId
  );

  useEffect(() => {
    if (category) {
      const defaultValues = {
        name: category.name || "",
        description: category.description || "",
      };
      reset(defaultValues);
      setIsFormActuallyDirty(false);
    }
  }, [category, reset]);

  // Custom dirty check: only mark dirty if a meaningful (normalized) value changed
  useEffect(() => {
    if (!category) return;

    const defaultValues = {
      name: category.name || "",
      description: category.description || "",
    };

    let dirty = false;
    for (const key in defaultValues) {
      const formValue = watchedValues[key];
      const originalValue = defaultValues[key];

      // Compare normalized string values for meaningful changes
      if (normalizeName(formValue) !== normalizeName(originalValue)) {
        dirty = true;
        break;
      }
    }
    setIsFormActuallyDirty(dirty);
  }, [watchedValues, category]);

  const onSubmit = (data) => {
    // Check name uniqueness if name has changed
    // Note: data.name is already normalized by Zod schema's .transform()
    if (
      category &&
      data.name !== category.name &&
      !nameValidation.isUnique &&
      nameValidation.hasChecked
    ) {
      toast.error("Please use a unique category name");
      return;
    }
    handleUpdate(data);
  };

  const handleDeleteConfirm = () => {
    handleDelete();
  };

  // Derived state logic now uses normalization for comparison
  const hasNameChanged =
    category && normalizeName(watchedName) !== normalizeName(category.name);
  const isNameInvalid =
    hasNameChanged && !nameValidation.isUnique && nameValidation.hasChecked;
  const isNameBeingChecked = hasNameChanged && nameValidation.isChecking;

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
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the details for this category.
            </DialogDescription>
          </DialogHeader>
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
                    category &&
                    watchedName !== category.name)
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
                category={category}
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
                    !isFormActuallyDirty ||
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

      <CategoryDeleteDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        categoryName={category?.name || ""}
        productCount={category?._count?.products || 0}
      />
    </>
  );
}
