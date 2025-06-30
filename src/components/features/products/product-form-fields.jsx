// /src/components/features/products/product-form-fields.jsx
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SELLING_UNITS } from "@/lib/schemas/product-schemas";
import ProductNameValidation from "./product-name-validation";

/**
 * Product form fields component for reusability
 * @param {Object} props
 * @param {Object} props.register - React Hook Form register function
 * @param {Object} props.errors - Form validation errors
 * @param {Function} props.setValue - React Hook Form setValue function
 * @param {Function} props.watch - React Hook Form watch function
 * @param {Array} props.categories - Available categories
 * @param {boolean} props.isLoadingCategories - Categories loading state
 * @param {Object} props.nameValidation - Name validation state
 * @param {Object} props.product - Current product data
 * @returns {JSX.Element} Form fields component
 */
export default function ProductFormFields({
  register,
  errors,
  setValue,
  watch,
  categories,
  isLoadingCategories,
  nameValidation,
  product,
}) {
  const watchedName = watch("name");

  return (
    <>
      {/* Product Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Product Name *</Label>
        <Input
          id="name"
          {...register("name")}
          className={
            errors.name ||
            (!nameValidation.isUnique &&
              nameValidation.hasChecked &&
              product &&
              watchedName !== product.name)
              ? "border-red-500"
              : ""
          }
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
        <ProductNameValidation
          watchedName={watchedName}
          product={product}
          {...nameValidation}
        />
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
        <Input
          id="description"
          {...register("description")}
          placeholder="Product description (optional)"
        />
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
    </>
  );
}
