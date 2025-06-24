// /src/app/api/products/[id]/route.js
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getProductById, updateProduct } from "@/lib/services/product-service";

/**
 * Product update schema for validation
 */
const UpdateProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(255).optional(),
  description: z.string().optional(),
  sku: z.string().optional(),
  sellingPrice: z
    .number()
    .positive("Selling price must be positive")
    .optional(),
  purchasePrice: z.number().positive().optional(),
  stock: z.number().int().min(0, "Stock cannot be negative").optional(),
  reorderPoint: z
    .number()
    .int()
    .min(0, "Reorder point cannot be negative")
    .optional(),
  categoryId: z.string().optional(),
  supplierId: z.string().optional(),
});

/**
 * Handles GET requests to fetch a single product
 * GET /api/products/[id]
 * @param {Request} request - The incoming request object
 * @param {Object} params - Route parameters
 * @param {string} params.id - Product ID
 * @returns {Promise<NextResponse>} JSON response with product data
 */
export async function GET(request, { params }) {
  try {
    // Authentication check (Defense in Depth)
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Fetch product via service layer
    const product = await getProductById(session.user.id, id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Product fetch API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Handles PUT requests to update a product
 * PUT /api/products/[id]
 * @param {Request} request - The incoming request object
 * @param {Object} params - Route parameters
 * @param {string} params.id - Product ID
 * @returns {Promise<NextResponse>} JSON response with updated product
 */
export async function PUT(request, { params }) {
  try {
    // Authentication check (Defense in Depth)
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Parse and validate request body
    const body = await request.json();
    const validatedData = UpdateProductSchema.parse(body);

    // Update product via service layer
    const product = await updateProduct(session.user.id, id, validatedData);

    return NextResponse.json({
      success: true,
      data: product,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error("Product update API error:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
