// /src/lib/schemas/product-schemas.js
import { z } from "zod";
import { normalizeName } from "@/lib/utils";

/**
 * Product creation form validation schema
 */
export const ProductFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Product name is required")
    .max(255)
    .transform(normalizeName),
  description: z.string().trim().optional(),
  sku: z.string().trim().optional(),
  sellingPrice: z.string().min(1, "Selling price is required"),
  purchasePrice: z.string().optional(),
  stock: z.string().optional(),
  reorderPoint: z.string().optional(),
  unit: z.string().min(1, "Selling unit is required"),
  categoryId: z.string().optional(),
  supplierId: z.string().optional(),
});

/**
 * Product edit form validation schema
 */
export const EditProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Product name is required")
    .max(255)
    .transform(normalizeName),
  description: z.string().trim().optional(),
  sku: z.string().trim().optional(),
  sellingPrice: z.string().min(1, "Selling price is required"),
  purchasePrice: z.string().optional(),
  stock: z.string().optional(),
  reorderPoint: z.string().optional(),
  unit: z.string().min(1, "Selling unit is required"),
  categoryId: z.string().optional(),
});

/**
 * Product creation API validation schema
 */
export const CreateProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(255),
  description: z.string().optional(),
  sku: z.string().optional(),
  sellingPrice: z.number().positive("Selling price must be positive"),
  purchasePrice: z.number().positive().optional(),
  stock: z.number().int().min(0, "Stock cannot be negative").optional(),
  reorderPoint: z
    .number()
    .int()
    .min(0, "Reorder point cannot be negative")
    .optional(),
  unit: z.string().optional(),
  categoryId: z.string().optional(),
  supplierId: z.string().optional(),
});

/**
 * Common selling units for products
 */
export const SELLING_UNITS = [
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
