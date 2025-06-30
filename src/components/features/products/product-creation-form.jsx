// /src/components/features/products/product-creation-form.jsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDebouncedNameValidation } from "@/hooks/use-debounced-product-name-validation";
import { useProductCreation } from "@/hooks/use-product-create-mutation";
import { ProductFormSchema } from "@/lib/schemas/product-schemas";
import ProductFormFields from "./product-form-fields";

/**
 * Product creation form component with optimistic updates
 * Handles form submission and validation for creating new products
 * @param {Object} props - Component props
 * @param {Function} [props.onProductCreated] - Optional callback when product is successfully created
 * @returns {JSX.Element} Product creation form
 */
export default function ProductCreationForm({ onProductCreated }) {
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

  const watchedName = watch("name");
  const nameValidation = useDebouncedNameValidation(watchedName);
  const { categories, isLoadingCategories, createProductMutation } =
    useProductCreation(onProductCreated);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Product</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <ProductFormFields
            register={register}
            errors={errors}
            setValue={setValue}
            watch={watch}
            categories={categories}
            isLoadingCategories={isLoadingCategories}
            nameValidation={nameValidation}
          />

          <Button
            type="submit"
            disabled={
              createProductMutation.isPending ||
              nameValidation.isChecking ||
              (!nameValidation.isUnique &&
                nameValidation.hasChecked &&
                watchedName.trim().length > 0)
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
