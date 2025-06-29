// /src/components/features/products/product-edit-modal.jsx
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
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useDebouncedNameValidation } from "@/hooks/use-debounced-name-validation";
import { useProductEdit } from "@/hooks/use-product-edit";
import {
  EditProductSchema,
  SELLING_UNITS,
  normalizeName,
} from "@/lib/schemas/product-schemas";
import ProductFormFields from "./product-form-fields";
import ProductDeleteDialog from "./product-delete-dialog";

/**
 * Reusable modal for editing a product.
 * @param {Object} props
 * @param {string} props.productId - The ID of the product to edit
 * @param {boolean} props.isOpen - Controls if the modal is open
 * @param {Function} props.onClose - Callback to close the modal
 */
export default function ProductEditModal({ productId, isOpen, onClose }) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  // Custom dirty state for meaningful changes
  const [isFormActuallyDirty, setIsFormActuallyDirty] = useState(false);

  const {
    product,
    categories,
    isLoading,
    isLoadingCategories,
    updateMutation,
    deleteMutation,
    handleUpdate,
    handleDelete,
  } = useProductEdit(productId, isOpen, onClose);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(EditProductSchema),
  });

  // Watch the name field for validation
  const watchedName = watch("name");
  // Watch all form values for custom dirty check
  const watchedValues = watch();

  // Pass the original product name to the hook for initial-state-aware validation
  const nameValidation = useDebouncedNameValidation(
    watchedName,
    product?.name,
    productId
  );

  useEffect(() => {
    if (product) {
      const defaultValues = {
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
      };
      reset(defaultValues);
      setIsFormActuallyDirty(false);
    }
  }, [product, reset]);

  // Custom dirty check: only mark dirty if a meaningful (normalized) value changed
  useEffect(() => {
    if (!product) return;

    const defaultValues = {
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
    };

    let dirty = false;
    for (const key in defaultValues) {
      const formValue = watchedValues[key];
      const originalValue = defaultValues[key];

      // Compare normalized string values for meaningful changes
      if (key === "name" || key === "description" || key === "sku") {
        if (normalizeName(formValue) !== normalizeName(originalValue)) {
          dirty = true;
          break;
        }
      } else if (formValue?.toString() !== (originalValue ?? "").toString()) {
        dirty = true;
        break;
      }
    }
    setIsFormActuallyDirty(dirty);
  }, [watchedValues, product]);

  const onSubmit = (data) => {
    // Check name uniqueness if name has changed
    // Note: data.name is already normalized by Zod schema's .transform()
    if (
      product &&
      data.name !== product.name &&
      !nameValidation.isUnique &&
      nameValidation.hasChecked
    ) {
      toast.error("Please use a unique product name");
      return;
    }
    handleUpdate(data);
  };

  const handleDeleteConfirm = () => {
    handleDelete();
  };

  // Derived state logic now uses normalization for comparison
  const hasNameChanged =
    product && normalizeName(watchedName) !== normalizeName(product.name);
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
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the details for this product.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <ProductFormFields
              register={register}
              errors={errors}
              setValue={setValue}
              watch={watch}
              categories={categories}
              isLoadingCategories={isLoadingCategories}
              nameValidation={nameValidation}
              product={product}
            />

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

      <ProductDeleteDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        productName={product?.name || ""}
      />
    </>
  );
}
