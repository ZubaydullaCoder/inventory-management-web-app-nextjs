// /src/lib/schemas/category-schemas.js
import { z } from "zod";
import { normalizeName } from "@/lib/utils";

/**
 * Category form validation schema for creation and editing
 */
export const CategoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required")
    .max(255, "Category name must be less than 255 characters")
    .transform(normalizeName),
  description: z.string().trim().optional(),
});
